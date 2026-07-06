// TDD tests for Obsidian export
import { describe, it, expect } from 'vitest'
import { exportObsidian } from '@/shared/exporter/obsidian'
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
    contentText: overrides.contentText ?? '这是一条测试推文',
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

describe('exportObsidian', () => {
  it('应该包含 YAML frontmatter', async () => {
    const tweets = [makeTweet()]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    expect(text).toContain('---')
    expect(text).toContain('author:')
    expect(text).toContain('handle:')
    expect(text).toContain('tweet_url:')
    expect(text).toContain('posted_at:')
    expect(text).toContain('collected_at:')
    expect(text).toContain('---')
  })

  it('应该包含推文内容为引用块', async () => {
    const tweets = [makeTweet()]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    expect(text).toContain('> 这是一条测试推文')
  })

  it('每条推文应有独立 frontmatter', async () => {
    const tweets = [makeTweet({ id: 'a' }), makeTweet({ id: 'b' })]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    const frontmatterCount = (text.match(/^---$/gm) || []).length
    // Each tweet: opening + closing frontmatter, plus separator between = 5 for 2 tweets
    expect(frontmatterCount).toBe(5)
  })

  it('带标签的推文应包含标签', async () => {
    const tweets = [makeTweet({ tags: ['科技', 'AI'] })]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    expect(text).toContain('tags:')
    expect(text).toContain('科技')
    expect(text).toContain('AI')
  })

  it('应包含原文链接', async () => {
    const tweets = [makeTweet()]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    expect(text).toContain('[原文链接](https://x.com/user/status/123)')
  })

  it('应包含分隔线', async () => {
    const tweets = [makeTweet({ id: 'a' }), makeTweet({ id: 'b' })]
    const blob = exportObsidian(tweets)
    const text = await blob.text()

    expect(text).toContain('---')
  })

  it('MIME type 应为 text/markdown', () => {
    const blob = exportObsidian([])
    expect(blob.type).toBe('text/markdown;charset=utf-8')
  })

  it('空数组应导出标题和说明', async () => {
    const blob = exportObsidian([])
    const text = await blob.text()

    expect(text).toContain('# X-Pocket')
    expect(text).toContain('0 条')
  })
})
