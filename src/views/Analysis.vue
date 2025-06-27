<template>
  <div class="analysis-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <!-- 分析进行中 -->
    <div v-else-if="!isCompleted && !isFailed" class="progress-container">
      <div class="progress-wrapper">
        <ProgressIndicator :task="currentTask" :error-message="analysisError || undefined" />
        
        <div class="progress-actions">
          <el-button @click="goHome">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <el-button type="primary" @click="refreshStatus" :loading="isRefreshing">
            <el-icon><Refresh /></el-icon>
            刷新状态
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 分析完成 - 双栏布局 -->
    <div v-else-if="isCompleted" class="analysis-result">
      <div class="result-header">
        <div class="header-left">
          <h2 class="result-title">
            <el-icon><Folder /></el-icon>
            {{ analysisResult?.document_name || '分析结果' }}
          </h2>
          <p class="result-time">
            分析完成时间：{{ formatTime(analysisResult?.analysis_time) }}
          </p>
        </div>
        <div class="header-actions">
          <el-button @click="toggleLayout" :type="!isLayoutSwapped ? 'primary' : 'default'">
            <el-icon><Switch /></el-icon>
            切换布局
          </el-button>
          <el-button @click="goHome">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
          <el-button type="primary" @click="downloadReport">
            <el-icon><Download /></el-icon>
            下载报告
          </el-button>
        </div>
      </div>
      
      <div ref="dualPaneContainer" class="dual-pane-layout" :class="{ 'layout-swapped': isLayoutSwapped }">
        <!-- 左栏：根据布局状态显示不同内容 -->
        <div class="left-pane" :class="{ 'pdf-fixed': isPdfFixed && !isLayoutSwapped }">
          <el-card class="pdf-viewer-card" shadow="never" v-if="!isLayoutSwapped">
            <template #header>
              <div class="card-header">
                <el-icon><View /></el-icon>
                <span>原文预览</span>
              </div>
            </template>
            <div class="pdf-viewer" :style="pdfViewerStyle">
              <SimplePDFViewer :file-id="fileId" />
            </div>
          </el-card>

          <el-card class="analysis-result-card" shadow="never" v-else>
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>分析结果</span>
              </div>
            </template>
            <div class="analysis-content">
              <AnalysisResult :result="analysisResult" />
            </div>
          </el-card>
        </div>

        <!-- 右栏：根据布局状态显示不同内容 -->
        <div class="right-pane" :class="{ 'pdf-fixed': isPdfFixed && isLayoutSwapped }">
          <el-card class="analysis-result-card" shadow="never" v-if="!isLayoutSwapped">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>分析结果</span>
              </div>
            </template>
            <div class="analysis-content">
              <AnalysisResult :result="analysisResult" />
            </div>
          </el-card>

          <el-card class="pdf-viewer-card" shadow="never" v-else>
            <template #header>
              <div class="card-header">
                <el-icon><View /></el-icon>
                <span>原文预览</span>
              </div>
            </template>
            <div class="pdf-viewer" :style="pdfViewerStyle">
              <SimplePDFViewer :file-id="fileId" />
            </div>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 分析失败 -->
    <div v-else-if="isFailed" class="error-container">
      <el-result
        icon="error"
        title="分析失败"
        :sub-title="analysisError || '未知错误'"
      >
        <template #extra>
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="refreshStatus">重试</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '../stores/analysis'
import { useSessionStore } from '../stores/session'
import { getAnalysisStatus } from '../api'
import ProgressIndicator from '../components/ProgressIndicator.vue'
import SimplePDFViewer from '../components/SimplePDFViewer.vue'
import AnalysisResult from '../components/AnalysisResult.vue'

// 路由和状态
const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()

// 响应式数据
const isLoading = ref(true)
const isRefreshing = ref(false)
const pollingTimer = ref<number | null>(null)

// 布局和滚动相关
const isLayoutSwapped = ref(true)
const isPdfFixed = ref(false)
const dualPaneContainer = ref<HTMLElement>()
const headerHeight = 160 // 头部高度，根据实际情况调整

// Props
const taskId = computed(() => route.params.taskId as string)

