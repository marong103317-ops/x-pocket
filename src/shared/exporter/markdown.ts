// Markdown export: each tweet as a ## section
import type { CollectedTweet } from '@/shared/types/tweet'

export function exportMarkdown(tweets: CollectedTweet[]): Blob {
  const lines = tweets.map((t, i) => {
    const tags = Array.isArray(t.tags) && t.tags.length ? `\n\n标签: ${t.tags.join(', ')}` : ''
    return [
      `## ${i + 1}. @${t.handle} — ${t.author}`,
      '',
      `> ${t.contentText.replace(/\n/g, '\n> ')}`,
      '',
      `[原文链接](${t.tweetUrl}) | 发布于 ${t.postedAt.slice(0, 10)} | 收藏于 ${t.collectedAt.slice(0, 10)}${tags}`,
      '',
      '---',
    ].join('\n')
  })

  const md = [
    '# Pocket for X 收藏导出',
    '',
    `共 ${tweets.length} 条，导出于 ${new Date().toISOString()}`,
    '',
    ...lines,
  ].join('\n')

  return new Blob([md], { type: 'text/markdown;charset=utf-8' })
}
