// Unit tests for settingsStore
import { describe, it, expect, beforeEach } from 'vitest'
import { getSettings, updateSettings } from '@/shared/storage/settingsStore'
import { DEFAULT_SETTINGS } from '@/shared/storage/keys'

describe('settingsStore', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(chrome.storage.local as any)._reset()
  })

  it('首次使用应该返回默认设置', async () => {
    const settings = await getSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
    expect(settings.displayMode).toBe('grid')
  })

  it('应该更新并持久化设置', async () => {
    const updated = await updateSettings({ theme: 'dark' })
    expect(updated.theme).toBe('dark')

    // Re-read should persist
    const settings = await getSettings()
    expect(settings.theme).toBe('dark')
  })

  it('部分更新不应影响其他字段', async () => {
    await updateSettings({ theme: 'dark' })
    const settings = await getSettings()

    expect(settings.theme).toBe('dark')
    expect(settings.renderMode).toBe(DEFAULT_SETTINGS.renderMode)
    expect(settings.defaultSort).toBe(DEFAULT_SETTINGS.defaultSort)
  })
})
