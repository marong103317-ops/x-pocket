// Unit tests for oembed fetcher
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchOembed } from '@/background/oembed'

describe('fetchOembed', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('应该在 oembed 成功时返回数据', async () => {
    const mockHtml = '<blockquote class="twitter-tweet">test</blockquote>'
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ html: mockHtml, url: 'https://x.com/user/status/1' }),
    })

    const result = await fetchOembed('https://x.com/user/status/1')

    expect(result).not.toBeNull()
    expect(result!.html).toBe(mockHtml)
  })

  it('应该在 oembed 返回 404 时返回 null', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    const result = await fetchOembed('https://x.com/user/status/999')

    expect(result).toBeNull()
  })

  it('应该在网络错误时返回 null', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await fetchOembed('https://x.com/user/status/1')

    expect(result).toBeNull()
  })
})
