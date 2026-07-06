// Unit tests for URL parser
import { describe, it, expect } from 'vitest'
import { normalizeTweetUrl } from '@/shared/parser/urlParser'

describe('normalizeTweetUrl', () => {
  it('应该保持标准 x.com URL 不变', () => {
    const result = normalizeTweetUrl(
      'https://x.com/iamai_omni/status/2073779604264047025'
    )
    expect(result).toBe('https://x.com/iamai_omni/status/2073779604264047025')
  })

  it('应该将 twitter.com 转换为 x.com', () => {
    const result = normalizeTweetUrl(
      'https://twitter.com/iamai_omni/status/2073779604264047025'
    )
    expect(result).toBe('https://x.com/iamai_omni/status/2073779604264047025')
  })

  it('应该去掉 query 参数', () => {
    const result = normalizeTweetUrl(
      'https://x.com/user/status/123?ref_src=twsrc%5Etfw'
    )
    expect(result).toBe('https://x.com/user/status/123')
  })

  it('应该处理相对路径', () => {
    const result = normalizeTweetUrl(
      '/iamai_omni/status/2073779604264047025'
    )
    expect(result).toBe('https://x.com/iamai_omni/status/2073779604264047025')
  })

  it('应该在非法 URL 时返回原值', () => {
    const result = normalizeTweetUrl('not a url')
    expect(result).toBe('not a url')
  })
})
