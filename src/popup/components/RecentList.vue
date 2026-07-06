<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllTweets, addTweet } from '@/shared/storage/tweetStore'
import { popInbox } from '@/shared/storage/inbox'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import { generateId } from '@/shared/utils/id'
import type { CollectedTweet } from '@/shared/types/tweet'

const recentTweets = ref<CollectedTweet[]>([])

onMounted(async () => {
  await loadRecent()

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return
    if (changes['xpc:inbox']) {
      // Process inbox items and add to tweets
      await processInbox()
    }
    if (changes['xpc:tweets'] || changes['xpc:inbox']) {
      await loadRecent()
    }
  })
})

async function processInbox() {
  const items = await popInbox()
  for (const item of items) {
    const parsed = parseBlockquote(item.blockquoteHtml)
    if (parsed) {
      await addTweet({
        id: generateId(),
        ...parsed,
        tags: [],
        collectedAt: item.collectedAt,
        source: item.source,
      })
    }
  }
}

async function loadRecent() {
  try {
    const tweets = await getAllTweets()
    recentTweets.value = tweets
      .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
      .slice(0, 3)
  } catch {
    recentTweets.value = []
  }
}

function openTweet(id: string) {
  const url = chrome.runtime.getURL('src/display/index.html')
  chrome.tabs.create({ url: url + '#/?tweet=' + id })
}
</script>

<template>
  <div v-if="recentTweets.length > 0" class="recent-list">
    <div class="recent-divider">最近收藏</div>
    <div
      v-for="tweet in recentTweets"
      :key="tweet.id"
      class="recent-item"
      @click="openTweet(tweet.id)"
    >
      <div class="recent-item-header">
        <span class="recent-item-author">{{ tweet.author }}</span>
        <span class="recent-item-handle">@{{ tweet.handle }}</span>
      </div>
      <div class="recent-item-body">{{ tweet.contentText }}</div>
    </div>
  </div>
  <div v-else class="recent-empty">
    <p>还没有收藏推文。粘贴推文嵌入代码开始收藏。</p>
  </div>
</template>

<style scoped>
.recent-list {
  margin-top: 8px;
}

.recent-divider {
  font-size: 12px;
  font-weight: 600;
  color: #536471;
  margin-bottom: 8px;
}

.recent-item {
  padding: 8px 0;
  border-bottom: 1px solid #eff3f4;
  cursor: pointer;
  transition: background 0.1s;
  border-radius: 4px;
  padding: 6px 4px;
  margin: 0 -4px;
}

.recent-item:hover {
  background: #f7f9f9;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}

.recent-item-author {
  font-weight: 600;
  font-size: 13px;
  color: #0f1419;
}

.recent-item-handle {
  font-size: 11px;
  color: #536471;
}

.recent-item-body {
  font-size: 12px;
  line-height: 1.4;
  color: #0f1419;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-empty {
  margin-top: 12px;
  text-align: center;
}

.recent-empty p {
  font-size: 12px;
  color: #7c8b98;
  margin: 0;
}
</style>
