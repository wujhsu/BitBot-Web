<template>
  <div class="file-upload-container">
    <div class="upload-card">
      <div class="upload-header">
        <div class="header-icon">
          <el-icon><Upload /></el-icon>
        </div>
        <div class="header-text">
          <h2 class="upload-title">上传招标文件</h2>
          <p class="upload-subtitle">开始您的智能分析之旅</p>
        </div>
      </div>

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
            <div class="upload-icon-wrapper">
              <el-icon class="upload-icon" :class="{ 'uploading': isUploading }">
                <component :is="uploadIcon" />
              </el-icon>
            </div>
            <div class="upload-text">
              <h3 class="upload-hint">
                {{ isUploading ? '正在上传文件...' : '拖拽文件到此处，或点击选择文件' }}
              </h3>
              <p class="upload-desc">
                支持 PDF、Word 文档（.pdf, .doc, .docx）<br>
                文件大小不超过 50MB
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
          <div class="success-card">
            <div class="success-icon">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="success-content">
              <h3 class="success-title">文件上传成功！</h3>
              <p class="file-name">{{ currentFile.filename }}</p>
              <div class="file-details">
                <div class="detail-item">
                  <span class="detail-label">文件大小：</span>
                  <span class="detail-value">{{ formatFileSize(currentFile.file_size) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">文件类型：</span>
                  <span class="detail-value">{{ currentFile.file_type.toUpperCase() }}</span>
                </div>
                <div v-if="currentFile.is_converted" class="detail-item">
                  <span class="detail-label">状态：</span>
                  <span class="detail-value status-converted">已转换为 PDF</span>
                </div>
              </div>
            </div>
          </div>

          <div class="file-actions">
            <el-button
              type="primary"
              size="large"
              @click="startAnalysis"
              :loading="isStartingAnalysis"
              class="action-button primary-action"
            >
              <el-icon><DataAnalysis /></el-icon>
              开始智能分析
            </el-button>
            <el-button
              size="large"
              @click="resetUpload"
              class="action-button secondary-action"
            >
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
    </div>
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
  max-width: 100%;
  margin: 0 auto;
}

.upload-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 2px solid #e9ecef;
  position: relative;
  transition: all 0.3s ease;
}

.upload-card:hover {
  border-color: #4a5568;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.upload-header {
  padding: 50px 40px 30px;
  text-align: center;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: #4a5568;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 24px rgba(74, 85, 104, 0.2);
}

.header-icon .el-icon {
  font-size: 36px;
  color: white;
}

.upload-title {
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.upload-subtitle {
  font-size: 18px;
  color: #718096;
  margin: 0;
}

.upload-content {
  padding: 40px 50px 50px;
}

.upload-dragger {
  width: 100%;
}

.upload-area {
  padding: 80px 40px;
  text-align: center;
  border: 3px dashed #cbd5e0;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.upload-area:hover {
  border-color: #4a5568;
  background: #edf2f7;
}

.upload-icon-wrapper {
  margin-bottom: 32px;
}

.upload-icon {
  font-size: 80px;
  color: #4a5568;
  transition: all 0.4s ease;
}

.upload-icon.uploading {
  animation: rotate 1s linear infinite;
  color: #38a169;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-text {
  color: #4a5568;
}

.upload-hint {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #2d3748;
}

.upload-desc {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.upload-progress {
  margin-top: 30px;
  padding: 0 20px;
}

.progress-text {
  text-align: center;
  margin-top: 12px;
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

/* 文件信息样式 */
.file-info {
  margin-top: 30px;
}

.success-card {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(64, 158, 255, 0.1) 100%);
  border: 2px solid rgba(103, 194, 58, 0.2);
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
}

.success-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-icon .el-icon {
  font-size: 24px;
  color: white;
}

.success-content {
  flex: 1;
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.file-name {
  font-size: 16px;
  color: #667eea;
  font-weight: 600;
  margin: 0 0 16px 0;
  word-break: break-all;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  min-width: 80px;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.status-converted {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  min-width: 160px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.primary-action {
  background: #4a5568;
  border: none;
  box-shadow: 0 8px 25px rgba(74, 85, 104, 0.3);
}

.primary-action:hover {
  background: #2d3748;
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(74, 85, 104, 0.4);
}

.secondary-action {
  background: white;
  border: 2px solid #e2e8f0;
  color: #718096;
}

.secondary-action:hover {
  border-color: #4a5568;
  color: #4a5568;
  transform: translateY(-2px);
}

.error-info {
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-header {
    padding: 30px 20px 15px;
  }

  .upload-title {
    font-size: 24px;
  }

  .upload-content {
    padding: 15px 20px 30px;
  }

  .upload-area {
    padding: 40px 20px;
  }

  .upload-icon {
    font-size: 48px;
  }

  .upload-hint {
    font-size: 18px;
  }

  .success-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }

  .file-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>
