// Tweet storage CRUD operations
import type { CollectedTweet } from '@/shared/types/tweet'
import { STORAGE_KEYS } from './keys'

export interface AddResult {
  success: boolean
  duplicate?: boolean
  error?: string
}

export async function getAllTweets(): Promise<CollectedTweet[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  const tweets: Record<string, CollectedTweet> = result[STORAGE_KEYS.TWEETS] ?? {}
  return Object.values(tweets)
}

export async function addTweet(
  tweet: CollectedTweet
): Promise<AddResult> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  const tweets: Record<string, CollectedTweet> = result[STORAGE_KEYS.TWEETS] ?? {}

  // Dedup by tweetId
  const exists = Object.values(tweets).some(t => t.tweetId === tweet.tweetId)
  if (exists) return { success: false, duplicate: true }

  tweets[tweet.id] = tweet
  await chrome.storage.local.set({ [STORAGE_KEYS.TWEETS]: tweets })
  await updateMeta()
  return { success: true }
}

export async function deleteTweet(id: string): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  const tweets: Record<string, CollectedTweet> = result[STORAGE_KEYS.TWEETS] ?? {}
  delete tweets[id]
  await chrome.storage.local.set({ [STORAGE_KEYS.TWEETS]: tweets })
  await updateMeta()
}

export async function updateTweet(
  id: string,
  patch: Partial<CollectedTweet>
): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  const tweets: Record<string, CollectedTweet> = result[STORAGE_KEYS.TWEETS] ?? {}
  if (tweets[id]) {
    tweets[id] = { ...tweets[id], ...patch }
    await chrome.storage.local.set({ [STORAGE_KEYS.TWEETS]: tweets })
  }
}

async function updateMeta(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TWEETS)
  const tweets: Record<string, CollectedTweet> = result[STORAGE_KEYS.TWEETS] ?? {}
  const count = Object.keys(tweets).length
  await chrome.storage.local.set({
    [STORAGE_KEYS.META]: { version: 1, createdAt: new Date().toISOString(), count },
  })
}
