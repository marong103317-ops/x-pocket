// Obsidian export: Markdown with YAML frontmatter per tweet
import type { CollectedTweet } from '@/shared/types/tweet'

export function exportObsidian(tweets: CollectedTweet[]): Blob {
  const entries = tweets.map((t) => {
    const tagsYaml = Array.isArray(t.tags) && t.tags.length
      ? `\n  - ${t.tags.join('\n  - ')}`
      : ''

    return [
      '---',
      `author: "${t.author}"`,
      `handle: "@${t.handle}"`,
      `tweet_url: ${t.tweetUrl}`,
      `posted_at: ${t.postedAt.slice(0, 10)}`,
      `collected_at: ${t.collectedAt.slice(0, 10)}`,
      `source: ${t.source}`,
      `tags:${tagsYaml}`,
      t.notes ? `notes: "${t.notes}"` : '',
      '---',
      '',
      `> ${t.contentText.replace(/\n/g, '\n> ')}`,
      '',
      `[原文链接](${t.tweetUrl})`,
      t.coverUrl ? `\n![封面](${t.coverUrl})` : '',
    ].filter(line => line !== '').join('\n')
  })

  const md = [
    '# X-Pocket → Obsidian',
    '',
    `导出 ${tweets.length} 条推文 · ${new Date().toISOString().slice(0, 10)}`,
    '',
    entries.join('\n\n---\n\n'),
  ].join('\n')

  return new Blob([md], { type: 'text/markdown;charset=utf-8' })
}
