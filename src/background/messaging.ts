// Message routing for background service worker
import type { RuntimeMessage } from '@/shared/types/messages'

type MessageHandler = (
  message: RuntimeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
) => boolean | void | Promise<void>

const handlers = new Map<string, MessageHandler>()

export function onMessage(type: RuntimeMessage['type'], handler: MessageHandler): void {
  handlers.set(type, handler)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const msg = message as RuntimeMessage
  const handler = handlers.get(msg.type)
  if (handler) {
    const result = handler(msg, sender, sendResponse)
    // If handler returns a Promise, keep channel open
    if (result instanceof Promise) {
      result.then(() => sendResponse({}))
      return true
    }
    // Return true to keep the message channel open for async response
    if (result === true) return true
  }
})
