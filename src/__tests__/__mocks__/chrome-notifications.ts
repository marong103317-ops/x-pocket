// Mock chrome.notifications API
import { vi } from 'vitest'

export function createNotificationsMock() {
  return {
    create: vi.fn(
      (
        _notificationId: string,
        _options: chrome.notifications.NotificationOptions,
        _callback?: (notificationId: string) => void
      ): Promise<string> => {
        _callback?.('notification-id')
        return Promise.resolve('notification-id')
      }
    ),
    clear: vi.fn(() => Promise.resolve(true)),
  }
}
