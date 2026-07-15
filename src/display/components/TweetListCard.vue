<script setup lang="ts">
import { computed } from 'vue'
import type { CollectedTweet } from '@/shared/types/tweet'
import { formatDate } from '@/shared/utils/date'
import { useSelectionStore } from '@/display/stores/selection'

const props = defineProps<{ tweet: CollectedTweet }>()
const emit = defineEmits<{ click: []; delete: [id: string] }>()
const selectionStore = useSelectionStore()
const displayDate = computed(() => formatDate(props.tweet.postedAt))
const avatarLetter = computed(() => props.tweet.author.charAt(0) || props.tweet.handle.charAt(1) || '?')

function onCheckboxClick(e: Event) { e.stopPropagation(); selectionStore.toggle(props.tweet.id) }
</script>

<template>
  <div class="list-item" @click="emit('click')">
    <div class="list-check">
      <input type="checkbox" :checked="selectionStore.isSelected(tweet.id)" @click="onCheckboxClick" />
    </div>
    <div class="list-content">
      <div class="list-author-row">
        <div class="list-avatar">
          <span class="list-avatar-fallback">{{ avatarLetter }}</span>
        </div>
        <div class="list-author-text">
          <span class="list-name">{{ tweet.author }}</span>
          <span class="list-meta">@{{ tweet.handle }} · {{ displayDate }}</span>
        </div>
      </div>
      <div class="list-body">{{ tweet.contentText }}</div>
      <div class="list-footer">
        <a :href="tweet.tweetUrl" target="_blank" rel="noopener noreferrer" class="list-origin" @click.stop>🔗 原文</a>
        <button class="list-delete" @click.stop="emit('delete', tweet.id)">🗑 删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-item { display: flex; gap: 10px; padding: 14px; border: 1px solid rgb(207,217,222); border-radius: 12px; cursor: pointer; transition: background 0.15s; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; max-width: 680px; }
.list-item:hover { background: rgb(247,249,249); }
.list-check { display: flex; align-items: flex-start; padding-top: 4px; flex-shrink: 0; }
.list-check input { width: 16px; height: 16px; cursor: pointer; }
.list-content { flex: 1; min-width: 0; }
.list-author-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.list-avatar { width: 24px; height: 24px; border-radius: 50%; background: #1d9bf0; flex-shrink: 0; overflow: hidden; position: relative; }
.list-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.list-avatar-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 11px; }
.list-author-text { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.list-name { font-weight: 700; font-size: 14px; color: #0f1419; }
.list-meta { font-size: 13px; color: #536471; }
.list-body { font-size: 14px; line-height: 1.5; color: #0f1419; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; margin-bottom: 8px; }
.list-footer { display: flex; justify-content: space-between; align-items: center; }
.list-origin { font-size: 12px; color: #1d9bf0; text-decoration: none; }
.list-origin:hover { text-decoration: underline; }
.list-delete { background: none; border: none; font-size: 12px; color: #536471; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
.list-delete:hover { background: #fde8e8; color: #f4212e; }
</style>
