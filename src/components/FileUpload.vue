<template>
  <div class="file-upload-container">
    <el-card class="upload-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          <span>上传招标文件</span>
        </div>
      </template>
      
      <div class="upload-content">
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :accept="acceptedTypes"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :disabled="isUploading"
        >
          <div class="upload-area">
            <el-icon class="upload-icon" :class="{ 'uploading': isUploading }">
              <component :is="uploadIcon" />
            </el-icon>
            <div class="upload-text">
              <p class="upload-hint">
                {{ isUploading ? '正在上传...' : '将文件拖拽到此处，或点击选择文件' }}
              </p>
              <p class="upload-desc">
                支持 PDF、Word 文档（.pdf, .doc, .docx），文件大小不超过 50MB
              </p>
            </div>
          </div>
        </el-upload>
        
        <!-- 上传进度 -->
        <div v-if="isUploading" class="upload-progress">
          <el-progress 
            :percentage="uploadProgress" 
            :stroke-width="8"
            :show-text="true"
            status="success"
          />
          <p class="progress-text">{{ uploadProgress }}% 已上传</p>
        </div>
        
        <!-- 文件信息 -->
        <div v-if="currentFile && !isUploading" class="file-info">
          <el-alert
            :title="`文件上传成功：${currentFile.filename}`"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="file-details">
                <p><strong>文件大小：</strong>{{ formatFileSize(currentFile.file_size) }}</p>
                <p><strong>文件类型：</strong>{{ currentFile.file_type.toUpperCase() }}</p>
                <p v-if="currentFile.is_converted"><strong>状态：</strong>已转换为 PDF</p>
              </div>
            </template>
          </el-alert>
          
          <div class="file-actions">
            <el-button type="primary" @click="startAnalysis" :loading="isStartingAnalysis">
              <el-icon><DataAnalysis /></el-icon>
              开始分析
            </el-button>
            <el-button @click="resetUpload">
              <el-icon><RefreshLeft /></el-icon>
              重新上传
            </el-button>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="uploadError" class="error-info">
          <el-alert
            :title="uploadError"
            type="error"
            :closable="true"
            @close="clearError"
            show-icon
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUploadStore } from '../stores/upload'
import { useAnalysisStore } from '../stores/analysis'
import { uploadFile, startAnalysis as apiStartAnalysis } from '../api'
import type { UploadFile } from '../types'

// 组件引用
const uploadRef = ref()
const router = useRouter()

// 状态管理
const uploadStore = useUploadStore()
const analysisStore = useAnalysisStore()

// 响应式数据
const isStartingAnalysis = ref(false)

// 计算属性
const currentFile = computed(() => uploadStore.currentFile)
const uploadProgress = computed(() => uploadStore.uploadProgress)
const isUploading = computed(() => uploadStore.isUploading)
const uploadError = computed(() => uploadStore.uploadError)

const uploadIcon = computed(() => {
  if (isUploading.value) return 'Loading'
  if (currentFile.value) return 'SuccessFilled'
  return 'Plus'
})

// 常量
const acceptedTypes = '.pdf,.doc,.docx'
const maxFileSize = 50 * 1024 * 1024 // 50MB

// 方法
const beforeUpload = (file: File) => {
  // 检查文件类型
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
    ElMessage.error('只支持 PDF、DOC、DOCX 格式的文件')
    return false
  }
  
  // 检查文件大小
  if (file.size > maxFileSize) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }
  
  return true
}

const handleFileChange = async (file: any) => {
  if (!file.raw) return
  
  try {
    uploadStore.setUploading(true)
    uploadStore.setUploadProgress(0)
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      const currentProgress = uploadStore.uploadProgress
      if (currentProgress < 90) {
        uploadStore.setUploadProgress(currentProgress + 10)
      }
    }, 200)
    
    // 上传文件
    const result: UploadFile = await uploadFile(file.raw)
    
    // 清除进度模拟
    clearInterval(progressInterval)
    uploadStore.setUploadProgress(100)
    
    // 设置上传结果
    uploadStore.setCurrentFile(result)
    
    ElMessage.success('文件上传成功！')
    
  } catch (error: any) {
    console.error('Upload error:', error)
    uploadStore.setUploadError(error.error_message || '文件上传失败')
    ElMessage.error(error.error_message || '文件上传失败')
  } finally {
    uploadStore.setUploading(false)
  }
}

const startAnalysis = async () => {
  if (!currentFile.value) {
    console.error('No file selected for analysis')
    return
  }

  try {
    isStartingAnalysis.value = true
    console.log('Starting analysis for file:', currentFile.value.file_id)

    // 启动分析任务
    const task = await apiStartAnalysis(currentFile.value.file_id)
    console.log('Analysis task created:', task)

    // 设置分析任务
    analysisStore.setCurrentTask(task)
    console.log('Task set in store, current task:', analysisStore.currentTask)

    ElMessage.success('分析任务已启动！')

    // 跳转到分析页面
    console.log('Navigating to analysis page:', `/analysis/${task.task_id}`)

    // 使用nextTick确保状态更新完成后再跳转
    await nextTick()

    try {
      const navigationResult = await router.push(`/analysis/${task.task_id}`)
      console.log('Navigation result:', navigationResult)
    } catch (navError) {
      console.error('Navigation error:', navError)
      // 如果路由跳转失败，尝试使用window.location
      window.location.href = `/analysis/${task.task_id}`
    }

  } catch (error: any) {
    console.error('Start analysis error:', error)
    ElMessage.error(error.error_message || '启动分析失败')
  } finally {
    isStartingAnalysis.value = false
  }
}

const resetUpload = () => {
  uploadStore.resetUpload()
  uploadRef.value?.clearFiles()
}

const clearError = () => {
  uploadStore.setUploadError(null)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload-container {
  max-width: 600px;
  margin: 0 auto;
}

.upload-card {
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

.upload-content {
  padding: 20px 0;
}

.upload-dragger {
  width: 100%;
}

.upload-area {
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.upload-icon.uploading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-text {
  color: #606266;
}

.upload-hint {
  font-size: 16px;
  margin-bottom: 8px;
  color: #303133;
}

.upload-desc {
  font-size: 14px;
  color: #909399;
}

.upload-progress {
  margin-top: 20px;
  padding: 0 20px;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  color: #67c23a;
  font-weight: 500;
}

.file-info {
  margin-top: 20px;
}

.file-details {
  margin-top: 8px;
}

.file-details p {
  margin: 4px 0;
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.error-info {
  margin-top: 20px;
}
</style>
