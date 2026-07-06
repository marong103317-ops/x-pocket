// Mock chrome.contextMenus API
import { vi } from 'vitest'

export function createContextMenusMock() {
  const handlers: Array<
    (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
  > = []

  return {
    create: vi.fn(
      (_props: chrome.contextMenus.CreateProperties, _callback?: () => void): string | number => {
        _callback?.()
        return 'menu-id'
      }
    ),
    removeAll: vi.fn((callback?: () => void) => {
      callback?.()
    }),
    onClicked: {
      addListener: vi.fn(
        (
          cb: (
            info: chrome.contextMenus.OnClickData,
            tab?: chrome.tabs.Tab
          ) => void
        ) => {
          handlers.push(cb)
        }
      ),
      // Test helper: simulate right-click
      _trigger: (
        info: chrome.contextMenus.OnClickData,
        tab?: chrome.tabs.Tab
      ) => {
        handlers.forEach((h) => h(info, tab))
      },
    },
  }
}
