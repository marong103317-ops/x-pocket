// TDD tests for multi-select / batch operations
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSelectionStore } from '@/display/stores/selection'

describe('selectionStore', () => {
  let store: ReturnType<typeof useSelectionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSelectionStore()
  })

  describe('default state', () => {
    it('初始状态 count 为 0', () => {
      expect(store.count).toBe(0)
    })

    it('初始状态 isEmpty 为 true', () => {
      expect(store.isEmpty).toBe(true)
    })
  })

  describe('toggle', () => {
    it('toggle 一个 id 应该将其加入选中', () => {
      store.toggle('id-1')
      expect(store.isSelected('id-1')).toBe(true)
      expect(store.count).toBe(1)
    })

    it('再次 toggle 同一个 id 应该取消选中', () => {
      store.toggle('id-1')
      store.toggle('id-1')
      expect(store.isSelected('id-1')).toBe(false)
      expect(store.count).toBe(0)
    })

    it('toggle 多个不同 id', () => {
      store.toggle('id-1')
      store.toggle('id-2')
      store.toggle('id-3')
      expect(store.count).toBe(3)
      expect(store.isSelected('id-1')).toBe(true)
      expect(store.isSelected('id-2')).toBe(true)
      expect(store.isSelected('id-3')).toBe(true)
    })
  })

  describe('selectAll', () => {
    it('selectAll 应选中所有给定 id', () => {
      store.selectAll(['a', 'b', 'c'])
      expect(store.count).toBe(3)
      expect(store.isSelected('a')).toBe(true)
    })

    it('selectAll 应替换已有选中', () => {
      store.toggle('old')
      store.selectAll(['a', 'b'])
      expect(store.count).toBe(2)
      expect(store.isSelected('old')).toBe(false)
      expect(store.isSelected('a')).toBe(true)
    })

    it('selectAll 空数组应清空选中', () => {
      store.toggle('old')
      store.selectAll([])
      expect(store.count).toBe(0)
    })
  })

  describe('clear', () => {
    it('应该清空所有选中', () => {
      store.toggle('a')
      store.toggle('b')
      store.clear()
      expect(store.count).toBe(0)
      expect(store.isEmpty).toBe(true)
    })
  })

  describe('getSelectedIds', () => {
    it('应返回选中 id 数组', () => {
      store.toggle('a')
      store.toggle('b')
      expect(store.selectedIds.has('a')).toBe(true)
      expect(store.selectedIds.has('b')).toBe(true)
    })
  })

  describe('currentPageIds', () => {
    it('应正确设置和获取当前页 id', () => {
      store.setPageIds(['x', 'y', 'z'])
      expect(store.isAllPageSelected).toBe(false)
    })

    it('全选当前页后 isAllPageSelected 应为 true', () => {
      store.setPageIds(['x', 'y'])
      store.selectAll(['x', 'y'])
      expect(store.isAllPageSelected).toBe(true)
    })

    it('部分选中 isAllPageSelected 应为 false', () => {
      store.setPageIds(['x', 'y', 'z'])
      store.toggle('x')
      expect(store.isAllPageSelected).toBe(false)
    })
  })
})
