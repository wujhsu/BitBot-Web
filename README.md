# BidBot3 前端 - 智能投标助手 Web 界面

基于 Vue 3 + TypeScript + Element Plus 构建的现代化招投标文件分析前端应用。

## 🚀 功能特性

- 📱 **现代化界面**: 基于 Element Plus 的响应式设计
- 📄 **文件上传**: 支持拖拽上传 PDF、DOC、DOCX 格式文件
- 🔍 **实时分析**: 实时显示文档分析进度和状态
- 📊 **双栏布局**: 分析结果与原文对比查看
- 📋 **结构化展示**: 清晰展示基础信息、评分标准、合同信息
- 💾 **报告下载**: 支持下载 Markdown 格式的分析报告
- 🔄 **会话管理**: 多用户隔离的会话管理机制

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **PDF 预览**: PDF.js

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── FileUpload.vue      # 文件上传组件
│   │   ├── ProgressIndicator.vue # 进度指示器
│   │   ├── AnalysisResult.vue    # 分析结果展示
│   │   └── SimplePDFViewer.vue   # PDF 预览组件
│   ├── views/               # 页面组件
│   │   ├── Home.vue            # 首页
│   │   └── Analysis.vue        # 分析结果页
│   ├── stores/              # Pinia 状态管理
│   │   ├── upload.ts           # 上传状态
│   │   └── session.ts          # 会话管理
│   ├── api/                 # API 接口
│   │   └── index.ts            # API 调用封装
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   └── router/              # 路由配置
│       └── index.ts
├── public/                  # 静态资源
├── Dockerfile              # Docker 镜像构建文件
├── nginx.conf              # Nginx 配置文件
├── .dockerignore           # Docker 构建忽略文件
└── package.json            # 项目依赖配置
```

## 🚀 快速开始

### 方式一：传统开发环境

#### 1. 环境要求
- Node.js 18+
- npm 或 yarn

#### 2. 安装依赖
```bash
npm install
```

#### 3. 启动开发服务器
```bash
npm run dev
```

#### 4. 构建生产版本
```bash
npm run build
```

#### 5. 预览生产版本
```bash
npm run preview
```

### 方式二：CICD 部署（推荐生产环境）

#### 🚀 CICD 部署步骤

**1. 构建应用**
```bash
# 安装依赖
npm install

# 生产环境构建
npm run build:prod
```

**2. 部署到服务器**
- 将 `dist` 目录内容部署到 Web 服务器
- 确保 nginx 或其他 Web 服务器配置了 API 代理
- 配置 Vue Router history 模式支持

#### 🐳 Docker 部署（如需要）

如果 CICD 环境需要 Docker 部署，可参考项目根目录的 `docker-compose.yml` 配置。

**注意**：前端目录下的 `Dockerfile` 和 `nginx.conf` 已移除，避免与 CICD Pipeline 模板冲突。

## 🔧 配置说明

### API 地址配置

项目会根据运行环境自动选择合适的 API 地址：

**开发环境**
- 使用本地后端：`http://localhost:8000/api`
- Vite 开发服务器会自动代理 `/api` 请求到本地后端

**生产环境**
- 使用相对路径：`/api`
- 通过 nginx 代理到实际的后端服务

### 开发环境配置

**vite.config.ts** - Vite 配置
```typescript
export default defineConfig({
  server: {
    port: 3001,           // 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### 构建命令

```bash
# 开发环境构建
npm run build:dev

# 生产环境构建
npm run build:prod

# 默认构建（使用当前NODE_ENV）
npm run build
```

**注意事项**
- 已移除 `Dockerfile` 和 `nginx.conf`，避免与 CICD Pipeline 模板冲突
- 项目依赖 CICD 环境提供的 nginx 组件进行代理配置
- API 地址会根据构建环境自动选择，无需手动配置

## 🌐 API 接口

前端通过以下 API 与后端通信：

```typescript
// 文件上传
POST /api/upload

// 启动分析
POST /api/analyze

// 获取分析状态
GET /api/analysis/{taskId}

// 下载报告
GET /api/download-report/{taskId}

// 健康检查
GET /api/health
```

## 📱 页面功能

### 首页 (Home.vue)
- 🎯 产品介绍和功能展示
- 📤 文件上传界面
- ✅ 文件格式验证（PDF、DOC、DOCX）
- 📏 文件大小限制（50MB）

### 分析页面 (Analysis.vue)
- 📊 实时分析进度显示
- 🔄 自动状态轮询
- 📋 结构化分析结果展示
- 👀 PDF 原文预览
- 🔀 双栏布局切换
- 💾 分析报告下载

## 🎨 UI 组件

### FileUpload 组件
- 拖拽上传支持
- 文件类型和大小验证
- 上传进度显示
- 错误处理

### ProgressIndicator 组件
- 分析阶段可视化
- 实时进度更新
- 错误状态显示

### AnalysisResult 组件
- 基础信息表格展示
- 评分标准结构化显示
- 合同信息整理
- 来源信息标注

### SimplePDFViewer 组件
- PDF.js 集成
- 页面导航
- 缩放控制

## 🔒 会话管理

- 🆔 自动生成唯一会话 ID
- 🔐 多用户数据隔离
- 💾 会话状态持久化
- 🧹 自动过期清理

## 🚨 故障排除

### 常见问题

**Q: 页面无法访问后端 API**
```bash
# 检查后端服务状态
curl http://localhost:8000/health

# 检查 Docker 网络
docker network ls
docker network inspect bidbot-network
```

**Q: 文件上传失败**
- 检查文件格式是否支持（PDF、DOC、DOCX）
- 检查文件大小是否超过 50MB
- 检查网络连接是否正常

**Q: Docker 构建失败**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker build --no-cache -t bidbot-frontend .
```

**Q: Nginx 配置问题**
```bash
# 检查 Nginx 配置语法
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf nginx:alpine nginx -t

# 查看 Nginx 日志
docker logs bidbot-frontend
```

### 开发调试

**启用开发工具**
```bash
# 安装 Vue DevTools
npm install -g @vue/devtools

# 启动开发服务器（带调试）
npm run dev
```

**查看构建分析**
```bash
# 分析构建产物
npm run build -- --report
```

## 📚 相关文档

- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 组件库](https://element-plus.org/)
- [Vite 构建工具](https://vitejs.dev/)
- [Docker 部署指南](../DOCKER_DEPLOYMENT.md)

## 🤝 开发建议

### IDE 推荐配置
- **编辑器**: VSCode
- **插件**:
  - Volar (Vue 3 支持)
  - TypeScript Vue Plugin
  - ESLint
  - Prettier

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](../LICENSE) 文件。
