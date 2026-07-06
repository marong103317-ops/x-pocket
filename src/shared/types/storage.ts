import type { CollectedTweet } from './tweet'
import type { Tag } from './tag'
import type { Settings } from './settings'

/** chrome.storage.local schema */
export interface StorageSchema {
  meta: { version: number; createdAt: string; count: number }
  tweets: Record<string, CollectedTweet>
  tags: Record<string, Tag>
  settings: Settings
  inbox: InboxItem[]
}

/** An item in the inbox queue (raw HTML from background → parsed by popup/display) */
export interface InboxItem {
  id: string
  blockquoteHtml: string
  tweetUrl?: string
  source: CollectedTweet['source']
  collectedAt: string
}
