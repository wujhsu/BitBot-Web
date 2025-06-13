<template>
  <div class="home-container">
    <div class="home-content">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <el-icon class="title-icon"><Document /></el-icon>
            智能投标助手
          </h1>
          <p class="welcome-subtitle">
            基于AI的招投标文件分析系统，快速提取关键信息，助力投标决策
          </p>
          
          <!-- 功能特点 -->
          <div class="features">
            <div class="feature-item">
              <el-icon><Upload /></el-icon>
              <span>支持多种格式</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>智能信息提取</span>
            </div>
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>结构化报告</span>
            </div>
            <div class="feature-item">
              <el-icon><View /></el-icon>
              <span>PDF预览对比</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 上传区域 -->
      <div class="upload-section">
        <FileUpload />
      </div>
      
      <!-- 使用说明 -->
      <div class="instructions-section">
        <el-card class="instructions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>使用说明</span>
            </div>
          </template>
          
          <div class="instructions-content">
            <el-steps :active="4" align-center>
              <el-step title="上传文件" description="支持PDF、DOC、DOCX格式">
                <template #icon>
                  <el-icon><Upload /></el-icon>
                </template>
              </el-step>
              <el-step title="自动转换" description="非PDF文件自动转换为PDF">
                <template #icon>
                  <el-icon><RefreshRight /></el-icon>
                </template>
              </el-step>
              <el-step title="智能分析" description="AI提取招标文件关键信息">
                <template #icon>
                  <el-icon><DataAnalysis /></el-icon>
                </template>
              </el-step>
              <el-step title="查看结果" description="双栏对比查看原文和分析结果">
                <template #icon>
                  <el-icon><View /></el-icon>
                </template>
              </el-step>
            </el-steps>
            
            <div class="tips">
              <el-alert
                title="温馨提示"
                type="info"
                :closable="false"
                show-icon
              >
                <template #default>
                  <ul class="tips-list">
                    <li>支持的文件格式：PDF、DOC、DOCX</li>
                    <li>文件大小限制：最大50MB</li>
                    <li>分析时间：根据文件大小，通常需要1-3分钟</li>
                    <li>建议使用文字清晰的PDF文件以获得最佳分析效果</li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUpload from '../components/FileUpload.vue'
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 60px);
  padding: 40px 20px;
  background: transparent;
}

.home-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 48px;
  color: #667eea;
}

.welcome-subtitle {
  font-size: 20px;
  color: #606266;
  margin-bottom: 40px;
  line-height: 1.6;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  color: #667eea;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

/* 上传区域 */
.upload-section {
  display: flex;
  justify-content: center;
}

/* 使用说明 */
.instructions-section {
  margin-top: 20px;
}

.instructions-card {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.instructions-content {
  padding: 20px 0;
}

.tips {
  margin-top: 30px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  margin: 8px 0;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 20px 10px;
  }
  
  .welcome-title {
    font-size: 36px;
    flex-direction: column;
    gap: 12px;
  }
  
  .welcome-subtitle {
    font-size: 18px;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .home-content {
    gap: 30px;
  }
}

/* 步骤样式自定义 */
:deep(.el-steps--horizontal .el-step__line) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.el-step__icon.is-text) {
  border-color: #667eea;
  color: #667eea;
}

:deep(.el-step__icon.is-process) {
  background: #667eea;
  border-color: #667eea;
}

:deep(.el-step__icon.is-finish) {
  background: #67c23a;
  border-color: #67c23a;
}

:deep(.el-step__title.is-process) {
  color: #667eea;
  font-weight: 600;
}

:deep(.el-step__title.is-finish) {
  color: #67c23a;
}
</style>