// 计算属性
const currentTask = computed(() => analysisStore.currentTask)
const analysisResult = computed(() => analysisStore.analysisResult)
const analysisError = computed(() => analysisStore.analysisError)
const isCompleted = computed(() => analysisStore.isCompleted)
const isFailed = computed(() => analysisStore.isFailed)

const fileId = computed(() => {
  // 从任务中获取文件ID，这里需要根据实际API响应调整
  return currentTask.value?.file_id || ''
})

// PDF 查看器样式
const pdfViewerStyle = computed(() => {
  if (isPdfFixed.value) {
    // 固定时使用更大的高度，减少标题栏占用的空间
    return {
      height: `calc(100vh - 40px)`, // 减少顶部空间占用
      overflow: 'auto'
    }
  }
  return {
    height: 'calc(100% - 60px)',
    overflow: 'auto'
  }
})

// 方法
const fetchTaskStatus = async () => {
  try {
    const task = await getAnalysisStatus(taskId.value)
    const oldStep = currentTask.value?.progress?.current_step
    const oldAgentProgress = currentTask.value?.progress?.agent_progress

    analysisStore.updateTaskStatus(task)

    // 检测并行进度变化
    if (task.progress?.agent_progress && oldAgentProgress) {
      for (const [agent, progress] of Object.entries(task.progress.agent_progress)) {
        const oldProgress = (oldAgentProgress as Record<string, number>)[agent]
        if (oldProgress !== progress) {
          const agentName = getAgentDisplayName(agent)
          console.log(`智能体 ${agentName} 进度更新: ${oldProgress || 0}% → ${progress}%`)
        }
      }
    } else if (task.progress?.agent_progress && !oldAgentProgress) {
      // 首次获取到并行进度数据
      console.log('开始并行处理，智能体进度:', task.progress.agent_progress)
    }

    // 原有的步骤变化检测
    if (oldStep && oldStep !== task.progress?.current_step) {
      console.log(`分析进度更新: ${oldStep} → ${task.progress?.current_step}`)
    }

    // 检测部分智能体失败的场景
    if (task.progress?.current_step === 'partial_extraction_completed') {
      console.warn('部分智能体提取完成，可能存在失败的智能体')
    }

    // 如果任务完成或失败，停止轮询
    if (task.status === 'completed' || task.status === 'failed') {
      stopPolling()
    }

  } catch (error: any) {
    console.error('Fetch task status error:', error)
    analysisStore.setAnalysisError(error.error_message || '获取任务状态失败')
    stopPolling()
  }
}

const refreshStatus = async () => {
  isRefreshing.value = true
  try {
    await fetchTaskStatus()
  } finally {
    isRefreshing.value = false
  }
}

const startPolling = () => {
  // 简化的轮询逻辑，每5秒查询一次
  const poll = async () => {
    try {
      await fetchTaskStatus()

      // 如果任务已完成或失败，停止轮询
      if (currentTask.value?.status === 'completed' || currentTask.value?.status === 'failed') {
        return
      }

      // 继续轮询
      pollingTimer.value = window.setTimeout(poll, 5000)
    } catch (error) {
      console.error('Polling error:', error)
      // 出错时延迟重试
      pollingTimer.value = window.setTimeout(poll, 10000)
    }
  }

  // 延迟开始第一次轮询，避免与初始加载冲突
  pollingTimer.value = window.setTimeout(poll, 3000)
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearTimeout(pollingTimer.value)
    pollingTimer.value = null
  }
}

const goHome = () => {
  // 清除当前会话，确保返回首页时使用新的会话ID
  try {
    const sessionStore = useSessionStore()
    sessionStore.clearSession()
    console.log('返回首页：已清除会话，将使用新的会话ID')
  } catch (error) {
    console.warn('清除会话失败:', error)
  }

  router.push('/')
}

