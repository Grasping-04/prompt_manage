# Prompt Manage - Prompt 管理工具

一个简洁优雅的 Prompt 管理工具，帮助你高效管理和组织 AI Prompt 模板。

## 功能特性

- **任务管理** - 创建、编辑、删除任务，支持优先级和状态管理
- **项目分组** - 按项目组织你的任务和 Prompt
- **Prompt 模板** - 保存和复用常用的 Prompt 模板，支持变量替换
- **主题切换** - 支持明暗主题和多种主题色（蓝、紫、绿、橙、粉、青）
- **本地存储** - 数据保存在浏览器本地，无需后端服务

## 在线访问

你可以直接通过以下地址访问本应用：

- **Vercel**: https://prompt-manage-3atk.vercel.app/
- **Cloudflare Workers**: https://promptmanage.577049887.workers.dev/

## 本地运行

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 方式一：使用启动脚本（推荐）

双击运行 `start.bat` 文件，脚本会自动启动开发服务器并打开浏览器。

### 方式二：手动启动

1. 安装依赖：
   
   ```bash
   npm install
   ```

2. 启动开发服务器：
   
   ```bash
   npm run dev
   ```

3. 在浏览器中访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React Icons
