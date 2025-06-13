<template>
  <div class="test-pdf-page">
    <el-card class="test-card">
      <template #header>
        <h2>PDF预览测试</h2>
      </template>
      
      <div class="test-content">
        <el-form @submit.prevent="testPdf">
          <el-form-item label="文件ID">
            <el-input 
              v-model="testFileId" 
              placeholder="输入文件ID进行测试"
              style="width: 300px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testPdf" :disabled="!testFileId">
              测试PDF预览
            </el-button>
            <el-button @click="goBack">返回</el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="showPdf" class="pdf-test-area">
          <h3>PDF预览测试结果：</h3>
          <div class="pdf-container">
            <SimplePDFViewer :file-id="testFileId" />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SimplePDFViewer from '../components/SimplePDFViewer.vue'

const router = useRouter()

const testFileId = ref('')
const showPdf = ref(false)

const testPdf = () => {
  if (testFileId.value.trim()) {
    showPdf.value = true
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.test-pdf-page {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.test-card {
  max-width: 1200px;
  margin: 0 auto;
}

.test-content {
  padding: 20px 0;
}

.pdf-test-area {
  margin-top: 30px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.pdf-container {
  height: 600px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}
</style>
