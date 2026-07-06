// Data import: reads JSON file and merges tweets with dedup
import type { CollectedTweet } from '@/shared/types/tweet'
import { getAllTweets, addTweet } from '@/shared/storage/tweetStore'

export interface ImportResult {
  imported: number
  skipped: number
  error?: string
}

export async function importFromJson(file: File): Promise<ImportResult> {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)

    // Validate schema
    if (parsed.schema !== 'x-pocket') {
      return { imported: 0, skipped: 0, error: '文件格式不正确，请选择 X-Pocket 导出的 JSON 文件' }
    }

    const tweets: CollectedTweet[] = parsed.tweets ?? []
    if (!Array.isArray(tweets)) {
      return { imported: 0, skipped: 0, error: '文件格式不正确' }
    }

    // Get existing tweets for dedup
    const existing = await getAllTweets()
    const existingIds = new Set(existing.map(t => t.tweetId))

    let imported = 0
    let skipped = 0

    for (const tweet of tweets) {
      if (existingIds.has(tweet.tweetId)) {
        skipped++
        continue
      }

      // Generate new IDs to avoid collision
      const result = await addTweet({
        ...tweet,
        id: crypto.randomUUID(),
        tags: tweet.tags ?? [],
        collectedAt: tweet.collectedAt ?? new Date().toISOString(),
      })

      if (result.success) {
        imported++
        existingIds.add(tweet.tweetId)
      } else {
        skipped++
      }
    }

    return { imported, skipped }
  } catch {
    return { imported: 0, skipped: 0, error: '文件格式不正确，请选择 X-Pocket 导出的 JSON 文件' }
  }
}
