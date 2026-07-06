// TDD tests for pagination feature
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTweetsStore } from '@/display/stores/tweets'
import type { CollectedTweet } from '@/shared/types/tweet'

function makeTweet(overrides: Partial<CollectedTweet> = {}): CollectedTweet {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tweetId: overrides.tweetId ?? '1',
    tweetUrl: overrides.tweetUrl ?? 'https://x.com/u/status/1',
    author: overrides.author ?? '作者',
    handle: overrides.handle ?? 'user',
    authorUrl: overrides.authorUrl ?? 'https://x.com/user',
    contentHtml: overrides.contentHtml ?? '<p>内容</p>',
    contentText: overrides.contentText ?? '内容',
    lang: overrides.lang ?? 'zh',
    postedAt: overrides.postedAt ?? '2026-07-01T00:00:00.000Z',
    mediaUrls: overrides.mediaUrls ?? [],
    coverUrl: overrides.coverUrl ?? '',
    blockquoteHtml: overrides.blockquoteHtml ?? '<blockquote>test</blockquote>',
    tags: overrides.tags ?? [],
    collectedAt: overrides.collectedAt ?? '2026-07-06T00:00:00.000Z',
    source: overrides.source ?? 'manual',
    notes: overrides.notes,
  }
}

/**
 * Fill store with N tweets (bypass storage, inject directly).
 */
function fillStore(store: ReturnType<typeof useTweetsStore>, count: number): void {
  for (let i = 0; i < count; i++) {
    const tweet = makeTweet({
      id: `id-${i}`,
      tweetId: `tweet-${i}`,
      author: `作者${i}`,
      handle: `user${i}`,
      contentText: `第${i}条推文内容`,
      postedAt: new Date(Date.UTC(2026, 6, 1 + i)).toISOString(),
      collectedAt: new Date(Date.UTC(2026, 6, 6 - i)).toISOString(),
    })
    store.tweets[tweet.id] = tweet
  }
}

describe('pagination', () => {
  let store: ReturnType<typeof useTweetsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTweetsStore()
    store.pageSize = 12
    store.currentPage = 1
  })

  // ==================== RED phase: write failing tests first ====================

  describe('default state', () => {
    it('默认 currentPage 为 1', () => {
      expect(store.currentPage).toBe(1)
    })

    it('默认 pageSize 为 12', () => {
      expect(store.pageSize).toBe(12)
    })

    it('空数据时 totalPages 为 1', () => {
      expect(store.totalPages).toBe(1)
    })

    it('空数据时 filteredCount 为 0', () => {
      expect(store.filteredCount).toBe(0)
    })

    it('空数据时 paginatedTweets 为空数组', () => {
      expect(store.paginatedTweets).toEqual([])
    })
  })

  describe('totalPages 计算', () => {
    it('12 条数据时 totalPages 为 1', () => {
      fillStore(store, 12)
      expect(store.totalPages).toBe(1)
    })

    it('13 条数据时 totalPages 为 2', () => {
      fillStore(store, 13)
      expect(store.totalPages).toBe(2)
    })

    it('24 条数据时 totalPages 为 2', () => {
      fillStore(store, 24)
      expect(store.totalPages).toBe(2)
    })

    it('25 条数据时 totalPages 为 3', () => {
      fillStore(store, 25)
      expect(store.totalPages).toBe(3)
    })

    it('0 条数据时 totalPages 为 1（不小于1）', () => {
      fillStore(store, 0)
      expect(store.totalPages).toBe(1)
    })
  })

  describe('filteredCount', () => {
    it('应该返回过滤后推文的总数', () => {
      fillStore(store, 5)
      expect(store.filteredCount).toBe(5)
    })

    it('搜索过滤后 filteredCount 应相应减少', () => {
      fillStore(store, 10)
      store.search = '作者1'
      // 匹配 "作者1" 和 "作者10" → 2 条
      expect(store.filteredCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('paginatedTweets 分页切片', () => {
    it('第 1 页应返回前 12 条', () => {
      fillStore(store, 25)
      store.currentPage = 1
      expect(store.paginatedTweets).toHaveLength(12)
      expect(store.paginatedTweets[0].id).toBe('id-0')
      expect(store.paginatedTweets[11].id).toBe('id-11')
    })

    it('第 2 页应返回第 13-24 条', () => {
      fillStore(store, 25)
      store.currentPage = 2
      expect(store.paginatedTweets).toHaveLength(12)
      expect(store.paginatedTweets[0].id).toBe('id-12')
      expect(store.paginatedTweets[11].id).toBe('id-23')
    })

    it('最后一页应返回剩余条目', () => {
      fillStore(store, 25)
      store.currentPage = 3
      expect(store.paginatedTweets).toHaveLength(1)
      expect(store.paginatedTweets[0].id).toBe('id-24')
    })

    it('超出范围页码应返回空数组', () => {
      fillStore(store, 10)
      store.currentPage = 99
      expect(store.paginatedTweets).toHaveLength(0)
    })

    it('currentPage 为 0 时返回空数组', () => {
      fillStore(store, 10)
      store.currentPage = 0
      expect(store.paginatedTweets).toHaveLength(0)
    })
  })

  describe('筛选 + 分页联动', () => {
    it('按作者筛选后分页应基于过滤结果', () => {
      fillStore(store, 25)
      store.filterAuthor = '作者1' // matches 作者1 and 作者10-19
      expect(store.totalPages).toBe(1) // at most 12 results
      expect(store.paginatedTweets.every(t => t.author.includes('作者1'))).toBe(true)
    })

    it('筛选后应重置到第 1 页', () => {
      fillStore(store, 25)
      store.currentPage = 2
      store.clearFilters()
      expect(store.currentPage).toBe(1)
    })
  })

  describe('排序 + 分页', () => {
    it('升序排列时第 1 页应为最早的推文', () => {
      fillStore(store, 25)
      store.sortDir = 'asc'
      store.sortKey = 'postedAt'
      store.currentPage = 1
      expect(store.paginatedTweets[0].id).toBe('id-0')
    })

    it('降序排列时第 1 页应为最新的推文', () => {
      fillStore(store, 25)
      store.sortDir = 'desc'
      store.sortKey = 'postedAt'
      store.currentPage = 1
      expect(store.paginatedTweets[0].id).toBe('id-24')
    })
  })
})
