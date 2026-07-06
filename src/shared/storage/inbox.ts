// Inbox queue: background stores raw HTML → popup/display parses it
import type { InboxItem } from '@/shared/types/storage'
import { STORAGE_KEYS } from './keys'

export async function pushInbox(item: InboxItem): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.INBOX)
  const inbox: InboxItem[] = result[STORAGE_KEYS.INBOX] ?? []
  inbox.push(item)
  await chrome.storage.local.set({ [STORAGE_KEYS.INBOX]: inbox })
}

export async function popInbox(): Promise<InboxItem[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.INBOX)
  const inbox: InboxItem[] = result[STORAGE_KEYS.INBOX] ?? []
  await chrome.storage.local.remove(STORAGE_KEYS.INBOX)
  return inbox
}
