<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CollectedTweet } from '@/shared/types/tweet'
import { formatDate } from '@/shared/utils/date'

const props = defineProps<{
  tweet: CollectedTweet
}>()

const displayDate = computed(() => formatDate(props.tweet.postedAt))
const isShortTweet = computed(() => props.tweet.contentText.length < 140)

const imgError = ref(false)
const avatarError = ref(false)

// Local letter avatar (no external requests)
const avatarLetter = computed(() => props.tweet.author.charAt(0) || props.tweet.handle.charAt(1) || '?')
</script>

<template>
  <div class="tweet-embed">
    <!-- Author row -->
    <div class="tweet-author">
      <div class="tweet-avatar">
        <span class="tweet-avatar-fallback">{{ avatarLetter }}</span>
      </div>
      <div class="tweet-author-text">
        <div class="tweet-name">{{ tweet.author }}</div>
        <div class="tweet-meta">@{{ tweet.handle }} · {{ displayDate }}</div>
      </div>
    </div>

    <div
      class="tweet-body"
      :class="{ 'tweet-body--large': isShortTweet }"
      v-html="tweet.contentHtml"
    />

    <div v-if="tweet.coverUrl && !imgError" class="tweet-media-wrap">
      <img
        :src="tweet.coverUrl"
        class="tweet-media-img"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="imgError = true"
      />
    </div>

    <a :href="tweet.tweetUrl" target="_blank" rel="noopener noreferrer" class="tweet-link">
      在 X 上查看原文
    </a>
  </div>
</template>

<style scoped>
/* Card: matches official Twitter embed border and radius */
.tweet-embed {
  border: 1px solid rgb(207, 217, 222);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Author row */
.tweet-author {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.tweet-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1d9bf0;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.tweet-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tweet-avatar-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
}

.tweet-author-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 48px;
}

.tweet-name {
  font-weight: 700;
  font-size: 15px;
  line-height: 20px;
  color: #0f1419;
}

.tweet-meta {
  font-size: 15px;
  line-height: 20px;
  color: #536471;
}

/* Body: Twitter uses 23px for short tweets, 15px for long ones */
.tweet-body {
  font-size: 15px;
  line-height: 20px;
  color: #0f1419;
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 12px;
}

.tweet-body--large {
  font-size: 23px;
  line-height: 28px;
}

.tweet-body :deep(a) {
  color: #1d9bf0;
  text-decoration: none;
}

.tweet-body :deep(a:hover) {
  text-decoration: underline;
}

/* Media: full-width, rounded like official embed */
.tweet-media-wrap {
  margin-bottom: 12px;
  border: 1px solid rgb(207, 217, 222);
  border-radius: 16px;
  overflow: hidden;
}

.tweet-media-img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 510px;
}

/* Link */
.tweet-link {
  display: block;
  font-size: 13px;
  color: #1d9bf0;
  text-decoration: none;
  padding-top: 0;
}

.tweet-link:hover {
  text-decoration: underline;
}
</style>
