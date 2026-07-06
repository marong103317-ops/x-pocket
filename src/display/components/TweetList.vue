<script setup lang="ts">
import type { CollectedTweet } from '@/shared/types/tweet'
import TweetListCard from './TweetListCard.vue'

defineProps<{
  tweets: CollectedTweet[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <div v-if="loading" class="list-loading">加载中...</div>

  <div v-else-if="tweets.length === 0" class="list-empty">
    <div class="list-empty-icon">📋</div>
    <p>还没有收藏推文</p>
  </div>

  <div v-else class="tweet-list">
    <TweetListCard
      v-for="tweet in tweets"
      :key="tweet.id"
      :tweet="tweet"
      @click="emit('select', tweet.id)"
      @delete="emit('delete', tweet.id)"
    />
  </div>
</template>

<style scoped>
.list-loading {
  text-align: center;
  padding: 40px 0;
  color: #536471;
  font-size: 14px;
}

.list-empty {
  text-align: center;
  padding: 60px 0;
}

.list-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.list-empty p {
  margin: 0;
  font-size: 16px;
  color: #0f1419;
}

.tweet-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 680px;
  margin: 0 auto;
}
</style>
