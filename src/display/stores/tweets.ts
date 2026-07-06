// Pinia store for tweets management in display page
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CollectedTweet, ParsedTweet } from '@/shared/types/tweet'
import type { InboxItem } from '@/shared/types/storage'
import { getAllTweets, addTweet, deleteTweet } from '@/shared/storage/tweetStore'
import { popInbox } from '@/shared/storage/inbox'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import { generateId } from '@/shared/utils/id'

export const useTweetsStore = defineStore('tweets', () => {
  const tweets = ref<Record<string, CollectedTweet>>({})
  const search = ref('')
  const sortKey = ref<'collectedAt' | 'postedAt'>('collectedAt')
  const sortDir = ref<'asc' | 'desc'>('desc')
  const activeTagIds = ref<string[]>([])
  const loading = ref(false)
  const selectedTweetId = ref<string | null>(null)

  // Advanced filters
  const filterAuthor = ref('')
  const filterHandle = ref('')
  const filterPostedAfter = ref('')
  const filterPostedBefore = ref('')
  const filterCollectedAfter = ref('')
  const filterCollectedBefore = ref('')

  // Pagination
  const currentPage = ref(1)
  const pageSize = ref(12)

  const selectedTweet = computed(() =>
    selectedTweetId.value ? tweets.value[selectedTweetId.value] ?? null : null
  )

  const filteredTweets = computed(() => {
    let list = Object.values(tweets.value)

    // Full-text search
    if (search.value) {
      const q = search.value.toLowerCase()
      list = list.filter(t =>
        t.author.toLowerCase().includes(q) ||
        t.contentText.toLowerCase().includes(q) ||
        t.handle.toLowerCase().includes(q)
      )
    }

    // Author filter (exact substring)
    if (filterAuthor.value) {
      const q = filterAuthor.value.toLowerCase()
      list = list.filter(t => t.author.toLowerCase().includes(q))
    }

    // Handle filter
    if (filterHandle.value) {
      const q = filterHandle.value.toLowerCase()
      list = list.filter(t => t.handle.toLowerCase().includes(q))
    }

    // Posted date range
    if (filterPostedAfter.value) {
      list = list.filter(t => t.postedAt >= filterPostedAfter.value)
    }
    if (filterPostedBefore.value) {
      list = list.filter(t => t.postedAt <= filterPostedBefore.value)
    }

    // Collected date range
    if (filterCollectedAfter.value) {
      list = list.filter(t => t.collectedAt >= filterCollectedAfter.value)
    }
    if (filterCollectedBefore.value) {
      list = list.filter(t => t.collectedAt <= filterCollectedBefore.value)
    }

    // Tag filter
    if (activeTagIds.value.length) {
      list = list.filter(t =>
        activeTagIds.value.some(id => t.tags.includes(id))
      )
    }

    // Sort
    list.sort((a, b) => {
      const cmp = a[sortKey.value].localeCompare(b[sortKey.value])
      return sortDir.value === 'desc' ? -cmp : cmp
    })

    return list
  })

  const tweetCount = computed(() => Object.keys(tweets.value).length)
  const filteredCount = computed(() => filteredTweets.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredTweets.value.length / pageSize.value)))

  const paginatedTweets = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredTweets.value.slice(start, start + pageSize.value)
  })

  async function load(): Promise<void> {
    loading.value = true
    try {
      const stored = await getAllTweets()
      const map: Record<string, CollectedTweet> = {}
      for (const t of stored) {
        map[t.id] = t
      }
      tweets.value = map

      // Process inbox
      await processInbox()
    } finally {
      loading.value = false
    }
  }

  async function processInbox(): Promise<void> {
    try {
      const items: InboxItem[] = await popInbox()
      for (const item of items) {
        const parsed = parseBlockquote(item.blockquoteHtml)
        if (parsed) {
          const tweet: CollectedTweet = {
            id: generateId(),
            ...parsed,
            tags: [],
            collectedAt: item.collectedAt,
            source: item.source,
          }
          const result = await addTweet(tweet)
          if (result.success) {
            tweets.value[tweet.id] = tweet
          }
        }
      }
    } catch {
      // Inbox may not exist yet
    }
  }

  async function add(parsed: ParsedTweet, source: CollectedTweet['source'] = 'manual'): Promise<boolean> {
    const tweet: CollectedTweet = {
      id: generateId(),
      ...parsed,
      tags: [],
      collectedAt: new Date().toISOString(),
      source,
    }
    const result = await addTweet(tweet)
    if (result.success) {
      tweets.value[tweet.id] = tweet
      return true
    }
    return false
  }

  async function remove(id: string): Promise<void> {
    await deleteTweet(id)
    delete tweets.value[id]
    if (selectedTweetId.value === id) {
      selectedTweetId.value = null
    }
  }

  function selectTweet(id: string | null): void {
    selectedTweetId.value = id
  }

  const hasFilters = computed(() =>
    !!filterAuthor.value || !!filterHandle.value ||
    !!filterPostedAfter.value || !!filterPostedBefore.value ||
    !!filterCollectedAfter.value || !!filterCollectedBefore.value
  )

  function clearFilters(): void {
    filterAuthor.value = ''
    filterHandle.value = ''
    filterPostedAfter.value = ''
    filterPostedBefore.value = ''
    filterCollectedAfter.value = ''
    filterCollectedBefore.value = ''
    search.value = ''
    currentPage.value = 1
  }

  return {
    tweets,
    search,
    sortKey,
    sortDir,
    activeTagIds,
    loading,
    selectedTweetId,
    selectedTweet,
    filteredTweets,
    paginatedTweets,
    tweetCount,
    filteredCount,
    currentPage,
    pageSize,
    totalPages,
    // Advanced filters
    filterAuthor,
    filterHandle,
    filterPostedAfter,
    filterPostedBefore,
    filterCollectedAfter,
    filterCollectedBefore,
    hasFilters,
    clearFilters,
    // Actions
    load,
    add,
    remove,
    selectTweet,
  }
})
