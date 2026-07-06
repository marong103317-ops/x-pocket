<script setup lang="ts">
import type { CollectedTweet } from '@/shared/types/tweet'
import TweetGridCard from './TweetGridCard.vue'

defineProps<{
  tweets: CollectedTweet[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div v-if="loading" class="grid-loading">
    加载中...
  </div>

  <div v-else-if="tweets.length === 0" class="grid-empty">
    <div class="grid-empty-icon">📋</div>
    <p>还没有收藏推文</p>
    <p class="grid-empty-hint">
      在 X.com 上右键推文收藏，或点击扩展图标粘贴嵌入代码
    </p>
  </div>

  <div v-else class="tweet-grid">
    <TweetGridCard
      v-for="tweet in tweets"
      :key="tweet.id"
      :tweet="tweet"
      @click="emit('select', tweet.id)"
    />
  </div>
</template>

<style scoped>
.grid-loading {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.grid-empty {
  text-align: center;
  padding: 60px 0;
}

.grid-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.grid-empty p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--color-text);
}

.grid-empty-hint {
  font-size: 13px !important;
  color: var(--color-text-secondary) !important;
  max-width: 280px;
  margin: 0 auto !important;
  line-height: 1.5;
}

.tweet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
</style>
