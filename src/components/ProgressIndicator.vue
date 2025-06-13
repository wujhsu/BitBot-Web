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
    key: 'basic_info_extractor',
    title: '基础信息提取',
    description: '提取项目基本信息和资格审查条件'
  },
  {
    key: 'scoring_analyzer',
    title: '评分标准分析',
    description: '分析评分方法、分值构成和评分细则'
  },
  {
    key: 'other_info_extractor',
    title: '其他信息提取',
    description: '提取合同条款、风险点等重要信息'
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

const activeStep = computed(() => {
  const currentStep = props.task?.progress?.current_step
  if (!currentStep) return 0
  
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
</style>
