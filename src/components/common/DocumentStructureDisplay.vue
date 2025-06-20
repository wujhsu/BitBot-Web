<template>
  <div class="document-structure-display">
    <div v-if="!fields || fields.length === 0" class="no-fields">
      <el-empty description="暂无相关信息" :image-size="80" />
    </div>
    
    <div v-else class="structure-content">
      <div 
        v-for="(field, index) in fields" 
        :key="index" 
        class="structure-item"
      >
        <div v-if="field.value" class="structure-content-wrapper">
          <!-- 格式化的文档结构 -->
          <div class="structure-formatted" v-html="formatDocumentStructure(field.value)"></div>
          
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
          

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExtractedField, DocumentSource } from '../../types'

// Props
interface Props {
  fields: ExtractedField[]
  showSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSource: true
})

// 格式化文档结构
const formatDocumentStructure = (content: string): string => {
  if (!content) return ''

  // 特殊处理包含两个信封目录的情况
  if (content.includes('第一个信封') && content.includes('第二个信封')) {
    return formatDualEnvelopeStructure(content)
  }

  // 处理单个目录内容
  return formatSingleStructure(content)
}

// 格式化双信封结构
const formatDualEnvelopeStructure = (content: string): string => {
  // 尝试分离第一个信封和第二个信封的内容
  const firstEnvelopeMatch = content.match(/第一个信封[^：]*：([^。]*第二个信封)/i)
  const secondEnvelopeMatch = content.match(/第二个信封[^：]*：([^。]*)/i)

  let formatted = ''

  if (firstEnvelopeMatch) {
    const firstPart = firstEnvelopeMatch[1].replace('第二个信封', '').trim()
    formatted += '<h4 style="color: #409eff; margin: 10px 0;">第一个信封（商务及技术文件）</h4>'
    formatted += formatDirectoryItems(firstPart)
  }

  if (secondEnvelopeMatch) {
    const secondPart = secondEnvelopeMatch[1].trim()
    formatted += '<h4 style="color: #409eff; margin: 10px 0;">第二个信封（报价文件）</h4>'
    formatted += formatDirectoryItems(secondPart)
  }

  return formatted || formatSingleStructure(content)
}

// 格式化单个结构
const formatSingleStructure = (content: string): string => {
  return formatDirectoryItems(content)
}

// 格式化目录项
const formatDirectoryItems = (content: string): string => {
  if (!content) return ''

  // 首先尝试按分号或句号分割
  let items: string[] = []
  if (content.includes('；')) {
    items = content.split('；')
  } else if (content.includes(';')) {
    items = content.split(';')
  } else if (content.includes('。') && content.split('。').length > 2) {
    items = content.split('。')
  } else {
    // 如果没有明显的分隔符，按换行分割
    items = content.split('\n')
  }

  const formattedItems: string[] = []

  for (let item of items) {
    item = item.trim()
    if (!item) continue

    // 移除末尾的标点符号
    item = item.replace(/[。；;]+$/, '')

    // 检查是否是目录项并格式化
    if (/^(第[一二三四五六七八九十]|[一二三四五六七八九十]、)/.test(item)) {
      formattedItems.push(`<strong style="color: #2c3e50;">${item}</strong>`)
    } else if (/^[\(（][0-9]+[\)）]/.test(item)) {
      formattedItems.push(`<span style="margin-left: 20px;">• ${item}</span>`)
    } else if (/^[0-9]+\./.test(item)) {
      formattedItems.push(`<span style="margin-left: 20px;">• ${item}</span>`)
    } else if (/^[①②③④⑤⑥⑦⑧⑨]/.test(item)) {
      formattedItems.push(`<span style="margin-left: 40px;">- ${item}</span>`)
    } else if (item.includes('信封')) {
      formattedItems.push(`<h5 style="color: #409eff; margin: 8px 0;">${item}</h5>`)
    } else {
      // 其他内容，如果较短可能是标题，较长则作为普通项
      if (item.length < 30) {
        formattedItems.push(`<strong style="color: #2c3e50;">${item}</strong>`)
      } else {
        formattedItems.push(`<span>${item}</span>`)
      }
    }
  }

  return formattedItems.join('<br>')
}

// 获取来源信息
const getSourceInfo = (source: DocumentSource): string => {
  const parts: string[] = []
  
  if (source.page_number) {
    parts.push(`页码: ${source.page_number}`)
  }
  
  if (source.section) {
    parts.push(`章节: ${source.section}`)
  }
  
  if (source.source_text) {
    parts.push(`原文: ${source.source_text.substring(0, 100)}${source.source_text.length > 100 ? '...' : ''}`)
  }
  
  return parts.join('\n') || '无来源信息'
}


</script>

<style scoped>
.document-structure-display {
  width: 100%;
}

.no-fields {
  padding: 40px 0;
  text-align: center;
}

.structure-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.structure-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.structure-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-formatted {
  line-height: 1.8;
  color: #2c3e50;
}

.structure-formatted :deep(h4) {
  margin: 10px 0 !important;
  font-size: 16px;
  font-weight: 600;
}

.structure-formatted :deep(h5) {
  margin: 8px 0 !important;
  font-size: 14px;
  font-weight: 600;
}

.structure-formatted :deep(strong) {
  font-weight: 600;
  display: block;
  margin: 4px 0;
}

.structure-formatted :deep(span) {
  display: block;
  margin: 2px 0;
}

.field-source {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .structure-item {
    padding: 12px;
  }
  
  .structure-formatted {
    font-size: 14px;
  }
}
</style>
