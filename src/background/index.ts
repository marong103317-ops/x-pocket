// Background Service Worker entry point
import './messaging'
import { setupContextMenus, getMenuId } from './contextMenus'
import { fetchOembed } from './oembed'
import { pushInbox } from '@/shared/storage/inbox'
import { getAllTweets, deleteTweet } from '@/shared/storage/tweetStore'
import { generateId } from '@/shared/utils/id'
import { normalizeTweetUrl } from '@/shared/parser/urlParser'

console.log('[X-Pocket] Background service worker started')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[X-Pocket] Extension installed, setting up context menus')
  setupContextMenus()
})

setupContextMenus()

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== getMenuId()) return

  let tweetUrl = ''
  if (info.linkUrl && /\/status\/\d+/.test(info.linkUrl)) {
    tweetUrl = info.linkUrl
  } else if (info.pageUrl && /\/status\/\d+/.test(info.pageUrl)) {
    tweetUrl = info.pageUrl
  } else if (tab?.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'FIND_TWEET_URL' })
      if (response?.tweetUrl) tweetUrl = response.tweetUrl
    } catch {}
  }

  if (!tweetUrl) {
    chrome.notifications.create({
      type: 'basic', iconUrl: 'icons/icon-48.png', title: 'X-Pocket',
      message: '未能获取推文链接，请在推文的时间戳链接上右键重试',
    })
    return
  }

  const normalizedUrl = normalizeTweetUrl(tweetUrl)
  const oembedData = await fetchOembed(normalizedUrl)

  if (oembedData?.html) {
    await pushInbox({
      id: generateId(), blockquoteHtml: oembedData.html,
      tweetUrl: normalizedUrl, source: 'oembed',
      collectedAt: new Date().toISOString(),
    })
    chrome.notifications.create({
      type: 'basic', iconUrl: 'icons/icon-48.png', title: 'X-Pocket',
      message: '已收藏到 X-Pocket',
    })
  } else {
    chrome.notifications.create({
      type: 'basic', iconUrl: 'icons/icon-48.png', title: 'X-Pocket',
      message: '该推文可能已被删除或设为私有',
    })
  }
})

import { onMessage } from './messaging'

onMessage('GET_TWEET_COUNT', async (_msg, _sender, sendResponse) => {
  const result = await chrome.storage.local.get('xpc:meta')
  const meta = result['xpc:meta'] as { count?: number } | undefined
  sendResponse({ count: meta?.count ?? 0 })
})

onMessage('OPEN_DISPLAY', async (_msg, _sender, sendResponse) => {
  const url = chrome.runtime.getURL('src/display/index.html')
  await chrome.tabs.create({ url })
  sendResponse({ success: true })
})

onMessage('COLLECT_TWEET_BY_URL', async (msg) => {
  const { tweetUrl } = msg as { tweetUrl: string }
  const normalizedUrl = normalizeTweetUrl(tweetUrl)
  const oembedData = await fetchOembed(normalizedUrl)
  if (oembedData?.html) {
    await pushInbox({
      id: generateId(), blockquoteHtml: oembedData.html,
      tweetUrl: normalizedUrl, source: 'oembed',
      collectedAt: new Date().toISOString(),
    })
    chrome.notifications.create({
      type: 'basic', iconUrl: 'icons/icon-48.png', title: 'X-Pocket',
      message: '已收藏到 X-Pocket',
    })
  }
})

// Unlike → remove tweet from collection
onMessage('UNCOLLECT_TWEET', async (msg) => {
  const { tweetUrl } = msg as { tweetUrl: string }
  const normalizedUrl = normalizeTweetUrl(tweetUrl)
  const tweets = await getAllTweets()
  const match = tweets.find(t => t.tweetUrl === normalizedUrl)
  if (match) {
    await deleteTweet(match.id)
    console.log('[X-Pocket] Removed:', normalizedUrl)
  }
})

chrome.action.setBadgeText({ text: '' })
console.log('[X-Pocket] Background worker ready')
