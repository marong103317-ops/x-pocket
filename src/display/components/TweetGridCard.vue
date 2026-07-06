<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CollectedTweet } from '@/shared/types/tweet'
import { formatDate } from '@/shared/utils/date'
import { useSelectionStore } from '@/display/stores/selection'

const props = defineProps<{
  tweet: CollectedTweet
}>()

const emit = defineEmits<{
  click: []
}>()

const selectionStore = useSelectionStore()
const avatarError = ref(false)
const avatarUrl = computed(() => `https://unavatar.io/twitter/${props.tweet.handle}`)

function onCheckboxClick(e: Event) {
  e.stopPropagation()
  selectionStore.toggle(props.tweet.id)
}
</script>

<template>
  <div class="grid-card" @click="emit('click')">
    <div class="card-select">
      <input
        type="checkbox"
        :checked="selectionStore.isSelected(tweet.id)"
        @click="onCheckboxClick"
      />
      <span class="card-collected">收藏于 {{ formatDate(tweet.collectedAt) }}</span>
    </div>
    <div class="card-body">{{ tweet.contentText }}</div>
    <div class="card-footer">
      <div class="card-footer-avatar">
        <img v-if="!avatarError" :src="avatarUrl" class="card-avatar-img" alt="" referrerpolicy="no-referrer" @error="avatarError = true" />
        <span v-else class="card-avatar-fallback">{{ tweet.author.charAt(0) }}</span>
      </div>
      <div class="card-footer-text">
        <span class="card-author">{{ tweet.author }}</span>
        <span class="card-meta">@{{ tweet.handle }} · {{ formatDate(tweet.postedAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-card {
  background: var(--color-bg); border: 1px solid rgb(207,217,222); border-radius: 12px;
  overflow: hidden; cursor: pointer; position: relative;
  display: flex; flex-direction: column;
  transition: box-shadow 0.15s ease;
}
.grid-card:hover { box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.12); }

.card-select {
  position: absolute; top: 4px; left: 8px; z-index: 10;
  display: flex; align-items: center; gap: 6px;
}
.card-select input { width: 16px; height: 16px; cursor: pointer; margin: 0; }
.card-collected { font-size: 11px; color: #7c8b98; white-space: nowrap; }

.card-body {
  padding: 24px 12px 12px; font-size: 14px; line-height: 1.5; color: var(--color-text);
  word-break: break-word; flex: 1;
}
.card-footer {
  padding: 8px 12px 12px; display: flex; align-items: center; gap: 8px;
}
.card-footer-avatar {
  width: 24px; height: 24px; border-radius: 50%; background: #1d9bf0; flex-shrink: 0; overflow: hidden; position: relative;
}
.card-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.card-avatar-fallback {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 11px;
}
.card-footer-text { display: flex; flex-direction: column; min-width: 0; }
.card-author { font-size: 13px; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { font-size: 11px; color: var(--color-text-tertiary); }
</style>
