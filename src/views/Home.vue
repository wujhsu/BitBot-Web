<template>
  <div class="home-container">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 欢迎区域 -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-header">
            <h1 class="app-title">智能投标助手</h1>
            <p class="app-description">基于AI技术的招投标文件智能分析系统</p>
          </div>

          <!-- 核心功能展示 -->
          <div class="features-grid">
            <div class="feature-item">
              <el-icon><Upload /></el-icon>
              <span>多格式支持</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>智能分析</span>
            </div>
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>结构化报告</span>
            </div>
            <div class="feature-item">
              <el-icon><View /></el-icon>
              <span>双栏对比</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传区域 -->
      <div class="upload-section">
        <div class="upload-wrapper">
          <FileUpload />
        </div>
      </div>
    </div>

    <!-- 底部信息区域 -->
    <div class="info-section">
      <div class="info-content">
      
        <!-- 使用说明 -->
        <div class="usage-section">
          <p class="usage-text">
            上传招标文件，AI自动分析并生成结构化报告
          </p>
        </div>
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
  background: transparent;
  overflow-x: hidden;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero区域 */
.hero-section {
  padding: 60px 0 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin: 40px 0 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.hero-content {
  padding: 0 40px;
}

.hero-header {
  margin-bottom: 40px;
}

.app-title {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.app-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 功能特点网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.feature-item:hover {
  background: #f1f3f4;
  transform: translateY(-2px);
}

.feature-item .el-icon {
  font-size: 24px;
  color: #4a5568;
}

.feature-item span {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
  text-align: center;
}

/* 上传区域 */
.upload-section {
  margin: 40px 0;
}

.upload-wrapper {
  margin: 0 auto;
}

/* 信息区域 */
.info-section {
  background: white;
  border-radius: 16px;
  margin: 30px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.info-content {
  padding: 30px 40px;
}

/* 使用说明 */
.usage-section {
  text-align: center;
}

.usage-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    padding: 0 15px;
  }

  .hero-content {
    padding: 0 30px;
  }

  .info-content {
    padding: 25px 30px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 10px;
  }

  .hero-section {
    padding: 40px 0 30px;
    margin: 30px 0 20px;
  }

  .hero-content {
    padding: 0 20px;
  }

  .app-title {
    font-size: 28px;
  }

  .app-description {
    font-size: 15px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 15px;
  }

  .feature-item {
    padding: 15px 10px;
  }

  .feature-item .el-icon {
    font-size: 20px;
  }

  .feature-item span {
    font-size: 13px;
  }

  .upload-section {
    margin: 30px 0;
  }

  .info-section {
    margin: 20px 0;
  }

  .info-content {
    padding: 20px;
  }

  .usage-text {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 30px 0 25px;
  }

  .app-title {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .feature-item {
    padding: 12px 8px;
  }

  .info-content {
    padding: 15px;
  }

  .usage-text {
    font-size: 14px;
  }
}
</style>
