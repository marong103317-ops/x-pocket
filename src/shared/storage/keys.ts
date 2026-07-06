// Storage keys and default values
import type { Settings } from '@/shared/types/settings'
import type { StorageSchema } from '@/shared/types/storage'

export const STORAGE_KEYS = {
  META: 'xpc:meta',
  TWEETS: 'xpc:tweets',
  TAGS: 'xpc:tags',
  SETTINGS: 'xpc:settings',
  INBOX: 'xpc:inbox',
} as const

export const DEFAULT_SETTINGS: Settings = {
  renderMode: 'local',
  theme: 'system',
  defaultSort: 'collectedAt',
  defaultSortDir: 'desc',
  tagFilterMode: 'or',
  displayMode: 'grid',
}

export const DEFAULT_META: StorageSchema['meta'] = {
  version: 1,
  createdAt: new Date().toISOString(),
  count: 0,
}
