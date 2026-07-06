// Unit tests for tweetStore
import { describe, it, expect, beforeEach } from 'vitest'
import { addTweet, getAllTweets, deleteTweet, updateTweet } from '@/shared/storage/tweetStore'
import { STORAGE_KEYS } from '@/shared/storage/keys'
import type { CollectedTweet } from '@/shared/types/tweet'

function makeTweet(overrides: Partial<CollectedTweet> = {}): CollectedTweet {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tweetId: overrides.tweetId ?? 'test-tweet-1',
    tweetUrl: overrides.tweetUrl ?? 'https://x.com/user/status/1',
    author: overrides.author ?? '测试作者',
    handle: overrides.handle ?? 'test_user',
    authorUrl: overrides.authorUrl ?? 'https://x.com/test_user',
    contentHtml: overrides.contentHtml ?? '<p>测试内容</p>',
    contentText: overrides.contentText ?? '测试内容',
    lang: overrides.lang ?? 'zh',
    postedAt: overrides.postedAt ?? '2026-07-05T00:00:00.000Z',
    mediaUrls: overrides.mediaUrls ?? [],
    coverUrl: overrides.coverUrl ?? '',
    blockquoteHtml: overrides.blockquoteHtml ?? '<blockquote>test</blockquote>',
    tags: overrides.tags ?? [],
    collectedAt: overrides.collectedAt ?? '2026-07-06T12:00:00.000Z',
    source: overrides.source ?? 'manual',
    notes: overrides.notes,
  }
}

describe('tweetStore', () => {
  beforeEach(() => {
    // Reset chrome.storage.local mock before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(chrome.storage.local as any)._reset()
  })

  describe('getAllTweets', () => {
    it('首次使用应该返回空数组', async () => {
      const tweets = await getAllTweets()
      expect(tweets).toEqual([])
    })
  })

  describe('addTweet', () => {
    it('应该成功新增推文', async () => {
      const tweet = makeTweet({ tweetId: '123' })

      const result = await addTweet(tweet)

      expect(result.success).toBe(true)
      const tweets = await getAllTweets()
      expect(tweets).toHaveLength(1)
      expect(tweets[0].tweetId).toBe('123')
    })

    it('应该按 tweetId 去重', async () => {
      await addTweet(makeTweet({ tweetId: '123' }))

      const result = await addTweet(makeTweet({ tweetId: '123' }))

      expect(result.success).toBe(false)
      expect(result.duplicate).toBe(true)
      const tweets = await getAllTweets()
      expect(tweets).toHaveLength(1)
    })
  })

  describe('deleteTweet', () => {
    it('应该删除指定推文', async () => {
      const tweet = makeTweet({ id: 'id-1' })
      await addTweet(tweet)

      await deleteTweet('id-1')

      const tweets = await getAllTweets()
      expect(tweets).toHaveLength(0)
    })

    it('删除不存在的推文不应该报错', async () => {
      await expect(deleteTweet('nonexistent')).resolves.not.toThrow()
    })
  })

  describe('updateTweet', () => {
    it('应该部分更新推文字段', async () => {
      const tweet = makeTweet({ id: 'id-1', tags: [] })
      await addTweet(tweet)

      await updateTweet('id-1', { tags: ['tag-1'] })

      const tweets = await getAllTweets()
      expect(tweets[0].tags).toEqual(['tag-1'])
      // Other fields unchanged
      expect(tweets[0].author).toBe('测试作者')
    })

    it('更新不存在的推文不应该报错', async () => {
      await expect(
        updateTweet('nonexistent', { notes: 'test' })
      ).resolves.not.toThrow()
    })
  })
})