const downloadReport = () => {
  try {
    // 检查任务状态
    if (!currentTask.value) {
      ElMessage.error('任务信息不存在')
      return
    }

    if (currentTask.value.status !== 'completed') {
      ElMessage.warning('任务尚未完成，无法下载报告')
      return
    }

    // 构建下载URL
    const downloadUrl = `http://localhost:8000/api/download-report/${taskId.value}?format=md`

    // 使用window.open触发下载
    window.open(downloadUrl, '_blank')

    ElMessage.success('开始下载分析报告')

  } catch (error: any) {
    console.error('Download report error:', error)
    ElMessage.error('下载报告失败')
  }
}

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN')
  } catch {
    return timeStr
  }
}

// 获取智能体显示名称
const getAgentDisplayName = (agentKey: string): string => {
  const agentNames: Record<string, string> = {
    'basic_info_extractor': '基础信息提取',
    'scoring_analyzer': '评分标准分析',
    'contract_info_extractor': '合同信息提取'
  }
  return agentNames[agentKey] || agentKey
}

// 布局切换
const toggleLayout = () => {
  isLayoutSwapped.value = !isLayoutSwapped.value
  // 切换布局时重置PDF固定状态
  isPdfFixed.value = false

  // 立即移除固定布局的CSS类
  if (dualPaneContainer.value) {
    dualPaneContainer.value.classList.remove('has-fixed-pdf')
  }

  // 确保DOM更新后重新检查滚动状态
  nextTick(() => {
    handleScroll()
  })
}

// 滚动处理
const handleScroll = () => {
  if (!dualPaneContainer.value) return

  const rect = dualPaneContainer.value.getBoundingClientRect()
  // 添加一个小的缓冲区，避免频繁切换
  const shouldFixPdf = rect.top <= -5

  if (shouldFixPdf !== isPdfFixed.value) {
    isPdfFixed.value = shouldFixPdf

    // 更新容器的CSS类来管理布局状态
    nextTick(() => {
      if (dualPaneContainer.value) {
        if (shouldFixPdf) {
          dualPaneContainer.value.classList.add('has-fixed-pdf')
        } else {
          dualPaneContainer.value.classList.remove('has-fixed-pdf')
        }
      }
    })
  }
}

