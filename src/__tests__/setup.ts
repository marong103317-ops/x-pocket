// Test environment setup
import { createStorageMock } from './__mocks__/chrome-storage'
import { createTabsMock } from './__mocks__/chrome-tabs'
import { createRuntimeMock } from './__mocks__/chrome-runtime'
import { createContextMenusMock } from './__mocks__/chrome-context-menus'
import { createNotificationsMock } from './__mocks__/chrome-notifications'
import { createActionMock } from './__mocks__/chrome-action'

const tabsMock = createTabsMock()
const runtimeMock = createRuntimeMock()
const contextMenusMock = createContextMenusMock()
const notificationsMock = createNotificationsMock()
const actionMock = createActionMock()

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      local: createStorageMock(),
    },
    tabs: tabsMock,
    runtime: runtimeMock,
    contextMenus: contextMenusMock,
    notifications: notificationsMock,
    action: actionMock,
  },
  writable: true,
  configurable: true,
})
