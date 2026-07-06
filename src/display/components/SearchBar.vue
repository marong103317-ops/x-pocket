<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { useTweetsStore } from '@/display/stores/tweets'

const tweetsStore = useTweetsStore()

const debouncedSearch = useDebounceFn((value: string) => {
  tweetsStore.search = value
}, 200)

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  debouncedSearch(target.value)
}
</script>

<template>
  <div class="search-bar">
    <input
      type="text"
      class="search-input"
      placeholder="搜索作者、handle 或正文内容..."
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}
</style>
