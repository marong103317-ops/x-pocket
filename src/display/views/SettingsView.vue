<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/display/stores/settings'
import { useTweetsStore } from '@/display/stores/tweets'
import { exportTweets } from '@/shared/exporter'
import { downloadBlob } from '@/shared/utils/download'
import { importFromJson } from '@/shared/importer/json'
import { getAllTweets, addTweet, deleteTweet } from '@/shared/storage/tweetStore'
import { SeedDataService } from '@/shared/services/seedDataService'
import { seedAuthors, seedContents } from '@/shared/data/seedData'

const router = useRouter()
const settingsStore = useSettingsStore()
const tweetsStore = useTweetsStore()

const renderMode = ref(settingsStore.settings.renderMode)
const theme = ref(settingsStore.settings.theme)
const sortKey = ref(settingsStore.settings.defaultSort)
const sortDir = ref(settingsStore.settings.defaultSortDir)

const importMsg = ref('')
const importError = ref('')

async function saveSettings() {
  await settingsStore.update({
    renderMode: renderMode.value,
    theme: theme.value,
    defaultSort: sortKey.value,
    defaultSortDir: sortDir.value,
  })
  tweetsStore.sortKey = sortKey.value
  tweetsStore.sortDir = sortDir.value

  // Apply theme
  document.documentElement.setAttribute('data-theme', theme.value)
}

// Apply theme on load
watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
}, { immediate: true })

function handleExport() {
  const tweets = tweetsStore.filteredTweets
  const blob = exportTweets({ format: 'json', tweets })
  const filename = `x-pocket-export-${new Date().toISOString().slice(0, 10)}.json`
  downloadBlob(blob, filename)
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importMsg.value = ''
  importError.value = ''

  const result = await importFromJson(file)
  if (result.error) {
    importError.value = result.error
  } else {
    importMsg.value = `成功导入 ${result.imported} 条，跳过 ${result.skipped} 条重复`
    await tweetsStore.load()
  }
  input.value = ''
}

const seedMsg = ref('')
const clearConfirm = ref(false)

async function seedTestData() {
  seedMsg.value = '生成中...'

  try {
    const tweets = SeedDataService.generateTestTweets(seedAuthors, seedContents, {
      count: 50,
      maxDaysAgo: 30,
    })

    let count = 0
    for (const tweet of tweets) {
      const result = await addTweet(tweet)
      if (result.success) count++
    }

    seedMsg.value = `已生成 ${count} 条测试数据`
    await tweetsStore.load()
  } catch (e) {
    seedMsg.value = '生成失败，请重试'
    console.error('Seed test data failed:', e)
  }
}

function goBack() {
  router.push('/')
}

async function clearAllTweets() {
  const existing = await getAllTweets()
  for (const t of existing) {
    await deleteTweet(t.id)
  }
  clearConfirm.value = false
  await tweetsStore.load()
  seedMsg.value = '已清空全部推文'
}
</script>

