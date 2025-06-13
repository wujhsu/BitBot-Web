<template>
  <div class="simple-pdf-viewer">
    <!-- 工具栏 -->
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button size="small" @click="zoomOut" :disabled="scale <= 0.5">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button size="small" @click="resetZoom">
            {{ Math.round(scale * 100) }}%
          </el-button>
          <el-button size="small" @click="zoomIn" :disabled="scale >= 3">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-button size="small" @click="downloadPdf">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
        <el-button size="small" @click="openInNewTab">
          <el-icon><View /></el-icon>
          新窗口打开
        </el-button>
      </div>
    </div>
    
    <!-- PDF内容区域 -->
    <div class="pdf-content" ref="pdfContainer">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <el-skeleton :rows="8" animated />
        <p class="loading-text">正在加载PDF文件...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-result
          icon="error"
          title="PDF加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="loadPdf">重新加载</el-button>
            <el-button @click="openInNewTab">新窗口打开</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- PDF显示区域 - 使用iframe作为备选方案 -->
      <div v-else class="pdf-display">
        <iframe
          ref="pdfFrame"
          :src="pdfUrl"
          class="pdf-iframe"
          :style="{ transform: `scale(${scale})` }"
          @load="onIframeLoad"
          @error="onIframeError"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getPdfUrl, getDownloadUrl } from '../api'

// Props
interface Props {
  fileId: string
}

const props = defineProps<Props>()

// 响应式数据
const isLoading = ref(true)
const error = ref<string | null>(null)
const scale = ref(1.0)

// 组件引用
const pdfContainer = ref<HTMLElement>()
const pdfFrame = ref<HTMLIFrameElement>()

// 计算属性
const pdfUrl = computed(() => {
  return props.fileId ? getPdfUrl(props.fileId) : ''
})

// 方法
const loadPdf = async () => {
  if (!props.fileId) {
    error.value = '文件ID不存在'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // 直接让iframe加载PDF，不需要预先验证
    // iframe的onload和onerror事件会处理加载结果

    // 设置一个超时，如果iframe没有触发load事件，则停止loading状态
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
      }
    }, 3000)

  } catch (err: any) {
    console.error('PDF loading error:', err)
    error.value = err.message || 'PDF加载失败'
    isLoading.value = false
  }
}

const onIframeLoad = () => {
  isLoading.value = false
  error.value = null
}

const onIframeError = () => {
  isLoading.value = false
  error.value = 'PDF文件加载失败，可能是文件格式不支持或网络问题'
}

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(3, scale.value + 0.25)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.25)
  }
}

const resetZoom = () => {
  scale.value = 1.0
}

const downloadPdf = () => {
  if (props.fileId) {
    const downloadUrl = getDownloadUrl(props.fileId, 'pdf')
    window.open(downloadUrl, '_blank')
  }
}

const openInNewTab = () => {
  if (pdfUrl.value) {
    window.open(pdfUrl.value, '_blank')
  }
}

// 监听器
watch(() => props.fileId, (newFileId) => {
  if (newFileId) {
    loadPdf()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (props.fileId) {
    loadPdf()
  }
})
</script>

<style scoped>
.simple-pdf-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.pdf-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.loading-state {
  padding: 40px;
  text-align: center;
}

.loading-text {
  margin-top: 16px;
  color: #909399;
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.pdf-display {
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform-origin: center;
  transition: transform 0.2s ease;
  min-height: 600px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .pdf-display {
    padding: 10px;
  }
  
  .pdf-iframe {
    min-height: 400px;
  }
}
</style>
