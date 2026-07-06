// Tests for unlike removal via UNCOLLECT_TWEET message
import { describe, it, expect, beforeEach } from 'vitest'
import { normalizeTweetUrl } from '@/shared/parser/urlParser'
import { STORAGE_KEYS } from '@/shared/storage/keys'

// Simulate the UNCOLLECT_TWEET handler logic (testable without chrome APIs)
async function handleUnlike(
  tweetUrl: string,
  storage: Map<string, unknown>
): Promise<boolean> {
  const normalizedUrl = normalizeTweetUrl(tweetUrl)
  const tweets = (storage.get(STORAGE_KEYS.TWEETS) as Record<string, { id: string; tweetUrl: string }>) ?? {}
  const match = Object.values(tweets).find(t => t.tweetUrl === normalizedUrl)
  if (match) {
    delete tweets[match.id]
    storage.set(STORAGE_KEYS.TWEETS, tweets)
    return true
  }
  return false
}

function makeStorageWithTweets(tweets: Array<{ id: string; tweetUrl: string }>): Map<string, unknown> {
  const map = new Map<string, unknown>()
  const record: Record<string, { id: string; tweetUrl: string }> = {}
  for (const t of tweets) record[t.id] = t
  map.set(STORAGE_KEYS.TWEETS, record)
  return map
}

describe('UNCOLLECT_TWEET handler', () => {
  it('应该移除匹配 url 的推文', async () => {
    const storage = makeStorageWithTweets([
      { id: 'id-1', tweetUrl: 'https://x.com/user/status/123' },
    ])

    const removed = await handleUnlike('https://x.com/user/status/123', storage)

    expect(removed).toBe(true)
    const tweets = storage.get(STORAGE_KEYS.TWEETS) as Record<string, unknown>
    expect(Object.keys(tweets)).toHaveLength(0)
  })

  it('应该处理 twitter.com → x.com 的 url 归一化', async () => {
    const storage = makeStorageWithTweets([
      { id: 'id-1', tweetUrl: 'https://x.com/user/status/123' },
    ])

    const removed = await handleUnlike('https://twitter.com/user/status/123', storage)

    expect(removed).toBe(true)
  })

  it('应该去掉 query 参数后匹配', async () => {
    const storage = makeStorageWithTweets([
      { id: 'id-1', tweetUrl: 'https://x.com/user/status/123' },
    ])

    const removed = await handleUnlike('https://x.com/user/status/123?ref_src=twsrc', storage)

    expect(removed).toBe(true)
  })

  it('不存在的推文应该返回 false', async () => {
    const storage = makeStorageWithTweets([
      { id: 'id-1', tweetUrl: 'https://x.com/user/status/123' },
    ])

    const removed = await handleUnlike('https://x.com/other/status/999', storage)

    expect(removed).toBe(false)
    const tweets = storage.get(STORAGE_KEYS.TWEETS) as Record<string, unknown>
    expect(Object.keys(tweets)).toHaveLength(1)
  })

  it('空存储时应该返回 false', async () => {
    const storage = new Map<string, unknown>()

    const removed = await handleUnlike('https://x.com/user/status/123', storage)

    expect(removed).toBe(false)
  })
})
