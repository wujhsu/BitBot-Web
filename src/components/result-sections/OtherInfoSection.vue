<template>
  <div class="other-info-section">
    <!-- 合同条款 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>合同条款</span>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="付款方式与周期">
          <FieldDisplay :field="otherInfo.payment_terms" />
        </el-descriptions-item>
        <el-descriptions-item label="交付要求">
          <FieldDisplay :field="otherInfo.delivery_requirements" />
        </el-descriptions-item>
        <el-descriptions-item label="投标有效期">
          <FieldDisplay :field="otherInfo.bid_validity" />
        </el-descriptions-item>
        <el-descriptions-item label="知识产权归属">
          <FieldDisplay :field="otherInfo.intellectual_property" />
        </el-descriptions-item>
        <el-descriptions-item label="保密协议要求">
          <FieldDisplay :field="otherInfo.confidentiality" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 合同主要条款 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Files /></el-icon>
          <span>合同主要条款/特殊约定</span>
        </div>
      </template>
      
      <FieldList :fields="otherInfo.contract_terms" />
    </el-card>
    
    <!-- 违约责任 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Warning /></el-icon>
          <span>违约责任</span>
        </div>
      </template>
      
      <FieldList :fields="otherInfo.breach_liability" />
    </el-card>
    
    <!-- 风险提示 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><WarningFilled /></el-icon>
          <span>潜在风险点提示</span>
        </div>
      </template>
      
      <div v-if="otherInfo.risk_warnings.length === 0" class="no-risks">
        <el-alert
          title="暂未识别到明显风险点"
          type="success"
          :closable="false"
          show-icon
        />
      </div>
      
      <div v-else class="risk-warnings">
        <div 
          v-for="(risk, index) in otherInfo.risk_warnings" 
          :key="index"
          class="risk-item"
        >
          <el-alert
            :title="`风险点 ${index + 1}`"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <FieldDisplay :field="risk" />
            </template>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { OtherInformation } from '../../types'
import FieldDisplay from '../common/FieldDisplay.vue'
import FieldList from '../common/FieldList.vue'

// Props
interface Props {
  otherInfo: OtherInformation
}

defineProps<Props>()
</script>

<style scoped>
.other-info-section {
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

.no-risks {
  padding: 20px 0;
}

.risk-warnings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-item {
  border-radius: 6px;
  overflow: hidden;
}

/* 自定义描述列表样式 */
:deep(.el-descriptions__body .el-descriptions__table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-descriptions__label) {
  background: #f8f9fa;
  font-weight: 600;
  width: 150px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .other-info-section {
    gap: 15px;
  }
  
  :deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-width: 120px;
  }
  
  :deep(.el-descriptions__label) {
    width: 120px;
    font-size: 14px;
  }
  
  .risk-warnings {
    gap: 12px;
  }
}
</style>
