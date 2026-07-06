// Unit tests for context menus
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupContextMenus, getMenuId } from '@/background/contextMenus'

describe('contextMenus', () => {
  beforeEach(() => {
    // Reset chrome mocks
    ;(chrome.contextMenus.create as ReturnType<typeof vi.fn>).mockClear()
    ;(chrome.contextMenus.removeAll as ReturnType<typeof vi.fn>).mockClear()
  })

  it('应该在 x.com 域名注册菜单', () => {
    setupContextMenus()

    expect(chrome.contextMenus.removeAll).toHaveBeenCalled()
    expect(chrome.contextMenus.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'x-pocket-collect-tweet',
        title: '收藏此推文到 Pocket for X',
        contexts: ['link', 'page'],
      })
    )
  })

  it('menuId 应该为固定值', () => {
    expect(getMenuId()).toBe('x-pocket-collect-tweet')
  })
})
