// Type definitions for CollectedTweet and related types

/** Represents a collected (saved) tweet in the system */
export interface CollectedTweet {
  id: string
  tweetId: string
  tweetUrl: string
  author: string
  handle: string
  authorUrl: string
  contentHtml: string
  contentText: string
  lang: string
  postedAt: string
  mediaUrls: string[]
  coverUrl: string
  blockquoteHtml: string
  tags: string[]
  collectedAt: string
  source: 'manual' | 'context-menu' | 'oembed' | 'dom'
  notes?: string
}

/** Result of parsing a blockquote HTML */
export interface ParsedTweet {
  tweetId: string
  tweetUrl: string
  author: string
  handle: string
  authorUrl: string
  contentHtml: string
  contentText: string
  lang: string
  postedAt: string
  mediaUrls: string[]
  coverUrl: string
  blockquoteHtml: string
}
