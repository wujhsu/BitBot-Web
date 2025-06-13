<template>
  <div class="analysis-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>
    
    <!-- 分析进行中 -->
    <div v-else-if="!isCompleted && !isFailed" class="progress-container">
      <div class="progress-wrapper">
        <ProgressIndicator :task="currentTask" :error-message="analysisError" />
        
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
            <el-icon><Document /></el-icon>
            {{ analysisResult?.document_name || '分析结果' }}
          </h2>
          <p class="result-time">
            分析完成时间：{{ formatTime(analysisResult?.analysis_time) }}
          </p>
        </div>
        <div class="header-actions">
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
      
      <div class="dual-pane-layout">
        <!-- 左栏：PDF预览 -->
        <div class="left-pane">
          <el-card class="pdf-viewer-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><View /></el-icon>
                <span>原文预览</span>
              </div>
            </template>
            <div class="pdf-viewer">
              <PDFViewer :file-id="fileId" />
            </div>
          </el-card>
        </div>
        
        <!-- 右栏：分析结果 -->
        <div class="right-pane">
          <el-card class="analysis-result-card" shadow="never">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '../stores/analysis'
import { getAnalysisStatus } from '../api'
import ProgressIndicator from '../components/ProgressIndicator.vue'
import PDFViewer from '../components/PDFViewer.vue'
import AnalysisResult from '../components/AnalysisResult.vue'

// 路由和状态
const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()

// 响应式数据
const isLoading = ref(true)
const isRefreshing = ref(false)
const pollingTimer = ref<number | null>(null)

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

// 方法
const fetchTaskStatus = async () => {
  try {
    const task = await getAnalysisStatus(taskId.value)
    analysisStore.updateTaskStatus(task)
    
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
  // 每3秒轮询一次状态
  pollingTimer.value = window.setInterval(fetchTaskStatus, 3000)
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

const goHome = () => {
  router.push('/')
}

const downloadReport = () => {
  // TODO: 实现报告下载功能
  ElMessage.info('报告下载功能开发中...')
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

// 生命周期
onMounted(async () => {
  try {
    // 首次加载任务状态
    await fetchTaskStatus()
    
    // 如果任务还在进行中，开始轮询
    if (currentTask.value && 
        currentTask.value.status !== 'completed' && 
        currentTask.value.status !== 'failed') {
      startPolling()
    }
    
  } catch (error: any) {
    console.error('Initial load error:', error)
    ElMessage.error(error.error_message || '加载分析任务失败')
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.analysis-container {
  height: calc(100vh - 60px);
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
  height: calc(100vh - 160px);
  gap: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.left-pane,
.right-pane {
  flex: 1;
  background: white;
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

.pdf-viewer,
.analysis-content {
  height: calc(100% - 60px);
  overflow: auto;
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
    height: auto;
    min-height: calc(100vh - 60px);
  }
  
  .dual-pane-layout {
    height: auto;
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
