<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useTagsStore } from '@/display/stores/tags'
import { useTweetsStore } from '@/display/stores/tweets'

const tagsStore = useTagsStore()
const tweetsStore = useTweetsStore()

onMounted(async () => {
  await tagsStore.load()
})

function toggleTag(tagId: string) {
  const idx = tweetsStore.activeTagIds.indexOf(tagId)
  if (idx >= 0) {
    tweetsStore.activeTagIds = tweetsStore.activeTagIds.filter(id => id !== tagId)
  } else {
    tweetsStore.activeTagIds = [...tweetsStore.activeTagIds, tagId]
  }
}
</script>

<template>
  <div v-if="tagsStore.tagList.length > 0" class="tag-filter">
    <h4>标签过滤</h4>
    <div class="tag-chips">
      <button
        v-for="tag in tagsStore.tagList"
        :key="tag.id"
        class="tag-chip"
        :class="{ active: tweetsStore.activeTagIds.includes(tag.id) }"
        :style="{ '--tag-color': tag.color }"
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>
    <button
      v-if="tweetsStore.activeTagIds.length > 0"
      class="clear-tags"
      @click="tweetsStore.activeTagIds = []"
    >
      清除过滤
    </button>
  </div>
</template>

<style scoped>
.tag-filter {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.tag-filter h4 {
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--color-text-secondary);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-chip {
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 12px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tag-chip.active {
  background: var(--tag-color, #1d9bf0);
  color: #ffffff;
  border-color: var(--tag-color, #1d9bf0);
}

.tag-chip:hover:not(.active) {
  background: var(--color-bg-secondary);
}

.clear-tags {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>
