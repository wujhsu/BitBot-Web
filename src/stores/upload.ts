import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UploadFile } from '../types'

export const useUploadStore = defineStore('upload', () => {
  // 状态
  const currentFile = ref<UploadFile | null>(null)
  const uploadProgress = ref(0)
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  // 计算属性
  const hasFile = computed(() => currentFile.value !== null)
  const isUploadComplete = computed(() => uploadProgress.value === 100 && !isUploading.value)

  // 方法
  const setCurrentFile = (file: UploadFile) => {
    currentFile.value = file
    uploadError.value = null
  }

  const setUploadProgress = (progress: number) => {
    uploadProgress.value = progress
  }

  const setUploading = (uploading: boolean) => {
    isUploading.value = uploading
  }

  const setUploadError = (error: string | null) => {
    uploadError.value = error
  }

  const resetUpload = () => {
    currentFile.value = null
    uploadProgress.value = 0
    isUploading.value = false
    uploadError.value = null
  }

  return {
    // 状态
    currentFile,
    uploadProgress,
    isUploading,
    uploadError,
    
    // 计算属性
    hasFile,
    isUploadComplete,
    
    // 方法
    setCurrentFile,
    setUploadProgress,
    setUploading,
    setUploadError,
    resetUpload
  }
})
