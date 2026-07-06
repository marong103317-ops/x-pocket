// CSV export: UTF-8 BOM, header row, standard CSV escaping
import type { CollectedTweet } from '@/shared/types/tweet'

export function exportCsv(tweets: CollectedTweet[]): Blob {
  const header = [
    'id', 'tweetId', 'tweetUrl', 'author', 'handle',
    'contentText', 'lang', 'postedAt', 'collectedAt',
    'mediaUrls', 'tags', 'notes',
  ]

  const rows = tweets.map((t) => [
    t.id, t.tweetId, t.tweetUrl, t.author, t.handle,
    t.contentText, t.lang, t.postedAt, t.collectedAt,
    Array.isArray(t.mediaUrls) ? t.mediaUrls.join('|') : '',
    Array.isArray(t.tags) ? t.tags.join(';') : '',
    t.notes ?? '',
  ])

  const escape = (v: string): string => `"${v.replace(/"/g, '""')}"`

  const csv = [header, ...rows]
    .map((r) => r.map(escape).join(','))
    .join('\r\n')

  // BOM for Excel UTF-8 recognition
  return new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8',
  })
}
