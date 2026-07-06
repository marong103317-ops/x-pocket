// Unit tests for JSON exporter
import { describe, it, expect } from 'vitest'
import { exportJson } from '@/shared/exporter/json'
import type { CollectedTweet } from '@/shared/types/tweet'

function makeTweet(overrides: Partial<CollectedTweet> = {}): CollectedTweet {
  return {
    id: overrides.id ?? 'id-1',
    tweetId: overrides.tweetId ?? '123',
    tweetUrl: overrides.tweetUrl ?? 'https://x.com/user/status/123',
    author: overrides.author ?? 'Author',
    handle: overrides.handle ?? 'user',
    authorUrl: overrides.authorUrl ?? 'https://x.com/user',
    contentHtml: overrides.contentHtml ?? '<p>content</p>',
    contentText: overrides.contentText ?? 'content',
    lang: overrides.lang ?? 'en',
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

describe('exportJson', () => {
  it('应该导出多条推文为完整 JSON 结构', async () => {
    const tweets = [makeTweet({ id: 'id-1' }), makeTweet({ id: 'id-2' })]

    const blob = exportJson(tweets)
    const text = await blob.text()
    const parsed = JSON.parse(text)

    expect(parsed.schema).toBe('x-pocket')
    expect(parsed.version).toBe(1)
    expect(parsed.count).toBe(2)
    expect(parsed.tweets).toHaveLength(2)
    expect(parsed.exportedAt).toBeDefined()
    // Verify date is valid ISO
    expect(() => new Date(parsed.exportedAt)).not.toThrow()
  })

  it('应该导出空数组而不报错', async () => {
    const blob = exportJson([])
    const parsed = JSON.parse(await blob.text())

    expect(parsed.count).toBe(0)
    expect(parsed.tweets).toHaveLength(0)
  })

  it('Blob MIME type 应该为 application/json', () => {
    const blob = exportJson([])
    expect(blob.type).toBe('application/json')
  })
})
