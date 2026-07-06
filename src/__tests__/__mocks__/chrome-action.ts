// Mock chrome.action API
import { vi } from 'vitest'

export function createActionMock() {
  return {
    setBadgeText: vi.fn(() => Promise.resolve()),
    setBadgeBackgroundColor: vi.fn(() => Promise.resolve()),
  }
}
