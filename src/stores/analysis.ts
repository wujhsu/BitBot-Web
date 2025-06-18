import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AnalysisTask, AnalysisResult } from '../types'

export const useAnalysisStore = defineStore('analysis', () => {
  // 从localStorage恢复状态
  const getStoredTask = (): AnalysisTask | null => {
    try {
      const stored = localStorage.getItem('currentAnalysisTask')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  const getStoredResult = (): AnalysisResult | null => {
    try {
      const stored = localStorage.getItem('analysisResult')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // 状态
  const currentTask = ref<AnalysisTask | null>(getStoredTask())
  const analysisResult = ref<AnalysisResult | null>(getStoredResult())
  const isAnalyzing = ref(false)
  const analysisError = ref<string | null>(null)
  const pollingInterval = ref<number | null>(null)

  // 计算属性
  const hasTask = computed(() => currentTask.value !== null)
  const isCompleted = computed(() => currentTask.value?.status === 'completed')
  const isFailed = computed(() => currentTask.value?.status === 'failed')
  const progressPercentage = computed(() => currentTask.value?.progress?.progress_percentage || 0)

  // 持久化方法
  const persistTask = (task: AnalysisTask | null) => {
    try {
      if (task) {
        localStorage.setItem('currentAnalysisTask', JSON.stringify(task))
      } else {
        localStorage.removeItem('currentAnalysisTask')
      }
    } catch (error) {
      console.warn('Failed to persist task to localStorage:', error)
    }
  }

  const persistResult = (result: AnalysisResult | null) => {
    try {
      if (result) {
        localStorage.setItem('analysisResult', JSON.stringify(result))
      } else {
        localStorage.removeItem('analysisResult')
      }
    } catch (error) {
      console.warn('Failed to persist result to localStorage:', error)
    }
  }

  // 方法
  const setCurrentTask = (task: AnalysisTask) => {
    currentTask.value = task
    analysisError.value = null
    persistTask(task)
  }

  const updateTaskStatus = (task: AnalysisTask) => {
    if (currentTask.value && currentTask.value.task_id === task.task_id) {
      currentTask.value = task
      persistTask(task)

      // 如果分析完成，设置结果
      if (task.status === 'completed' && task.result) {
        analysisResult.value = task.result
        persistResult(task.result)
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
    // 清除持久化数据
    persistTask(null)
    persistResult(null)
  }

  // 设置分析结果（用于直接设置结果）
  const setAnalysisResult = (result: AnalysisResult | null) => {
    analysisResult.value = result
    persistResult(result)
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
    setAnalysisResult,
    setPollingInterval,
    resetAnalysis
  }
})