<template>
  <div class="settings-view">
    <header class="settings-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>设置</h1>
    </header>

    <div class="settings-section">
      <h3>渲染模式</h3>
      <label class="radio-label">
        <input v-model="renderMode" type="radio" value="local" @change="saveSettings" />
        本地渲染（离线可用）
      </label>
      <label class="radio-label">
        <input v-model="renderMode" type="radio" value="native" @change="saveSettings" />
        X 原生渲染（需联网）
      </label>
    </div>

    <div class="settings-section">
      <h3>主题</h3>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="light" @change="saveSettings" />
        浅色
      </label>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="dark" @change="saveSettings" />
        深色
      </label>
      <label class="radio-label">
        <input v-model="theme" type="radio" value="system" @change="saveSettings" />
        跟随系统
      </label>
    </div>

    <div class="settings-section">
      <h3>默认排序</h3>
      <select v-model="sortKey" class="select-input" @change="saveSettings">
        <option value="collectedAt">收藏时间</option>
        <option value="postedAt">发布时间</option>
      </select>
      <select v-model="sortDir" class="select-input" @change="saveSettings">
        <option value="desc">降序</option>
        <option value="asc">升序</option>
      </select>
    </div>

    <div class="settings-section">
      <h3>数据管理</h3>
      <button class="action-btn" @click="handleExport">导出全部 JSON</button>
      <p class="section-desc">导出全部 {{ tweetsStore.tweetCount }} 条推文</p>

      <div class="import-area">
        <label class="action-btn import-label">
          导入数据
          <input type="file" accept=".json" class="file-input" @change="handleImport" />
        </label>
        <p v-if="importMsg" class="import-success">{{ importMsg }}</p>
        <p v-if="importError" class="import-error">{{ importError }}</p>
      </div>

      <button class="seed-btn" :disabled="seedMsg === '生成中...'" @click="seedTestData">
        🧪 生成测试数据（50条）
      </button>
      <p v-if="seedMsg" class="seed-msg">{{ seedMsg }}</p>

      <div class="danger-zone">
        <button v-if="!clearConfirm" class="clear-btn" @click="clearConfirm = true">
          🗑 清空全部推文
        </button>
        <div v-else class="clear-confirm">
          <span class="clear-warn">确定清空全部 {{ tweetsStore.tweetCount }} 条推文？不可恢复。</span>
          <button class="clear-yes" @click="clearAllTweets">确认清空</button>
          <button class="clear-no" @click="clearConfirm = false">取消</button>
        </div>
      </div>
    </div>
    <div class="settings-section sponsor-section">
      <h3>☕ 赞助</h3>
      <p class="sponsor-desc">如果 X-Pocket 对你有帮助，欢迎请我喝杯咖啡</p>
      <div class="sponsor-codes">
        <div class="sponsor-item">
          <img src="/sponsor/alipay.jpg" alt="支付宝" class="sponsor-img" />
          <span>支付宝</span>
        </div>
        <div class="sponsor-item">
          <img src="/sponsor/wechat.jpg" alt="微信支付" class="sponsor-img" />
          <span>微信支付</span>
        </div>
      </div>
      <p class="sponsor-tip">感谢支持 ❤️</p>
    </div>
  </div>
</template>

<style scoped>
.settings-view { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
.settings-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.settings-header h1 { font-size: 18px; margin: 0; }
.back-btn { background: none; border: none; font-size: 16px; color: var(--color-primary); cursor: pointer; padding: 4px 0; }
.settings-section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.settings-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.radio-label { display: block; padding: 6px 0; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.radio-label input { margin-right: 8px; }
.select-input { padding: 6px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; background: var(--color-bg); color: var(--color-text); margin-right: 8px; }
.action-btn { padding: 8px 16px; background: var(--color-primary); color: #ffffff; border: none; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer; display: inline-block; }
.import-label { position: relative; cursor: pointer; margin-top: 8px; }
.file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.import-area { margin-top: 12px; }
.section-desc { margin-top: 8px; font-size: 12px; color: var(--color-text-tertiary); }
.import-success { margin-top: 8px; font-size: 13px; color: var(--color-success); }
.import-error { margin-top: 8px; font-size: 13px; color: var(--color-danger); }
.seed-btn { margin-top: 12px; padding: 8px 16px; background: none; border: 1px dashed var(--color-border); border-radius: var(--radius-full); font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.seed-btn:hover:not(:disabled) { background: var(--color-bg-secondary); }
.seed-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.seed-msg { margin-top: 6px; font-size: 12px; color: var(--color-success); }
.danger-zone { margin-top: 16px; padding-top: 16px; border-top: 1px solid #fde8e8; }
.clear-btn { padding: 8px 16px; background: none; border: 1px solid var(--color-danger); border-radius: var(--radius-full); font-size: 13px; color: var(--color-danger); cursor: pointer; }
.clear-btn:hover { background: #fde8e8; }
.clear-confirm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.clear-warn { font-size: 13px; color: var(--color-danger); font-weight: 500; }
.clear-yes { padding: 4px 12px; background: var(--color-danger); border: none; border-radius: var(--radius-full); font-size: 12px; color: #fff; cursor: pointer; }
.clear-no { padding: 4px 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; cursor: pointer; }
.sponsor-section { border-bottom: none; text-align: center; }
.sponsor-desc { font-size: 14px; color: var(--color-text); margin-bottom: 16px; }
.sponsor-codes { display: flex; justify-content: center; gap: 24px; margin-bottom: 12px; }
.sponsor-item { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-secondary); }
.sponsor-img { width: 160px; height: 176px; border-radius: 8px; }
.sponsor-tip { font-size: 11px; color: var(--color-text-tertiary); margin-top: 8px; }
</style>
