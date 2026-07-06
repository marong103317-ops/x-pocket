// Unit tests for blockquote parser
import { describe, it, expect } from 'vitest'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import {
  CHINESE_TWEET_HTML,
  ENGLISH_TWEET_HTML,
  NON_BLOCKQUOTE_HTML,
  XSS_TWEET_HTML,
  EMPTY_HTML,
} from '@/__tests__/__fixtures__/blockquotes'

describe('parseBlockquote', () => {
  describe('happy path', () => {
    it('应该正确解析标准中文推文嵌入码', () => {
      const result = parseBlockquote(CHINESE_TWEET_HTML)

      expect(result).not.toBeNull()
      expect(result!.tweetId).toBe('2073779604264047025')
      expect(result!.tweetUrl).toBe('https://x.com/iamai_omni/status/2073779604264047025')
      expect(result!.author).toBe('✧ 𝕀𝔸𝕄𝔸𝕀 ✧')
      expect(result!.handle).toBe('iamai_omni')
      expect(result!.lang).toBe('zh')
      expect(result!.contentText).toContain('cornex楚能')
      // pic.twitter.com URL in link text → constructed as image URL
      expect(result!.coverUrl).toBe('https://pic.twitter.com/oRDjWucQBx')
      // blockquoteHtml must not contain <script>
      expect(result!.blockquoteHtml).not.toContain('<script')
    })

    it('应该正确解析标准英文推文嵌入码', () => {
      const result = parseBlockquote(ENGLISH_TWEET_HTML)

      expect(result).not.toBeNull()
      expect(result!.lang).toBe('en')
      expect(result!.tweetId).toBe('1234567890')
      expect(result!.handle).toBe('elonmusk')
      expect(result!.author).toBe('Elon Musk')
      expect(result!.postedAt).toBeDefined()
      // Should be a valid ISO date
      expect(() => new Date(result!.postedAt)).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('应该在输入非 blockquote 内容时返回 null', () => {
      const result = parseBlockquote(NON_BLOCKQUOTE_HTML)
      expect(result).toBeNull()
    })

    it('应该在输入空字符串时返回 null', () => {
      const result = parseBlockquote(EMPTY_HTML)
      expect(result).toBeNull()
    })

    it('应该对 XSS 攻击载荷进行消毒', () => {
      const result = parseBlockquote(XSS_TWEET_HTML)

      expect(result).not.toBeNull()
      expect(result!.contentHtml).not.toContain('onerror')
    })

    it('blockquoteHtml 应该移除内嵌 script 标签', () => {
      const result = parseBlockquote(CHINESE_TWEET_HTML)

      expect(result).not.toBeNull()
      expect(result!.blockquoteHtml).not.toContain('<script')
    })
  })
})
