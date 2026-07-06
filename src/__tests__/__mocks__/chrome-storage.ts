// Mock chrome.storage.local API with an in-memory store
import { vi } from 'vitest'

export function createStorageMock() {
  const store = new Map<string, unknown>()

  return {
    get: vi.fn(
      (keys: string | string[] | null): Promise<Record<string, unknown>> => {
        if (keys === null || keys === undefined) {
          const result: Record<string, unknown> = {}
          store.forEach((v, k) => { result[k] = v })
          return Promise.resolve(result)
        }
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: store.get(keys) })
        }
        const result: Record<string, unknown> = {}
        for (const k of keys) {
          result[k] = store.get(k)
        }
        return Promise.resolve(result)
      }
    ),

    set: vi.fn(
      (items: Record<string, unknown>): Promise<void> => {
        for (const [k, v] of Object.entries(items)) {
          store.set(k, v)
        }
        return Promise.resolve()
      }
    ),

    remove: vi.fn(
      (keys: string | string[]): Promise<void> => {
        const keyList = typeof keys === 'string' ? [keys] : keys
        for (const k of keyList) {
          store.delete(k)
        }
        return Promise.resolve()
      }
    ),

    clear: vi.fn((): Promise<void> => {
      store.clear()
      return Promise.resolve()
    }),

    getBytesInUse: vi.fn(
      (_keys?: string | string[]): Promise<number> => {
        let total = 0
        store.forEach((v) => {
          total += JSON.stringify(v).length * 2
        })
        return Promise.resolve(total)
      }
    ),

    _dump: () => new Map(store),
    _reset: () => store.clear(),
  }
}
