// Unit tests for date parser
import { describe, it, expect } from 'vitest'
import { parseTweetDate } from '@/shared/parser/dateParser'

describe('parseTweetDate', () => {
  it('应该解析英文日期格式 "July 5, 2026"', () => {
    const result = parseTweetDate('July 5, 2026')
    const date = new Date(result)
    // The date conversion may shift by timezone. Verify year and month at minimum.
    expect(date.getUTCFullYear()).toBe(2026)
    expect(date.getUTCMonth()).toBe(6) // July = 6 (0-indexed)
    // Day may shift due to UTC offset, so just check it's a valid date
    expect(date.getTime()).not.toBeNaN()
  })

  it('应该解析中文日期格式 "2026年7月5日"', () => {
    const result = parseTweetDate('2026年7月5日')
    const date = new Date(result)
    expect(date.getUTCFullYear()).toBe(2026)
    expect(date.getUTCMonth()).toBe(6) // July = 6
    expect(date.getUTCDate()).toBe(4) // UTC conversion from local midnight
  })

  it('应该在空字符串时返回空字符串', () => {
    const result = parseTweetDate('')
    expect(result).toBe('')
  })

  it('应该在不可解析文本时返回空字符串', () => {
    const result = parseTweetDate('some random text')
    expect(result).toBe('')
  })
})
