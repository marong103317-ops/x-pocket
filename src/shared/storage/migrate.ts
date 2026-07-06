// Data migration framework
import { STORAGE_KEYS } from './keys'

interface Migration {
  version: number
  migrate: () => Promise<void>
}

const migrations: Migration[] = []

export function registerMigration(version: number, migrate: () => Promise<void>): void {
  migrations.push({ version, migrate })
}

export async function runMigrations(): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.META)
  const meta = result[STORAGE_KEYS.META] as { version: number } | undefined
  const currentVersion = meta?.version ?? 0

  const pending = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version)

  for (const m of pending) {
    try {
      await m.migrate()
      await chrome.storage.local.set({
        [STORAGE_KEYS.META]: { ...meta, version: m.version },
      })
    } catch (e) {
      console.error(`[Migration] Failed to migrate to version ${m.version}:`, e)
      throw e
    }
  }
}
