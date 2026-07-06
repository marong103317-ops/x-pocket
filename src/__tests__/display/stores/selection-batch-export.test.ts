// TDD tests for batch export
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSelectionStore } from '@/display/stores/selection'

describe('selectionStore - batch export helpers', () => {
  let store: ReturnType<typeof useSelectionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSelectionStore()
  })

  describe('getSelectedIdsArray', () => {
    it('无选中时返回空数组', () => {
      expect(store.getSelectedIdsArray()).toEqual([])
    })

    it('选中 3 个后返回正确的 id 数组', () => {
      store.toggle('a')
      store.toggle('b')
      store.toggle('c')
      const ids = store.getSelectedIdsArray()
      expect(ids).toHaveLength(3)
      expect(ids).toContain('a')
      expect(ids).toContain('b')
      expect(ids).toContain('c')
    })

    it('取消选中后数组应更新', () => {
      store.toggle('a')
      store.toggle('b')
      store.toggle('a') // deselect
      expect(store.getSelectedIdsArray()).toEqual(['b'])
    })
  })

  describe('hasSelection', () => {
    it('无选中时返回 false', () => {
      expect(store.hasSelection).toBe(false)
    })

    it('有选中时返回 true', () => {
      store.toggle('a')
      expect(store.hasSelection).toBe(true)
    })

    it('清空后返回 false', () => {
      store.toggle('a')
      store.clear()
      expect(store.hasSelection).toBe(false)
    })
  })
})
