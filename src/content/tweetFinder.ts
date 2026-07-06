// Content script: tracks the last right-clicked tweet URL on x.com
// Also provides tweet URL extraction from DOM containers.

let lastTweetUrl: string | null = null

export function getLastTweetUrl(): string | null {
  return lastTweetUrl
}

/**
 * Extract the tweet URL from a tweet container DOM element.
 */
export function findTweetUrl(container: Element): string | null {
  const statusLink = container.querySelector<HTMLAnchorElement>(
    'a[href*="/status/"]'
  )
  if (!statusLink) return null
  const href = statusLink.getAttribute('href') ?? ''
  if (href.startsWith('/')) {
    return `https://x.com${href}`
  }
  return href
}

/**
 * Initialize tweet URL tracking via contextmenu events.
 */
export function initTweetFinder(): void {
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement
    const tweetContainer = target.closest('[data-testid="tweet"]')
    if (!tweetContainer) return
    const statusLink = tweetContainer.querySelector<HTMLAnchorElement>(
      'a[href*="/status/"]'
    )
    if (statusLink) {
      lastTweetUrl = statusLink.href
    }
  })
}
