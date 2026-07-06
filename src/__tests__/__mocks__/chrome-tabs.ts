// Mock chrome.tabs API
import { vi } from 'vitest'

export function createTabsMock() {
  return {
    create: vi.fn(
      (_options: { url?: string }): Promise<chrome.tabs.Tab> => {
        return Promise.resolve({
          id: 1,
          windowId: 1,
          url: _options.url,
        } as chrome.tabs.Tab)
      }
    ),
    query: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve()),
  }
}
