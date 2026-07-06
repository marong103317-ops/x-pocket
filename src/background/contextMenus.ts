// Context menu registration for x.com right-click collection
const MENU_ID = 'x-pocket-collect-tweet'

export function setupContextMenus(): void {
  // Remove any existing instances first (for idempotent re-registration)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: '收藏此推文到 X-Pocket',
      contexts: ['link', 'page'],
      documentUrlPatterns: [
        'https://x.com/*',
        'https://twitter.com/*',
      ],
    })
  })
}

export function getMenuId(): string {
  return MENU_ID
}
