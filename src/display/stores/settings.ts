// Pinia store for settings management
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Settings } from '@/shared/types/settings'
import { getSettings, updateSettings } from '@/shared/storage/settingsStore'
import { DEFAULT_SETTINGS } from '@/shared/storage/keys'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({ ...DEFAULT_SETTINGS })
  const loaded = ref(false)

  async function load(): Promise<void> {
    settings.value = await getSettings()
    loaded.value = true
  }

  async function update(patch: Partial<Settings>): Promise<void> {
    settings.value = await updateSettings(patch)
  }

  return { settings, loaded, load, update }
})
