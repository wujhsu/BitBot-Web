import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AnalysisTask, AnalysisResult } from '../types'

export const useAnalysisStore = defineStore('analysis', () => {
  // 状态
  const currentTask = ref<AnalysisTask | null>(null)
  const analysisResult = ref<AnalysisResult | null>(null)
  const isAnalyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const pollingInterval = ref<number | null>(null)

  // 计算属性
  const hasTask = computed(() => currentTask.value !== null)
  const isCompleted = computed(() => currentTask.value?.status === 'completed')
  const isFailed = computed(() => currentTask.value?.status === 'failed')
  const progressPercentage = computed(() => currentTask.value?.progress?.progress_percentage || 0)

  // 方法
  const setCurrentTask = (task: AnalysisTask) => {
    currentTask.value = task
    analysisError.value = null
  }

  const updateTaskStatus = (task: AnalysisTask) => {
    if (currentTask.value && currentTask.value.task_id === task.task_id) {
      currentTask.value = task
      
      // 如果分析完成，设置结果
      if (task.status === 'completed' && task.result) {
        analysisResult.value = task.result
      }
      
      // 如果分析失败，设置错误
      if (task.status === 'failed' && task.error_message) {
        analysisError.value = task.error_message
      }
    }
  }

  const setAnalyzing = (analyzing: boolean) => {
    isAnalyzing.value = analyzing
  }

  const setAnalysisError = (error: string | null) => {
    analysisError.value = error
  }

  const setPollingInterval = (interval: number | null) => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }
    pollingInterval.value = interval
  }

  const resetAnalysis = () => {
    currentTask.value = null
    analysisResult.value = null
    isAnalyzing.value = false
    analysisError.value = null
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  return {
    // 状态
    currentTask,
    analysisResult,
    isAnalyzing,
    analysisError,
    
    // 计算属性
    hasTask,
    isCompleted,
    isFailed,
    progressPercentage,
    
    // 方法
    setCurrentTask,
    updateTaskStatus,
    setAnalyzing,
    setAnalysisError,
    setPollingInterval,
    resetAnalysis
  }
})
