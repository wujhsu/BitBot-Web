<template>
  <div class="field-display">
    <div v-if="!field?.value" class="no-value">
      <el-text type="info">未提取到信息</el-text>
    </div>
    
    <div v-else class="field-content">
      <!-- 字段值 -->
      <div class="field-value">
        <el-text>{{ field.value }}</el-text>
      </div>
      
      <!-- 来源信息 -->
      <div v-if="field.source && showSource" class="field-source">
        <el-popover
          placement="top"
          :width="300"
          trigger="hover"
          :content="getSourceInfo(field.source)"
        >
          <template #reference>
            <el-tag size="small" type="info" effect="plain">
              <el-icon><Location /></el-icon>
              来源
            </el-tag>
          </template>
        </el-popover>
      </div>
      

      
      <!-- 备注 -->
      <div v-if="field.notes" class="field-notes">
        <el-text type="warning" size="small">
          <el-icon><Warning /></el-icon>
          {{ field.notes }}
        </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtractedField, DocumentSource } from '../../types'

// Props
interface Props {
  field: ExtractedField | undefined
  showSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSource: true
})

// 方法
const getSourceInfo = (source: DocumentSource): string => {
  const parts = []
  
  if (source.page_number) {
    parts.push(`第${source.page_number}页`)
  }
  
  if (source.section) {
    parts.push(`章节: ${source.section}`)
  }
  
  if (source.paragraph) {
    parts.push(`段落: ${source.paragraph}`)
  }
  
  if (source.source_text) {
    parts.push(`原文: "${source.source_text.substring(0, 100)}${source.source_text.length > 100 ? '...' : ''}"`)
  }
  
  return parts.length > 0 ? parts.join('\n') : '来源信息不详'
}


</script>

<style scoped>
.field-display {
  width: 100%;
}

.no-value {
  padding: 8px 0;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-value {
  flex: 1;
  word-break: break-word;
  line-height: 1.5;
}

.field-source {
  display: flex;
  align-items: center;
}

.field-notes {
  padding: 8px 12px;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 4px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .field-content {
    gap: 6px;
  }
  
  .field-notes {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>
