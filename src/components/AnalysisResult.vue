<template>
  <div class="analysis-result">
    <div v-if="!result" class="no-result">
      <el-empty description="暂无分析结果" />
    </div>
    
    <div v-else class="result-content">
      <!-- 导航标签 -->
      <el-tabs v-model="activeTab" type="border-card" class="result-tabs">
        <!-- 基础信息 -->
        <el-tab-pane label="基础信息" name="basic">
          <template #label>
            <span class="tab-label">
              <el-icon><InfoFilled /></el-icon>
              基础信息
            </span>
          </template>
          <BasicInfoSection :basic-info="result.basic_information" />
        </el-tab-pane>
        
        <!-- 评分标准 -->
        <el-tab-pane label="评分标准" name="scoring">
          <template #label>
            <span class="tab-label">
              <el-icon><DataAnalysis /></el-icon>
              评分标准
            </span>
          </template>
          <ScoringSection :scoring-criteria="result.scoring_criteria" />
        </el-tab-pane>
        
        <!-- 其他信息 -->
        <el-tab-pane label="其他信息" name="other">
          <template #label>
            <span class="tab-label">
              <el-icon><More /></el-icon>
              其他信息
            </span>
          </template>
          <OtherInfoSection :other-info="result.other_information" />
        </el-tab-pane>
        
        <!-- 处理说明 -->
        <el-tab-pane label="处理说明" name="notes">
          <template #label>
            <span class="tab-label">
              <el-icon><Document /></el-icon>
              处理说明
            </span>
          </template>
          <ProcessingNotesSection :notes="result.processing_notes" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalysisResult } from '../types'
import BasicInfoSection from './result-sections/BasicInfoSection.vue'
import ScoringSection from './result-sections/ScoringSection.vue'
import OtherInfoSection from './result-sections/OtherInfoSection.vue'
import ProcessingNotesSection from './result-sections/ProcessingNotesSection.vue'

// Props
interface Props {
  result: AnalysisResult | null
}

defineProps<Props>()

// 响应式数据
const activeTab = ref('basic')
</script>

<style scoped>
.analysis-result {
  height: 100%;
  padding: 0;
}

.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.result-content {
  height: 100%;
}

.result-tabs {
  height: 100%;
  border: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 自定义标签页样式 */
:deep(.el-tabs__content) {
  height: calc(100% - 60px);
  overflow: auto;
  padding: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: #f8f9fa;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-tabs__nav-wrap) {
    padding: 0 10px;
  }
  
  :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 14px;
  }
  
  :deep(.el-tab-pane) {
    padding: 15px;
  }
  
  .tab-label {
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
  }
}
</style>
