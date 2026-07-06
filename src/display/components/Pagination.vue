<script setup lang="ts">
import { computed } from 'vue'
import { useTweetsStore } from '@/display/stores/tweets'

const tweetsStore = useTweetsStore()

function goTo(page: number) {
  tweetsStore.currentPage = Math.max(1, Math.min(page, tweetsStore.totalPages))
}

function prev() {
  goTo(tweetsStore.currentPage - 1)
}

function next() {
  goTo(tweetsStore.currentPage + 1)
}

// Build page number array with ellipsis
const pages = computed(() => {
  const total = tweetsStore.totalPages
  const current = tweetsStore.currentPage
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const result: (number | '...')[] = []
  result.push(1)
  if (current > 3) result.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    result.push(i)
  }
  if (current < total - 2) result.push('...')
  result.push(total)
  return result
})
</script>

<template>
  <div class="pagination">
    <span class="page-info">
      {{ tweetsStore.filteredCount }} 条，第 {{ tweetsStore.currentPage }}/{{ tweetsStore.totalPages }} 页
    </span>
    <div class="page-controls">
      <button
        class="page-btn"
        :disabled="tweetsStore.currentPage === 1"
        @click="prev"
      >‹</button>
      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: p === tweetsStore.currentPage }"
          @click="goTo(p)"
        >{{ p }}</button>
      </template>
      <button
        class="page-btn"
        :disabled="tweetsStore.currentPage >= tweetsStore.totalPages"
        @click="next"
      >›</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 0;
}

.page-info {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary);
}

.page-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 4px;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
</style>
