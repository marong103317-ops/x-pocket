<script setup lang="ts">
import { ref } from 'vue'
import { exportTweets } from '@/shared/exporter'
import { downloadBlob } from '@/shared/utils/download'
import type { CollectedTweet } from '@/shared/types/tweet'

const props = defineProps<{
  tweets: CollectedTweet[]
  allTweets: CollectedTweet[]
  selectedTweets?: CollectedTweet[]
}>()

const emit = defineEmits<{ close: [] }>()

const format = ref<'json' | 'html' | 'markdown' | 'csv' | 'obsidian'>('json')
const includeScript = ref(true)
const scope = ref<'page' | 'all' | 'selected'>(props.selectedTweets?.length ? 'selected' : 'page')

function getExtension(): string {
  switch (format.value) {
    case 'json': return 'json'
    case 'html': return 'html'
    case 'markdown': return 'md'
    case 'csv': return 'csv'
    case 'obsidian': return 'md'
  }
}

function getData(): CollectedTweet[] {
  switch (scope.value) {
    case 'selected': return props.selectedTweets ?? []
    case 'all': return props.allTweets
    default: return props.tweets
  }
}

function handleExport() {
  try {
    const data = getData()
    if (data.length === 0) {
      alert('没有可导出的推文')
      return
    }
    const ts = Date.now()
    const rnd = Math.random().toString(36).slice(2, 8)
    const firstId = data[0].tweetId || 'tweets'
    const filename = `${firstId}-${ts}-${rnd}.${getExtension()}`
    const blob = exportTweets({ format: format.value, tweets: data, includeNativeScript: includeScript.value })
    downloadBlob(blob, filename)
    emit('close')
  } catch (e) {
    console.error('[Pocket for X] Export failed:', e)
    alert('导出失败，请重试')
  }
}
</script>

<template>
  <div class="export-overlay" @click.self="emit('close')">
    <div class="export-dialog">
      <div class="export-header">
        <h3>导出推文</h3>
        <button class="export-close" @click="emit('close')">✕</button>
      </div>

      <div class="export-section">
        <h4>格式</h4>
        <label v-for="f in (['json', 'html', 'markdown', 'csv', 'obsidian'] as const)" :key="f" class="radio-label">
          <input v-model="format" type="radio" :value="f" /> {{ f.toUpperCase() }}
        </label>
      </div>

      <div class="export-section">
        <h4>范围</h4>
        <label v-if="selectedTweets?.length" class="radio-label">
          <input v-model="scope" type="radio" value="selected" />
          已选中（{{ selectedTweets.length }} 条）
        </label>
        <label class="radio-label">
          <input v-model="scope" type="radio" value="page" />
          当前页（{{ props.tweets.length }} 条）
        </label>
        <label class="radio-label">
          <input v-model="scope" type="radio" value="all" />
          全部（{{ props.allTweets.length }} 条）
        </label>
      </div>

      <div v-if="format === 'html'" class="export-section">
        <label class="checkbox-label">
          <input v-model="includeScript" type="checkbox" /> 包含 X 原生渲染脚本
        </label>
      </div>

      <div class="export-actions">
        <button class="export-cancel" @click="emit('close')">取消</button>
        <button class="export-confirm" @click="handleExport">导出 {{ getData().length }} 条</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.export-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1500; }
.export-dialog { background: var(--color-bg); border-radius: var(--radius-lg); padding: 24px; max-width: 400px; width: calc(100% - 48px); box-shadow: var(--shadow-lg); }
.export-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.export-header h3 { margin: 0; font-size: 16px; }
.export-close { background: none; border: none; font-size: 18px; color: var(--color-text-secondary); cursor: pointer; }
.export-section { margin-bottom: 16px; }
.export-section h4 { font-size: 13px; font-weight: 600; margin: 0 0 6px 0; color: var(--color-text); }
.radio-label { display: block; padding: 4px 0; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.radio-label input { margin-right: 6px; }
.checkbox-label { display: block; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; }
.checkbox-label input { margin-right: 6px; }
.export-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.export-cancel { padding: 6px 16px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 13px; color: var(--color-text); cursor: pointer; }
.export-confirm { padding: 6px 16px; background: var(--color-primary); border: none; border-radius: var(--radius-full); font-size: 13px; color: #fff; font-weight: 600; cursor: pointer; }
</style>
