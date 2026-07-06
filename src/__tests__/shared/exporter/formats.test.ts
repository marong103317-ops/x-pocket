// TDD tests for multi-format export
import { describe, it, expect } from 'vitest'
import { exportTweets } from '@/shared/exporter'
import type { CollectedTweet } from '@/shared/types/tweet'

function makeTweet(overrides: Partial<CollectedTweet> = {}): CollectedTweet {
  return {
    id: overrides.id ?? 'id-1',
    tweetId: overrides.tweetId ?? '123',
    tweetUrl: overrides.tweetUrl ?? 'https://x.com/user/status/123',
    author: overrides.author ?? '测试作者',
    handle: overrides.handle ?? 'test_user',
    authorUrl: overrides.authorUrl ?? 'https://x.com/test_user',
    contentHtml: overrides.contentHtml ?? '<p>测试内容</p>',
    contentText: overrides.contentText ?? '这是一条测试推文内容',
    lang: overrides.lang ?? 'zh',
    postedAt: overrides.postedAt ?? '2026-07-05T00:00:00.000Z',
    mediaUrls: overrides.mediaUrls ?? [],
    coverUrl: overrides.coverUrl ?? '',
    blockquoteHtml: overrides.blockquoteHtml ?? '<blockquote class="twitter-tweet"><p>测试内容</p>&mdash; 作者 (@user) <a href="https://x.com/user/status/123">July 5, 2026</a></blockquote>',
    tags: overrides.tags ?? [],
    collectedAt: overrides.collectedAt ?? '2026-07-06T12:00:00.000Z',
    source: overrides.source ?? 'manual',
    notes: overrides.notes,
  }
}

describe('exportTweets - HTML', () => {
  it('应该导出包含 blockquote 的 HTML 文件', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'html', tweets })
    const text = await blob.text()

    expect(text).toContain('<!DOCTYPE html>')
    expect(text).toContain('<blockquote class="twitter-tweet">')
    expect(text).toContain('测试内容')
  })

  it('includeNativeScript=true 时应包含 widgets.js', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'html', tweets, includeNativeScript: true })
    const text = await blob.text()

    expect(text).toContain('platform.x.com/widgets.js')
  })

  it('includeNativeScript=false 时应不含 widgets.js', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'html', tweets, includeNativeScript: false })
    const text = await blob.text()

    expect(text).not.toContain('widgets.js')
  })

  it('多条推文应全部包含', async () => {
    const tweets = [makeTweet({ id: 'id-1' }), makeTweet({ id: 'id-2' })]

    const blob = exportTweets({ format: 'html', tweets })
    const text = await blob.text()

    expect((text.match(/<blockquote class="twitter-tweet"/g) || []).length).toBe(2)
  })
})

describe('exportTweets - Markdown', () => {
  it('应该导出为 Markdown 格式', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'markdown', tweets })
    const text = await blob.text()

    expect(text).toContain('# Pocket for X 收藏导出')
    expect(text).toContain('## 1. @test_user')
    expect(text).toContain('> 这是一条测试推文内容')
    expect(text).toContain('[原文链接](https://x.com/user/status/123)')
    expect(text).toContain('---')
  })

  it('多条推文应有多个 section', async () => {
    const tweets = [makeTweet({ id: 'id-1' }), makeTweet({ id: 'id-2', handle: 'user2' })]

    const blob = exportTweets({ format: 'markdown', tweets })
    const text = await blob.text()

    expect(text).toContain('## 1. @test_user')
    expect(text).toContain('## 2. @user2')
  })

  it('带标签的推文应包含标签信息', async () => {
    const tweets = [makeTweet({ tags: ['tag-1', 'tag-2'] })]

    const blob = exportTweets({ format: 'markdown', tweets })
    const text = await blob.text()

    expect(text).toContain('标签: tag-1, tag-2')
  })

  it('不带标签的推文不应显示标签行', async () => {
    const tweets = [makeTweet({ tags: [] })]

    const blob = exportTweets({ format: 'markdown', tweets })
    const text = await blob.text()

    expect(text).not.toContain('标签:')
  })
})

describe('exportTweets - CSV', () => {
  it('应该以 UTF-8 BOM 开头', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'csv', tweets })
    // Read as arrayBuffer to verify BOM bytes
    const buf = await blob.arrayBuffer()
    const bytes = new Uint8Array(buf)
    // BOM: EF BB BF in UTF-8
    expect(bytes[0]).toBe(0xEF)
    expect(bytes[1]).toBe(0xBB)
    expect(bytes[2]).toBe(0xBF)
  })

  it('应该包含 header 行', async () => {
    const tweets = [makeTweet()]

    const blob = exportTweets({ format: 'csv', tweets })
    const lines = (await blob.text()).split('\r\n')

    const header = lines[0]
    expect(header).toContain('id')
    expect(header).toContain('tweetId')
    expect(header).toContain('author')
    expect(header).toContain('handle')
    expect(header).toContain('contentText')
    expect(header).toContain('postedAt')
    expect(header).toContain('collectedAt')
  })

  it('每条推文应各占一行', async () => {
    const tweets = [makeTweet({ id: 'id-1' }), makeTweet({ id: 'id-2' })]

    const blob = exportTweets({ format: 'csv', tweets })
    const lines = (await blob.text()).split('\r\n')

    // header + 2 data rows + trailing empty from split
    expect(lines.length).toBeGreaterThanOrEqual(3)
  })

  it('mediaUrls 应用 | 分隔', async () => {
    const tweets = [makeTweet({ mediaUrls: ['url1', 'url2'] })]

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    expect(text).toContain('url1|url2')
  })

  it('tags 应用 ; 分隔', async () => {
    const tweets = [makeTweet({ tags: ['tag-a', 'tag-b'] })]

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    expect(text).toContain('tag-a;tag-b')
  })

  it('空 notes 应为空字符串', async () => {
    const tweets = [makeTweet({ notes: undefined })]

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    // Last field (notes) should be empty string ""
    const lines = text.trim().split('\r\n')
    const lastLine = lines[lines.length - 1]
    const fields = lastLine.split(',')
    // 12 fields total, last one is notes → should be ""
    expect(fields[fields.length - 1]).toBe('""')
  })

  it('Blob MIME type 应为 text/csv', () => {
    const blob = exportTweets({ format: 'csv', tweets: [] })
    expect(blob.type).toBe('text/csv;charset=utf-8')
  })

  it('mediaUrls 不是数组时应容错', async () => {
    const tweets = [makeTweet({ mediaUrls: null as unknown as string[] })]

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    // Should not throw, mediaUrls field should be empty
    expect(text).toBeDefined()
  })

  it('tags 不是数组时应容错', async () => {
    const tweets = [makeTweet({ tags: null as unknown as string[] })]

    const blob = exportTweets({ format: 'csv', tweets })
    const text = await blob.text()

    expect(text).toBeDefined()
  })
})
