<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { CollectedTweet } from '@/shared/types/tweet'
import { renderTweet } from '@/display/utils/widgetsLoader'

const props = defineProps<{
  tweet: CollectedTweet
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const nativeReady = ref(false)
const nativeError = ref('')

onMounted(async () => {
  await nextTick()
  if (!containerRef.value) return
  try {
    await renderTweet(containerRef.value)
    nativeReady.value = true
  } catch (e) {
    nativeError.value = '原生渲染加载失败'
    console.warn('[X-Pocket] Native render failed:', e)
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="detail-overlay" @click.self="emit('close')" @keydown="onKeydown" tabindex="-1">
    <div class="detail-card" @click.stop>
      <div class="detail-header">
        <span class="detail-collected-at">收藏于 {{ tweet.collectedAt.slice(0, 10) }}</span>
        <button class="detail-close" @click="emit('close')">✕</button>
      </div>

      <div ref="containerRef" class="detail-content">
        <div v-if="!nativeReady && !nativeError" class="detail-loading-bar">样式加载中...</div>
        <div v-if="nativeError" class="detail-error">{{ nativeError }}</div>
        <div v-html="tweet.blockquoteHtml" />
      </div>

      <div class="detail-footer">
        <a :href="tweet.tweetUrl" target="_blank" class="detail-link">🔗 在 X 上查看原文</a>
        <button class="detail-delete" @click="emit('delete', tweet.id)">🗑 删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px;
}
.detail-card {
  background: #fff; border-radius: 12px; max-width: 580px; width: 100%;
  max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}
.detail-header {
  display: flex; justify-content: space-between; align-items: center; padding: 14px 20px 10px;
}
.detail-collected-at { font-size: 13px; color: #536471; }
.detail-close { background: none; border: none; font-size: 20px; color: #536471; cursor: pointer; padding: 4px 8px; border-radius: 50%; line-height: 1; }
.detail-close:hover { background: #f7f9f9; }
.detail-content { padding: 0 20px; min-height: 120px; }
.detail-loading-bar {
  font-size: 12px; color: #1d9bf0; padding: 6px 0 8px;
  text-align: center; animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
.detail-error { padding: 6px 0 8px; color: #92400e; font-size: 12px; text-align: center; }
.detail-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px 16px; border-top: 1px solid rgb(207,217,222); margin-top: 12px;
}
.detail-link { font-size: 13px; color: #1d9bf0; text-decoration: none; }
.detail-link:hover { text-decoration: underline; }
.detail-delete { background: none; border: none; font-size: 13px; color: #536471; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.detail-delete:hover { background: #fde8e8; color: #f4212e; }
</style>
