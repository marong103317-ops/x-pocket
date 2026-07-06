<script setup lang="ts">
import { useTweetsStore } from '@/display/stores/tweets'

const tweetsStore = useTweetsStore()

function setSortKey(key: 'collectedAt' | 'postedAt') {
  tweetsStore.sortKey = key
}

function toggleSortDir() {
  tweetsStore.sortDir = tweetsStore.sortDir === 'desc' ? 'asc' : 'desc'
}
</script>

<template>
  <div class="sort-controls">
    <select
      class="sort-select"
      :value="tweetsStore.sortKey"
      @change="setSortKey(($event.target as HTMLSelectElement).value as 'collectedAt' | 'postedAt')"
    >
      <option value="collectedAt">收藏时间</option>
      <option value="postedAt">发布时间</option>
    </select>
    <button class="sort-dir-btn" @click="toggleSortDir">
      {{ tweetsStore.sortDir === 'desc' ? '↓ 降序' : '↑ 升序' }}
    </button>
  </div>
</template>

<style scoped>
.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
}

.sort-dir-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.sort-dir-btn:hover {
  background: var(--color-bg-secondary);
}
</style>
