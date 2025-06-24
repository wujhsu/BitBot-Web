<template>
  <div class="progress-indicator">
    <el-card class="progress-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Timer /></el-icon>
          <span>分析进度</span>
        </div>
      </template>
      
      <div class="progress-content">
        <!-- 进度环 -->
        <div class="progress-circle">
          <el-progress
            type="circle"
            :percentage="progressPercentage"
            :width="120"
            :stroke-width="8"
            :status="progressStatus"
          >
            <template #default="{ percentage }">
              <div class="progress-text">
                <div class="percentage">{{ percentage }}%</div>
                <div class="status">{{ statusText }}</div>
              </div>
            </template>
          </el-progress>
        </div>
        
        <!-- 步骤信息 -->
        <div class="step-info">
          <h3 class="step-title">{{ currentStepDescription }}</h3>
          <p class="step-detail">{{ stepDetail }}</p>

          <!-- 预估时间 -->
          <div v-if="estimatedTime" class="estimated-time">
            <el-icon><Clock /></el-icon>
            <span>预计剩余时间：{{ formatTime(estimatedTime) }}</span>
          </div>
        </div>

        <!-- 并行智能体进度区域 -->
        <div v-if="isParallelPhase" class="parallel-progress">
          <div class="parallel-title">
            <el-icon><Operation /></el-icon>
            <span>并行处理进度</span>
          </div>
          <div class="agent-progress-list">
            <div
              v-for="agent in agentList"
              :key="agent.key"
              class="agent-progress"
            >
              <div class="agent-info">
                <el-tooltip
                  :content="agent.description"
                  placement="top"
                  :show-after="500"
                >
                  <div class="agent-name">
                    <el-icon class="agent-icon"><Document /></el-icon>
                    <span>{{ agent.name }}</span>
                  </div>
                </el-tooltip>
                <div class="agent-percentage">{{ getAgentProgress(agent.key) }}%</div>
              </div>
              <el-progress
                :percentage="getAgentProgress(agent.key)"
                :status="getAgentStatus(agent.key)"
                :stroke-width="6"
                class="agent-progress-bar"
              />
              <!-- 智能体错误提示 -->
              <div v-if="hasAgentError(agent.key)" class="agent-error">
                <el-icon><WarningFilled /></el-icon>
                <span>{{ getAgentErrorMessage(agent.key) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 部分成功提示 -->
        <div v-if="isPartialSuccess" class="partial-success-alert">
          <el-alert
            title="部分分析完成"
            type="warning"
            :description="partialSuccessMessage"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 步骤列表 -->
        <div class="steps-list">
          <el-steps :active="activeStep" direction="vertical" :space="60">
            <el-step
              v-for="(step, index) in steps"
              :key="step.key"
              :title="step.title"
              :description="step.description"
              :status="getStepStatus(index)"
            >
              <template #icon>
                <el-icon>
                  <component :is="getStepIcon(index)" />
                </el-icon>
              </template>
            </el-step>
          </el-steps>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error-section">
          <el-alert
            :title="errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AnalysisTask } from '../types'

// Props
interface Props {
  task: AnalysisTask | null
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: ''
})

// 步骤定义
const steps = [
  {
    key: 'start',
    title: '开始分析',
    description: '初始化分析任务'
  },
  {
    key: 'document_processor',
    title: '文档预处理',
    description: '加载文档、文本分割、向量化存储'
  },
  {
    key: 'parallel_extraction',
    title: '并行信息提取',
    description: '同时进行基础信息、评分标准、合同信息提取'
  },
  {
    key: 'output_formatter',
    title: '结果格式化',
    description: '生成结构化的分析报告'
  },
  {
    key: 'completed',
    title: '分析完成',
    description: '所有分析步骤已完成'
  }
]

// 智能体定义
const agentList = [
  {
    key: 'basic_info_extractor',
    name: '基础信息提取',
    description: '提取项目基本信息和资格审查条件'
  },
  {
    key: 'scoring_analyzer',
    name: '评分标准分析',
    description: '分析评分方法、分值构成和评分细则'
  },
  {
    key: 'contract_info_extractor',
    name: '合同信息提取',
    description: '提取合同条款、风险点等重要信息'
  }
]

// 计算属性
const progressPercentage = computed(() => {
  return props.task?.progress?.progress_percentage || 0
})

const progressStatus = computed(() => {
  if (props.errorMessage || props.task?.status === 'failed') return 'exception'
  if (props.task?.status === 'completed') return 'success'
  return undefined
})

const statusText = computed(() => {
  if (props.errorMessage || props.task?.status === 'failed') return '失败'
  if (props.task?.status === 'completed') return '完成'
  if (props.task?.status === 'processing') return '处理中'
  return '等待中'
})

const currentStepDescription = computed(() => {
  return props.task?.progress?.step_description || '等待开始分析'
})

const stepDetail = computed(() => {
  const currentStep = props.task?.progress?.current_step
  if (!currentStep) return ''
  
  const step = steps.find(s => s.key === currentStep)
  return step?.description || ''
})

const estimatedTime = computed(() => {
  return props.task?.progress?.estimated_remaining_time
})

// 判断是否为并行阶段
const isParallelPhase = computed(() => {
  const currentStep = props.task?.progress?.current_step
  return currentStep && [
    'basic_info_extractor',
    'scoring_analyzer',
    'contract_info_extractor',
    'parallel_aggregator',
    'parallel_extraction_completed',
    'partial_extraction_completed'
  ].includes(currentStep)
})

const activeStep = computed(() => {
  const currentStep = props.task?.progress?.current_step
  if (!currentStep) return 0

  // 处理并行阶段的步骤映射
  if (isParallelPhase.value) {
    return 2 // 对应 'parallel_extraction' 步骤
  }

  const stepIndex = steps.findIndex(s => s.key === currentStep)
  return stepIndex >= 0 ? stepIndex : 0
})

// 方法
const getStepStatus = (index: number) => {
  const current = activeStep.value
  
  if (props.errorMessage || props.task?.status === 'failed') {
    if (index < current) return 'finish'
    if (index === current) return 'error'
    return 'wait'
  }
  
  if (index < current) return 'finish'
  if (index === current) {
    if (props.task?.status === 'completed') return 'finish'
    return 'process'
  }
  return 'wait'
}

const getStepIcon = (index: number) => {
  const status = getStepStatus(index)
  
  switch (status) {
    case 'finish':
      return 'SuccessFilled'
    case 'process':
      return 'Loading'
    case 'error':
      return 'CircleCloseFilled'
    default:
      return 'Clock'
  }
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

// 获取智能体进度
const getAgentProgress = (agentKey: string): number => {
  const agentProgress = props.task?.progress?.agent_progress
  if (!agentProgress) return 0
  return (agentProgress as Record<string, number>)[agentKey] || 0
}

// 获取智能体状态
const getAgentStatus = (agentKey: string) => {
  const progress = getAgentProgress(agentKey)
  if (hasAgentError(agentKey)) return 'exception'
  if (progress >= 100) return 'success'
  if (progress > 0) return undefined // 进行中
  return undefined
}

// 判断智能体是否有错误
const hasAgentError = (agentKey: string): boolean => {
  const currentStep = props.task?.progress?.current_step
  const progress = getAgentProgress(agentKey)

  // 在部分提取完成状态下，进度为0的智能体被认为是失败的
  if (currentStep === 'partial_extraction_completed' && progress === 0) {
    return true
  }

  // 如果任务整体失败，且该智能体进度不是100%，则认为失败
  if (props.task?.status === 'failed' && progress < 100) {
    return true
  }

  return false
}

// 获取智能体错误信息
const getAgentErrorMessage = (agentKey: string): string => {
  const agentName = agentList.find(agent => agent.key === agentKey)?.name || agentKey
  const currentStep = props.task?.progress?.current_step

  if (currentStep === 'partial_extraction_completed') {
    return `${agentName}处理未完成，可能遇到了问题`
  }

  if (props.task?.status === 'failed') {
    return `${agentName}处理失败`
  }

  return `${agentName}出现异常`
}

// 判断是否为部分成功
const isPartialSuccess = computed(() => {
  const currentStep = props.task?.progress?.current_step
  return currentStep === 'partial_extraction_completed'
})

// 部分成功的消息
const partialSuccessMessage = computed(() => {
  if (!isPartialSuccess.value) return ''

  const agentProgress = props.task?.progress?.agent_progress
  if (!agentProgress) return ''

  const successfulAgents: string[] = []
  const failedAgents: string[] = []

  agentList.forEach(agent => {
    const progress = (agentProgress as Record<string, number>)[agent.key] || 0
    if (progress >= 100) {
      successfulAgents.push(agent.name)
    } else {
      failedAgents.push(agent.name)
    }
  })

  let message = ''
  if (successfulAgents.length > 0) {
    message += `已完成：${successfulAgents.join('、')}`
  }
  if (failedAgents.length > 0) {
    if (message) message += '；'
    message += `未完成：${failedAgents.join('、')}`
  }

  return message || '部分智能体处理完成，您可以查看已完成的分析结果'
})
</script>

<style scoped>
.progress-indicator {
  width: 100%;
}

.progress-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-content {
  padding: 20px 0;
}

.progress-circle {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.progress-text {
  text-align: center;
}

.percentage {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.status {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.step-info {
  text-align: center;
  margin-bottom: 30px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.step-detail {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.estimated-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #409eff;
}

.steps-list {
  margin-top: 20px;
}

.error-section {
  margin-top: 20px;
}

/* 并行进度样式 */
.parallel-progress {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.parallel-progress:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.parallel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  position: relative;
}

.parallel-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 1px;
}

.agent-progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agent-progress {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.agent-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #409eff, #67c23a);
  opacity: 0.8;
}

.agent-progress:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.agent-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agent-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  cursor: help;
  transition: color 0.2s ease;
}

.agent-name:hover {
  color: #409eff;
}

.agent-icon {
  font-size: 16px;
  color: #909399;
  transition: color 0.2s ease;
}

.agent-name:hover .agent-icon {
  color: #409eff;
}

.agent-percentage {
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #b3d8ff;
  min-width: 45px;
  text-align: center;
}

.agent-progress-bar {
  width: 100%;
}

/* 自定义进度条样式 */
:deep(.agent-progress-bar .el-progress-bar__outer) {
  background-color: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.agent-progress-bar .el-progress-bar__inner) {
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  border-radius: 6px;
  transition: width 0.6s ease;
}

:deep(.agent-progress-bar.is-success .el-progress-bar__inner) {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

:deep(.agent-progress-bar.is-exception .el-progress-bar__inner) {
  background: linear-gradient(90deg, #f56c6c 0%, #f78989 100%);
}

.agent-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  font-size: 12px;
  color: #f56c6c;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.partial-success-alert {
  margin: 20px 0;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 自定义步骤样式 */
:deep(.el-steps--vertical .el-step__main) {
  padding-left: 16px;
}

:deep(.el-step__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-step__description) {
  font-size: 12px;
  color: #909399;
}

:deep(.el-step__icon) {
  width: 32px;
  height: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .parallel-progress {
    margin: 16px 0;
    padding: 16px;
  }

  .parallel-title {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .agent-progress {
    padding: 14px;
  }

  .agent-info {
    margin-bottom: 8px;
  }

  .agent-name {
    font-size: 13px;
    gap: 4px;
  }

  .agent-icon {
    font-size: 14px;
  }

  .agent-percentage {
    font-size: 12px;
    padding: 1px 6px;
    min-width: 40px;
  }

  .agent-error {
    margin-top: 8px;
    padding: 6px 8px;
    font-size: 11px;
    gap: 6px;
  }

  .partial-success-alert {
    margin: 16px 0;
  }
}

/* 平板设备适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .parallel-progress {
    padding: 18px;
  }

  .agent-progress {
    padding: 15px;
  }
}
</style>
