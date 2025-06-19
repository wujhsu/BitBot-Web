<template>
  <div class="basic-info-section">
    <!-- 项目基本信息 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>项目基本信息</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">
          <FieldDisplay :field="basicInfo.project_name" />
        </el-descriptions-item>
        <el-descriptions-item label="招标编号">
          <FieldDisplay :field="basicInfo.tender_number" />
        </el-descriptions-item>
        <el-descriptions-item label="采购预算">
          <FieldDisplay :field="basicInfo.budget_amount" />
        </el-descriptions-item>
        <el-descriptions-item label="投标截止时间">
          <FieldDisplay :field="basicInfo.bid_deadline" />
        </el-descriptions-item>
        <el-descriptions-item label="开标时间">
          <FieldDisplay :field="basicInfo.bid_opening_time" />
        </el-descriptions-item>
        <el-descriptions-item label="投标保证金">
          <FieldDisplay :field="basicInfo.bid_bond_amount" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 联系信息 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Phone /></el-icon>
          <span>联系信息</span>
        </div>
      </template>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="采购人">
          <FieldDisplay :field="basicInfo.purchaser_name" />
        </el-descriptions-item>
        <el-descriptions-item label="采购人联系方式">
          <FieldDisplay :field="basicInfo.purchaser_contact" />
        </el-descriptions-item>
        <el-descriptions-item label="代理机构">
          <FieldDisplay :field="basicInfo.agent_name" />
        </el-descriptions-item>
        <el-descriptions-item label="代理机构联系方式">
          <FieldDisplay :field="basicInfo.agent_contact" />
        </el-descriptions-item>
        <el-descriptions-item label="保证金账户">
          <FieldDisplay :field="basicInfo.bid_bond_account" />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 投标人资格要求 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><UserFilled /></el-icon>
          <span>投标人资格要求</span>
        </div>
      </template>
      
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="企业资质要求" name="certifications">
          <FieldList :fields="basicInfo.qualification_criteria.company_certifications" />
        </el-collapse-item>
        <el-collapse-item title="项目业绩要求" name="experience">
          <FieldList :fields="basicInfo.qualification_criteria.project_experience" />
        </el-collapse-item>
        <el-collapse-item title="团队人员要求" name="team">
          <FieldList :fields="basicInfo.qualification_criteria.team_requirements" />
        </el-collapse-item>
        <el-collapse-item title="其他硬性要求" name="other">
          <FieldList :fields="basicInfo.qualification_criteria.other_requirements" />
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 投标文件要求 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Files /></el-icon>
          <span>投标文件要求</span>
        </div>
      </template>

      <el-collapse v-model="bidDocActiveCollapse">
        <el-collapse-item title="组成与编制规范" name="composition">
          <FieldList :fields="basicInfo.bid_document_requirements.composition_and_format" />
        </el-collapse-item>
        <el-collapse-item title="装订与密封要求" name="binding">
          <FieldList :fields="basicInfo.bid_document_requirements.binding_and_sealing" />
        </el-collapse-item>
        <el-collapse-item title="签字盖章要求" name="signature">
          <FieldList :fields="basicInfo.bid_document_requirements.signature_and_seal" />
        </el-collapse-item>
        <el-collapse-item title="投标文件章节框架（目录）" name="structure">
          <DocumentStructureDisplay :fields="basicInfo.bid_document_requirements.document_structure" />
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 开评定标流程 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Operation /></el-icon>
          <span>开评定标流程</span>
        </div>
      </template>

      <el-collapse v-model="evaluationActiveCollapse">
        <el-collapse-item title="开标环节（时间、地点、程序）" name="opening">
          <FieldList :fields="basicInfo.bid_evaluation_process.bid_opening" />
        </el-collapse-item>
        <el-collapse-item title="评标环节（评委会、评审方法/标准、主要流程）" name="evaluation">
          <FieldList :fields="basicInfo.bid_evaluation_process.evaluation" />
        </el-collapse-item>
        <el-collapse-item title="定标环节（定标原则、中标通知）" name="award">
          <FieldList :fields="basicInfo.bid_evaluation_process.award_decision" />
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BasicInformation } from '../../types'
import FieldDisplay from '../common/FieldDisplay.vue'
import FieldList from '../common/FieldList.vue'
import DocumentStructureDisplay from '../common/DocumentStructureDisplay.vue'

// Props
interface Props {
  basicInfo: BasicInformation
}

defineProps<Props>()

// 响应式数据
const activeCollapse = ref(['certifications', 'experience', 'team', 'other'])
const bidDocActiveCollapse = ref(['composition', 'binding', 'signature', 'structure'])
const evaluationActiveCollapse = ref(['opening', 'evaluation', 'award'])
</script>

<style scoped>
.basic-info-section {
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

/* 折叠面板样式 */
:deep(.el-collapse-item__header) {
  font-weight: 600;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-descriptions) {
    --el-descriptions-item-bordered-label-width: 120px;
  }
  
  :deep(.el-descriptions__label) {
    width: 120px;
    font-size: 14px;
  }
  
  .basic-info-section {
    gap: 15px;
  }
}
</style>
