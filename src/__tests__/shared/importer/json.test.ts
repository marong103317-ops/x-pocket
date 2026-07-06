// TDD tests for JSON import functionality
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { importFromJson } from '@/shared/importer/json'
import { getAllTweets, addTweet } from '@/shared/storage/tweetStore'
import type { CollectedTweet } from '@/shared/types/tweet'

function makeExportJson(tweets: Partial<CollectedTweet>[]): string {
  return JSON.stringify({
    schema: 'x-pocket',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: tweets.length,
    tweets: tweets.map((t, i) => ({
      id: t.id ?? `id-${i}`,
      tweetId: t.tweetId ?? `tweet-${i}`,
      tweetUrl: t.tweetUrl ?? `https://x.com/user/status/${i}`,
      author: t.author ?? `作者${i}`,
      handle: t.handle ?? `user${i}`,
      authorUrl: t.authorUrl ?? `https://x.com/user${i}`,
      contentHtml: t.contentHtml ?? '<p>内容</p>',
      contentText: t.contentText ?? '测试内容',
      lang: t.lang ?? 'zh',
      postedAt: t.postedAt ?? '2026-07-01T00:00:00.000Z',
      mediaUrls: t.mediaUrls ?? [],
      coverUrl: t.coverUrl ?? '',
      blockquoteHtml: t.blockquoteHtml ?? '<blockquote>test</blockquote>',
      tags: t.tags ?? [],
      collectedAt: t.collectedAt ?? '2026-07-06T00:00:00.000Z',
      source: t.source ?? 'manual',
      notes: t.notes ?? undefined,
    })),
  }, null, 2)
}

describe('importFromJson', () => {
  beforeEach(() => {
    (chrome.storage.local as any)._reset()
  })

  it('应该成功导入单条推文', async () => {
    const file = new File([makeExportJson([{ tweetId: 'new-1' }])], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(0)
    expect(result.error).toBeUndefined()

    const tweets = await getAllTweets()
    expect(tweets).toHaveLength(1)
    expect(tweets[0].tweetId).toBe('new-1')
  })

  it('应该成功导入多条推文', async () => {
    const file = new File([makeExportJson([
      { tweetId: 'new-1' },
      { tweetId: 'new-2' },
      { tweetId: 'new-3' },
    ])], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(3)
    expect(result.skipped).toBe(0)
  })

  it('重复推文应该跳过', async () => {
    // Pre-add a tweet
    await addTweet({
      id: 'existing-id',
      tweetId: 'existing',
      tweetUrl: 'https://x.com/u/status/existing',
      author: 'Old', handle: 'old', authorUrl: 'https://x.com/old',
      contentHtml: '<p>old</p>', contentText: 'old', lang: 'zh',
      postedAt: '2026-01-01T00:00:00.000Z', mediaUrls: [], coverUrl: '',
      blockquoteHtml: '<blockquote>old</blockquote>', tags: [],
      collectedAt: '2026-01-01T00:00:00.000Z', source: 'manual',
    })

    const file = new File([makeExportJson([
      { tweetId: 'existing' },  // duplicate
      { tweetId: 'new-1' },     // new
    ])], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(1)

    const tweets = await getAllTweets()
    expect(tweets).toHaveLength(2) // original + new
  })

  it('schema 不匹配应返回错误', async () => {
    const badJson = JSON.stringify({ schema: 'other-app', tweets: [] })
    const file = new File([badJson], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(0)
    expect(result.error).toBeDefined()
    expect(result.error).toContain('格式不正确')
  })

  it('无效 JSON 应返回错误', async () => {
    const file = new File(['not json'], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(0)
    expect(result.error).toBeDefined()
  })

  it('空 tweets 数组应导入 0 条', async () => {
    const file = new File([makeExportJson([])], 'test.json', { type: 'application/json' })
    const result = await importFromJson(file)

    expect(result.imported).toBe(0)
    expect(result.skipped).toBe(0)
  })
})
