// Settings storage operations
import type { Settings } from '@/shared/types/settings'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './keys'

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS)
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] ?? {}) }
}

export async function updateSettings(
  patch: Partial<Settings>
): Promise<Settings> {
  const current = await getSettings()
  const updated = { ...current, ...patch }
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated })
  return updated
}
