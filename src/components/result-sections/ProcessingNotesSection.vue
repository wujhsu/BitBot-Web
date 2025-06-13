<template>
  <div class="processing-notes-section">
    <el-card class="notes-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>处理说明</span>
        </div>
      </template>
      
      <div v-if="!notes || notes.length === 0" class="no-notes">
        <el-empty description="暂无处理说明" />
      </div>
      
      <div v-else class="notes-content">
        <div 
          v-for="(note, index) in notes" 
          :key="index"
          class="note-item"
        >
          <div class="note-index">{{ index + 1 }}</div>
          <div class="note-text">{{ note }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  notes: string[]
}

defineProps<Props>()
</script>

<style scoped>
.processing-notes-section {
  height: 100%;
}

.notes-card {
  height: 100%;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.no-notes {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.notes-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.note-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.note-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #67c23a;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.note-text {
  flex: 1;
  line-height: 1.6;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .note-item {
    padding: 12px;
    gap: 10px;
  }
  
  .note-index {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }
  
  .notes-content {
    gap: 12px;
  }
  
  .note-text {
    font-size: 14px;
  }
}
</style>
