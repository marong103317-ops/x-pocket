<script setup lang="ts">
import { useTweetsStore } from '@/display/stores/tweets'
import { exportTweets } from '@/shared/exporter'
import { downloadBlob } from '@/shared/utils/download'

const tweetsStore = useTweetsStore()

function handleExport() {
  const tweets = tweetsStore.filteredTweets
  const blob = exportTweets({ format: 'json', tweets })
  const filename = `x-pocket-export-${new Date().toISOString().slice(0, 10)}.json`
  downloadBlob(blob, filename)
}
</script>

<template>
  <button class="export-btn" @click="handleExport">
    导出 JSON（{{ tweetsStore.filteredTweets.length }} 条）
  </button>
</template>

<style scoped>
.export-btn {
  display: block;
  width: fit-content;
  margin: 24px auto 0;
  padding: 10px 24px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.export-btn:hover {
  background: var(--color-primary-hover);
}
</style>
