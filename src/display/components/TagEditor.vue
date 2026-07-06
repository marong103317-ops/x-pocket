<script setup lang="ts">
import { ref } from 'vue'
import { useTagsStore } from '@/display/stores/tags'
import { useTweetsStore } from '@/display/stores/tweets'
import { updateTweet } from '@/shared/storage/tweetStore'

const props = defineProps<{
  tweetId: string
  currentTags: string[]
}>()

const tagsStore = useTagsStore()
const tweetsStore = useTweetsStore()

const newTagName = ref('')

async function toggleTag(tagId: string) {
  const next = props.currentTags.includes(tagId)
    ? props.currentTags.filter(id => id !== tagId)
    : [...props.currentTags, tagId]

  await updateTweet(props.tweetId, { tags: next })
  if (tweetsStore.tweets[props.tweetId]) {
    tweetsStore.tweets[props.tweetId].tags = next
  }
}

async function createAndAdd() {
  const name = newTagName.value.trim()
  if (!name) return
  const tag = await tagsStore.add(name)
  await toggleTag(tag.id)
  newTagName.value = ''
}
</script>

<template>
  <div class="tag-editor">
    <div class="tag-editor-chips">
      <button
        v-for="tag in tagsStore.tagList"
        :key="tag.id"
        class="te-chip"
        :class="{ active: currentTags.includes(tag.id) }"
        :style="{ '--tag-color': tag.color }"
        @click="toggleTag(tag.id)"
      >
        {{ tag.name }}
      </button>
    </div>
    <div class="tag-editor-input">
      <input
        v-model="newTagName"
        type="text"
        placeholder="输入标签名..."
        class="te-input"
        @keyup.enter="createAndAdd"
      />
      <button class="te-add-btn" @click="createAndAdd">+</button>
    </div>
  </div>
</template>

<style scoped>
.tag-editor {
  padding: 8px 0;
}

.tag-editor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.te-chip {
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 12px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.te-chip.active {
  background: var(--tag-color, #1d9bf0);
  color: #fff;
  border-color: var(--tag-color, #1d9bf0);
}

.tag-editor-input {
  display: flex;
  gap: 4px;
}

.te-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 12px;
  outline: none;
  background: var(--color-bg);
  color: var(--color-text);
}

.te-input:focus {
  border-color: var(--color-primary);
}

.te-add-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  font-size: 16px;
  background: var(--color-bg);
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