// 节流函数
const throttle = (func: Function, delay: number) => {
  let timeoutId: number | null = null
  let lastExecTime = 0
  return function (...args: any[]) {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

const throttledHandleScroll = throttle(handleScroll, 32) // 降低频率，减少性能影响

// 生命周期
onMounted(async () => {
  console.log('Analysis page mounted with taskId:', taskId.value)

  if (!taskId.value) {
    console.error('No taskId provided')
    ElMessage.error('任务ID缺失')
    router.push('/')
    return
  }

  try {
    // 首次加载任务状态
    await fetchTaskStatus()

    // 检查任务状态并决定是否需要轮询
    if (currentTask.value) {
      const status = currentTask.value.status
      console.log('Current task status:', status)

      if (status === 'completed') {
        // 任务已完成，确保分析结果已设置
        if (currentTask.value.result) {
          analysisStore.analysisResult = currentTask.value.result
          console.log('Analysis result loaded from completed task')
        }
        // 不需要轮询，直接显示结果
      } else if (status === 'failed') {
        // 任务失败，显示错误信息
        if (currentTask.value.error_message) {
          analysisStore.setAnalysisError(currentTask.value.error_message)
        }
        // 不需要轮询
      } else {
        // 任务还在进行中，开始轮询
        console.log('Task is in progress, starting polling...')

        // 如果当前有并行进度数据，记录初始状态
        if (currentTask.value.progress?.agent_progress) {
          console.log('当前并行进度状态:', currentTask.value.progress.agent_progress)
        }

        startPolling()
      }
    }

  } catch (error: any) {
    console.error('Initial load error:', error)
    ElMessage.error(error.error_message || '加载分析任务失败')
    // 如果加载失败，可能是网络问题，尝试重新获取
    setTimeout(() => {
      if (!currentTask.value) {
        console.log('Retrying to fetch task status...')
        fetchTaskStatus().catch(console.error)
      }
    }, 3000)
  } finally {
    isLoading.value = false
  }

  // 添加滚动监听
  nextTick(() => {
    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll() // 初始检查
  })
})

onUnmounted(() => {
  stopPolling()
  window.removeEventListener('scroll', throttledHandleScroll)
})
</script>

<style scoped>
.analysis-container {
  min-height: calc(100vh - 60px);
  background: transparent;
}

/* 加载状态 */
.loading-container {
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin: 20px;
}

/* 进度容器 */
.progress-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.progress-wrapper {
  max-width: 500px;
  width: 100%;
}

.progress-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

/* 分析结果 */
.analysis-result {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.result-time {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 双栏布局 */
.dual-pane-layout {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 160px);
  gap: 1px;
  background: rgba(0, 0, 0, 0.1);
  position: relative;
}

.left-pane,
.right-pane {
  flex: 1;
  background: white;
  position: relative;
}

/* PDF固定状态 */
.pdf-fixed {
  position: fixed !important;
  top: 0;
  width: 50% !important;
  height: 100vh !important;
  z-index: 100;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 当PDF固定时，调整双栏布局容器 */
.dual-pane-layout.has-fixed-pdf {
  position: relative;
}

/* 默认布局（左侧原文，右侧分析）：左侧PDF固定时 */
.dual-pane-layout:not(.layout-swapped) .left-pane.pdf-fixed {
  left: 0 !important;
}

.dual-pane-layout:not(.layout-swapped).has-fixed-pdf .right-pane {
  margin-left: 50% !important;
  width: 50% !important;
  flex: none !important;
}

/* 切换布局（左侧分析，右侧原文）：右侧PDF固定时 */
.layout-swapped .right-pane.pdf-fixed {
  right: 0 !important;
}

.layout-swapped.has-fixed-pdf .left-pane {
  margin-right: 50% !important;
  width: 50% !important;
  flex: none !important;
}

/* 确保内容不会溢出 */
.dual-pane-layout .left-pane,
.dual-pane-layout .right-pane {
  overflow: hidden;
  box-sizing: border-box;
}

.dual-pane-layout .analysis-content,
.dual-pane-layout .pdf-viewer {
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 确保卡片内容不超出边界 */
.dual-pane-layout .el-card {
  height: 100%;
  box-sizing: border-box;
}

.dual-pane-layout .el-card :deep(.el-card__body) {
  box-sizing: border-box;
  overflow: hidden;
}

/* 确保分析结果内的所有内容都有正确的边界 */
.analysis-content :deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}

.analysis-content :deep(.el-tabs__content) {
  overflow: hidden;
}

.analysis-content :deep(.el-tab-pane) {
  overflow-x: hidden;
  word-wrap: break-word;
}

.pdf-viewer-card,
.analysis-result-card {
  height: 100%;
  border: none;
  border-radius: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.pdf-viewer {
  height: calc(100% - 60px);
  overflow: auto;
}

.analysis-content {
  height: calc(100% - 60px);
  overflow: auto;
  padding: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

/* PDF固定时的特殊样式 */
.pdf-fixed .pdf-viewer {
  height: calc(100vh - 40px) !important;
}

.pdf-fixed .pdf-viewer-card {
  height: 100vh !important;
  border: none;
  border-radius: 0;
}

/* PDF固定时优化卡片头部 */
.pdf-fixed .pdf-viewer-card :deep(.el-card__header) {
  padding: 8px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.pdf-fixed .pdf-viewer-card :deep(.el-card__body) {
  padding: 0;
  height: calc(100vh - 40px);
}

/* 错误容器 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .dual-pane-layout {
    flex-direction: column;
    height: auto;
  }

  .left-pane,
  .right-pane {
    height: 50vh;
  }

  /* 移动端禁用PDF固定功能 */
  .pdf-fixed {
    position: relative !important;
    width: 100% !important;
    height: 50vh !important;
  }

  .dual-pane-layout:not(.layout-swapped).has-fixed-pdf .right-pane,
  .layout-swapped.has-fixed-pdf .left-pane {
    margin: 0 !important;
    width: 100% !important;
    flex: 1 !important;
  }

  .result-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .analysis-container {
    min-height: calc(100vh - 60px);
  }

  .dual-pane-layout {
    min-height: auto;
  }
  
  .left-pane,
  .right-pane {
    height: 400px;
  }
  
  .progress-container {
    min-height: auto;
    padding: 20px 10px;
  }
}
</style>
