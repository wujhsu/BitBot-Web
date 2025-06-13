<template>
  <div class="scoring-section">
    <!-- 评分方法 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>评审方法</span>
        </div>
      </template>
      
      <FieldDisplay :field="scoringCriteria.evaluation_method" />
    </el-card>
    
    <!-- 分值构成 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><PieChart /></el-icon>
          <span>分值构成</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="技术分">
          <FieldDisplay :field="scoringCriteria.score_composition.technical_score" />
        </el-descriptions-item>
        <el-descriptions-item label="商务分">
          <FieldDisplay :field="scoringCriteria.score_composition.commercial_score" />
        </el-descriptions-item>
        <el-descriptions-item label="价格分">
          <FieldDisplay :field="scoringCriteria.score_composition.price_score" />
        </el-descriptions-item>
        <el-descriptions-item label="其他分值">
          <div v-if="scoringCriteria.score_composition.other_scores.length > 0">
            <FieldList :fields="scoringCriteria.score_composition.other_scores" />
          </div>
          <el-text v-else type="info">无其他分值</el-text>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 详细评分细则 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>详细评分细则</span>
        </div>
      </template>
      
      <div v-if="scoringCriteria.detailed_scoring.length === 0" class="no-data">
        <el-empty description="暂无详细评分细则" />
      </div>
      
      <el-table v-else :data="scoringCriteria.detailed_scoring" stripe>
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="item_name" label="评分项" />
        <el-table-column prop="max_score" label="最高分值" width="100" />
        <el-table-column prop="criteria" label="评分标准" />
      </el-table>
    </el-card>
    
    <!-- 否决项条款 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><WarningFilled /></el-icon>
          <span>否决项条款</span>
        </div>
      </template>
      
      <FieldList :fields="scoringCriteria.disqualification_clauses" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { ScoringCriteria } from '../../types'
import FieldDisplay from '../common/FieldDisplay.vue'
import FieldList from '../common/FieldList.vue'

// Props
interface Props {
  scoringCriteria: ScoringCriteria
}

defineProps<Props>()
</script>

<style scoped>
.scoring-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
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

.no-data {
  padding: 40px 0;
  text-align: center;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: #f8f9fa;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .scoring-section {
    gap: 15px;
  }
  
  :deep(.el-table) {
    font-size: 14px;
  }
  
  :deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-width: 100px;
  }
}
</style>
