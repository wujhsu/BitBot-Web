<template>
  <div class="test-pdf-preview">
    <h2>PDF预览测试</h2>
    <p>测试文件ID: c87ab61b-b3c2-4ea3-ae02-2950175d18ac</p>
    
    <div class="pdf-container">
      <SimplePDFViewer file-id="c87ab61b-b3c2-4ea3-ae02-2950175d18ac" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SimplePDFViewer from '../components/SimplePDFViewer.vue'
</script>

<style scoped>
.test-pdf-preview {
  padding: 20px;
}

.pdf-container {
  height: 600px;
  border: 1px solid #ddd;
  margin-top: 20px;
}
</style>
