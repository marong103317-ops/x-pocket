import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'X-Pocket',
  version: '0.1.0',
  description: '收藏和管理 X.com 推文嵌入代码',
  permissions: [
    'storage',
    'contextMenus',
    'scripting',
    'activeTab',
    'notifications',
    'downloads',
  ],
  optional_permissions: [
    'unlimitedStorage',
  ],
  host_permissions: [
    'https://x.com/*',
    'https://twitter.com/*',
    'https://publish.twitter.com/*',
    'https://platform.x.com/*',
    'https://platform.twitter.com/*',
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'X-Pocket',
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
      resources: ['src/display/index.html', 'widgets.js'],
      matches: ['<all_urls>'],
    },
  ],
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
})
