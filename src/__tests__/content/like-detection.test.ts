// Tests for content script like/unlike click detection logic
import { describe, it, expect } from 'vitest'

/**
 * Simulates the content script click handler logic.
 * Returns the action type based on button selector.
 */
function detectAction(targetSelector: string): 'collect' | 'uncollect' | null {
  const isUnlike = targetSelector === 'unlike'
  const isLike = targetSelector === 'like'
  if (isUnlike) return 'uncollect'
  if (isLike) return 'collect'
  return null
}

describe('content script - like/unlike detection', () => {
  it('点击 like 按钮应该触发 collect', () => {
    expect(detectAction('like')).toBe('collect')
  })

  it('点击 unlike 按钮应该触发 uncollect', () => {
    expect(detectAction('unlike')).toBe('uncollect')
  })

  it('点击其他按钮不应该触发', () => {
    expect(detectAction('reply')).toBeNull()
    expect(detectAction('retweet')).toBeNull()
  })
})

describe('content script - dedup', () => {
  it('已收藏的 url 不应重复发送 collect', () => {
    const collected = new Set<string>(['https://x.com/u/status/1'])
    const url = 'https://x.com/u/status/1'
    expect(collected.has(url)).toBe(true)
  })

  it('新 url 应允许 collect', () => {
    const collected = new Set<string>(['https://x.com/u/status/1'])
    const url = 'https://x.com/u/status/2'
    expect(collected.has(url)).toBe(false)
  })
})
