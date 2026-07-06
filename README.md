# X-Pocket

Chrome 扩展，收藏和管理 X.com（Twitter）推文的嵌入代码。本地存储，无隐私泄露。

<p align="center">
  <img src="public/icons/icon-128.png" width="96" alt="X-Pocket Icon">
</p>

## 功能

| 功能 | 说明 |
|------|------|
| 🔗 **右键采集** | x.com 推文右键 → 收藏到 X-Pocket |
| ❤️ **点赞即收藏** | 浏览 x.com 点红心自动收藏 |
| 📋 **粘贴采集** | 弹窗中粘贴推文嵌入 HTML，手动收藏 |
| 🗂 **浏览管理** | 宫格 / 列表双视图，搜索、排序、标签 |
| 🏷 **标签系统** | 自定义标签分类，多标签过滤 |
| 📤 **多格式导出** | JSON / HTML / Markdown / CSV / Obsidian |
| 📥 **数据导入** | JSON 格式恢复，自动去重 |
| 🖼 **原生渲染** | 详情卡片加载官方 Twitter 嵌入样式 |
| 🌙 **暗色主题** | 亮色 / 暗色 / 跟随系统 |
| 🔒 **本地存储** | 所有数据在 `chrome.storage.local`，卸载即清除 |

## 安装

### 开发者模式

```bash
pnpm install
pnpm build
```

1. Chrome → `chrome://extensions`
2. 打开右上角 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `dist/` 文件夹

### 启用官方卡片渲染

复制 `https://platform.x.com/widgets.js` 的内容到 `public/widgets.js`，重新构建：

```bash
pnpm fetch-widgets   # 需可访问 Twitter CDN
pnpm build
```

## 开发

```bash
pnpm dev           # 开发模式，HMR 热更新
pnpm build         # 类型检查 + 生产构建
pnpm test          # 运行 100+ 单元测试
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Vue 3 + TypeScript |
| 状态 | Pinia |
| 路由 | Vue Router |
| 构建 | Vite + `@crxjs/vite-plugin` |
| 测试 | Vitest |

### 项目结构

```
src/
├── background/     # Service Worker（右键菜单、oembed、消息路由）
├── content/        # Content Script（x.com 注入、点赞检测）
├── popup/          # 弹窗（粘贴采集、最近收藏）
├── display/        # 展示页（列表、详情、搜索、导出、设置）
├── shared/         # 共享层（类型、存储、解析器、导出器）
└── __tests__/      # 测试（13 个文件，100+ 用例）
```

## 许可

MIT
