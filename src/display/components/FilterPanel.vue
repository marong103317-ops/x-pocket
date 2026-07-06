<script setup lang="ts">
import { ref } from 'vue'
import { useTweetsStore } from '@/display/stores/tweets'

const tweetsStore = useTweetsStore()
const expanded = ref(false)

function clearFilters() {
  tweetsStore.clearFilters()
}

const postedAfter = ref('')
const postedBefore = ref('')
const collectedAfter = ref('')
const collectedBefore = ref('')

function applyPostedAfter(e: Event) {
  tweetsStore.filterPostedAfter = (e.target as HTMLInputElement).value
}
function applyPostedBefore(e: Event) {
  tweetsStore.filterPostedBefore = (e.target as HTMLInputElement).value
}
function applyCollectedAfter(e: Event) {
  tweetsStore.filterCollectedAfter = (e.target as HTMLInputElement).value
}
function applyCollectedBefore(e: Event) {
  tweetsStore.filterCollectedBefore = (e.target as HTMLInputElement).value
}
function applyAuthor(e: Event) {
  tweetsStore.filterAuthor = (e.target as HTMLInputElement).value
}
function applyHandle(e: Event) {
  tweetsStore.filterHandle = (e.target as HTMLInputElement).value
}
</script>

<template>
  <div class="filter-panel">
    <button class="filter-toggle" @click="expanded = !expanded">
      🔍 筛选 {{ tweetsStore.hasFilters ? `(${tweetsStore.filteredTweets.length})` : '' }}
      <span class="filter-arrow">{{ expanded ? '▴' : '▾' }}</span>
    </button>

    <div v-if="expanded" class="filter-body">
      <div class="filter-row">
        <label>创作者</label>
        <input
          type="text"
          placeholder="作者名..."
          :value="tweetsStore.filterAuthor"
          @input="applyAuthor"
          class="filter-input"
        />
      </div>
      <div class="filter-row">
        <label>Handle</label>
        <input
          type="text"
          placeholder="@handle..."
          :value="tweetsStore.filterHandle"
          @input="applyHandle"
          class="filter-input"
        />
      </div>
      <div class="filter-row">
        <label>发布时间</label>
        <div class="date-range">
          <input
            type="date"
            :value="tweetsStore.filterPostedAfter"
            @input="applyPostedAfter"
            class="filter-input"
          />
          <span class="date-sep">—</span>
          <input
            type="date"
            :value="tweetsStore.filterPostedBefore"
            @input="applyPostedBefore"
            class="filter-input"
          />
        </div>
      </div>
      <div class="filter-row">
        <label>收藏时间</label>
        <div class="date-range">
          <input
            type="date"
            :value="tweetsStore.filterCollectedAfter"
            @input="applyCollectedAfter"
            class="filter-input"
          />
          <span class="date-sep">—</span>
          <input
            type="date"
            :value="tweetsStore.filterCollectedBefore"
            @input="applyCollectedBefore"
            class="filter-input"
          />
        </div>
      </div>

      <button
        v-if="tweetsStore.hasFilters"
        class="filter-clear"
        @click="clearFilters"
      >
        清除全部筛选
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  margin-bottom: 12px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.filter-toggle:hover {
  background: var(--color-bg-secondary);
}

.filter-arrow {
  font-size: 10px;
  color: var(--color-text-tertiary);
}

.filter-body {
  margin-top: 10px;
  padding: 14px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-row label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.filter-input {
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: var(--color-primary);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-range .filter-input {
  flex: 1;
}

.date-sep {
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.filter-clear {
  padding: 5px 0;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--color-danger);
  cursor: pointer;
  text-align: left;
}

.filter-clear:hover {
  text-decoration: underline;
}
</style>
