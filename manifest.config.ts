import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Pocket for X',
  version: '0.1.0',
  description: '一键收藏 X.com (Twitter) 推文嵌入代码，支持本地浏览、标签管理、多格式导出',
  permissions: [
    'storage',
    'contextMenus',
    'notifications',
  ],
  host_permissions: [
    'https://x.com/*',
    'https://twitter.com/*',
    'https://publish.twitter.com/oembed*',
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Pocket for X — 收藏推文',
  },
  content_scripts: [
    {
      matches: ['https://x.com/*', 'https://twitter.com/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_start',
    },
  ],
  web_accessible_resources: [
    {
      resources: ['widgets.js'],
      matches: ['https://x.com/*', 'https://twitter.com/*'],
    },
  ],
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
})
