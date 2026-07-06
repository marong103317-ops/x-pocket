// Tag storage CRUD
import type { Tag } from '@/shared/types/tag'
import { STORAGE_KEYS } from './keys'
import { generateId } from '@/shared/utils/id'

export async function getAllTags(): Promise<Tag[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAGS)
  const tags: Record<string, Tag> = result[STORAGE_KEYS.TAGS] ?? {}
  return Object.values(tags)
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const tag: Tag = {
    id: generateId(),
    name,
    color,
    createdAt: new Date().toISOString(),
  }
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAGS)
  const tags: Record<string, Tag> = result[STORAGE_KEYS.TAGS] ?? {}
  tags[tag.id] = tag
  await chrome.storage.local.set({ [STORAGE_KEYS.TAGS]: tags })
  return tag
}

export async function deleteTag(id: string): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAGS)
  const tags: Record<string, Tag> = result[STORAGE_KEYS.TAGS] ?? {}
  delete tags[id]
  await chrome.storage.local.set({ [STORAGE_KEYS.TAGS]: tags })
}
