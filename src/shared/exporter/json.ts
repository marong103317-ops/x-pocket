// JSON export: structured export of all tweets
import type { CollectedTweet } from '@/shared/types/tweet'

interface JsonExport {
  schema: string
  version: number
  exportedAt: string
  count: number
  tweets: CollectedTweet[]
}

export function exportJson(tweets: CollectedTweet[]): Blob {
  const payload: JsonExport = {
    schema: 'x-pocket',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: tweets.length,
    tweets,
  }
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
}
