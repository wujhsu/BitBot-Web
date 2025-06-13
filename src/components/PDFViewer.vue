<template>
  <div class="pdf-viewer">
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
      
      <div class="toolbar-center">
        <el-button-group>
          <el-button size="small" @click="prevPage" :disabled="currentPage <= 1">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-input
            v-model="pageInput"
            size="small"
            class="page-input"
            @keyup.enter="goToPage"
            @blur="goToPage"
          />
          <span class="page-info">/ {{ totalPages }}</span>
          <el-button size="small" @click="nextPage" :disabled="currentPage >= totalPages">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-button size="small" @click="downloadPdf">
          <el-icon><Download /></el-icon>
          下载
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
          </template>
        </el-result>
      </div>
      
      <!-- PDF显示区域 -->
      <div v-else class="pdf-display">
        <canvas
          ref="pdfCanvas"
          class="pdf-canvas"
          :style="{ transform: `scale(${scale})` }"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const pageInput = ref('1')

// 组件引用
const pdfContainer = ref<HTMLElement>()
const pdfCanvas = ref<HTMLCanvasElement>()

// PDF相关
let pdfDoc: any = null
let renderTask: any = null

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

    // 动态导入PDF.js
    const pdfjsLib = await import('pdfjs-dist')
    
    // 设置worker路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

    // 加载PDF文档
    const loadingTask = pdfjsLib.getDocument(pdfUrl.value)
    pdfDoc = await loadingTask.promise

    totalPages.value = pdfDoc.numPages
    currentPage.value = 1
    pageInput.value = '1'

    // 渲染第一页
    await renderPage(1)

    isLoading.value = false

  } catch (err: any) {
    console.error('PDF loading error:', err)
    error.value = err.message || 'PDF加载失败'
    isLoading.value = false
  }
}

const renderPage = async (pageNum: number) => {
  if (!pdfDoc || !pdfCanvas.value) return

  try {
    // 取消之前的渲染任务
    if (renderTask) {
      renderTask.cancel()
    }

    const page = await pdfDoc.getPage(pageNum)
    const canvas = pdfCanvas.value
    const context = canvas.getContext('2d')

    // 计算视口
    const viewport = page.getViewport({ scale: 1.5 })
    
    // 设置canvas尺寸
    canvas.height = viewport.height
    canvas.width = viewport.width

    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    renderTask = page.render(renderContext)
    await renderTask.promise
    renderTask = null

  } catch (err: any) {
    if (err.name !== 'RenderingCancelledException') {
      console.error('Page rendering error:', err)
      ElMessage.error('页面渲染失败')
    }
  }
}

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    pageInput.value = currentPage.value.toString()
    await renderPage(currentPage.value)
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    pageInput.value = currentPage.value.toString()
    await renderPage(currentPage.value)
  }
}

const goToPage = async () => {
  const pageNum = parseInt(pageInput.value)
  if (pageNum >= 1 && pageNum <= totalPages.value && pageNum !== currentPage.value) {
    currentPage.value = pageNum
    await renderPage(pageNum)
  } else {
    pageInput.value = currentPage.value.toString()
  }
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
.pdf-viewer {
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

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 60px;
}

.page-info {
  font-size: 14px;
  color: #606266;
  margin-left: 8px;
}

.pdf-content {
  flex: 1;
  overflow: auto;
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
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: 100%;
}

.pdf-canvas {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  transform-origin: top center;
  transition: transform 0.2s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .pdf-display {
    padding: 10px;
  }
}
</style>
