import { generateId } from '@/shared/utils/id'
import type { CollectedTweet } from '@/shared/types/tweet'
import type { SeedAuthor, SeedContent } from '@/shared/data/seedData'

export interface SeedDataOptions {
  count?: number
  maxDaysAgo?: number
}

export class SeedDataService {
  /**
   * 生成指定数量的测试推文数据
   */
  static generateTestTweets(
    authors: SeedAuthor[],
    contents: SeedContent[],
    options: SeedDataOptions = {}
  ): CollectedTweet[] {
    const { count = 50, maxDaysAgo = 30 } = options
    const tweets: CollectedTweet[] = []

    for (let i = 0; i < count; i++) {
      const author = authors[i % authors.length]
      const content = contents[i % contents.length]
      tweets.push(this.generateSingleTweet(author, content, i, maxDaysAgo))
    }

    return tweets
  }

  private static generateSingleTweet(
    author: SeedAuthor,
    content: SeedContent,
    index: number,
    maxDaysAgo: number
  ): CollectedTweet {
    const daysAgoPosted = Math.floor(Math.random() * maxDaysAgo)
    const daysAgoCollected = Math.floor(Math.random() * daysAgoPosted) + 1
    const postedAt = new Date(Date.now() - daysAgoPosted * 86400000)
    const collectedAt = new Date(Date.now() - daysAgoCollected * 86400000)

    return {
      id: generateId(),
      tweetId: `seed-${index}`,
      tweetUrl: `https://x.com/${author.handle}/status/seed${index}`,
      author: author.name,
      handle: author.handle,
      authorUrl: `https://x.com/${author.handle}`,
      contentHtml: `<p>${content.text}</p>`,
      contentText: content.text,
      lang: content.lang || 'zh',
      postedAt: postedAt.toISOString(),
      mediaUrls: [],
      coverUrl: '',
      blockquoteHtml: this.generateBlockquote(author, content, index, postedAt),
      tags: [],
      collectedAt: collectedAt.toISOString(),
      source: 'manual',
    }
  }

  private static generateBlockquote(
    author: SeedAuthor,
    content: SeedContent,
    index: number,
    postedAt: Date
  ): string {
    const formattedDate = postedAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return `<blockquote class="twitter-tweet"><p>${content.text}</p>&mdash; ${author.name} (@${author.handle}) <a href="https://x.com/${author.handle}/status/seed${index}">${formattedDate}</a></blockquote>`
  }
}
