<script setup lang="ts">
// 主应用组件
</script>

<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon><Document /></el-icon>
            智能投标助手
          </h1>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f7fafc;
  position: relative;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
}

.app-title:hover {
  color: #4a5568;
}

.app-title .el-icon {
  font-size: 28px;
  color: #4a5568;
  transition: all 0.3s ease;
}

.app-title:hover .el-icon {
  color: #2d3748;
}

.app-main {
  padding: 0;
  background: transparent;
  position: relative;
  z-index: 1;
  overflow: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 15px;
  }

  .app-title {
    font-size: 20px;
  }

  .app-title .el-icon {
    font-size: 24px;
  }
}
</style>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100vh;
}

/* 全局滚动条样式 */
*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* Element Plus 组件样式优化 */
.el-button--primary {
  background: #4a5568;
  border: none;
  box-shadow: 0 4px 15px rgba(74, 85, 104, 0.3);
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  background: #2d3748;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 85, 104, 0.4);
}

.el-card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
</style>
