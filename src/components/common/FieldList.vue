<template>
  <div class="field-list">
    <div v-if="!fields || fields.length === 0" class="no-fields">
      <el-empty description="暂无相关信息" :image-size="80" />
    </div>
    
    <div v-else class="fields-content">
      <div 
        v-for="(field, index) in fields" 
        :key="index" 
        class="field-item"
      >
        <div class="field-index">{{ index + 1 }}</div>
        <div class="field-content">
          <FieldDisplay :field="field" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtractedField } from '../../types'
import FieldDisplay from './FieldDisplay.vue'

// Props
interface Props {
  fields: ExtractedField[]
}

defineProps<Props>()
</script>

<style scoped>
.field-list {
  width: 100%;
}

.no-fields {
  padding: 40px 0;
  text-align: center;
}

.fields-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.field-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.field-content {
  flex: 1;
  min-width: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .field-item {
    padding: 12px;
    gap: 10px;
  }
  
  .field-index {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }
  
  .fields-content {
    gap: 12px;
  }
}
</style>
