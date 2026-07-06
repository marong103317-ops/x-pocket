// Content Script - injected into x.com / twitter.com
// Guard against double injection (static manifest + dynamic fallback)
if ((window as any).__x_pocket_injected) {
  // Already injected, skip
} else {
  (window as any).__x_pocket_injected = true
}

import { initTweetFinder, getLastTweetUrl, findTweetUrl } from './tweetFinder'
import type { RuntimeMessage } from '@/shared/types/messages'

console.log('[Pocket for X] Content script loaded')

initTweetFinder()

// --- Like button collection via click capture ---
const collectedUrls = new Set<string>()

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  const likeBtn = target.closest('[data-testid="like"]')
  const unlikeBtn = target.closest('[data-testid="unlike"]')
  const btn = likeBtn || unlikeBtn
  if (!btn) return

  const tweet = btn.closest('article[data-testid="tweet"]')
    || btn.closest('[data-testid="tweet"]')
    || btn.closest('[data-testid="tweetDetail"]')
  if (!tweet) return

  const tweetUrl = findTweetUrl(tweet)
  if (!tweetUrl) return

  if (unlikeBtn) {
    // Unlike → remove from collection
    chrome.runtime.sendMessage({
      type: 'UNCOLLECT_TWEET',
      tweetUrl,
    } as RuntimeMessage).catch(() => {})
    console.log('[Pocket for X] Unlike → remove:', tweetUrl)
    return
  }

  // Like → collect
  if (collectedUrls.has(tweetUrl)) return
  collectedUrls.add(tweetUrl)
  chrome.runtime.sendMessage({
    type: 'COLLECT_TWEET_BY_URL',
    tweetUrl,
  } as RuntimeMessage).catch(() => {})
  console.log('[Pocket for X] Like collected:', tweetUrl)
}, true)

// --- Message listeners ---
chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse) => {
    if (message.type === 'FIND_TWEET_URL') {
      sendResponse({ tweetUrl: getLastTweetUrl() })
    }
  }
)
