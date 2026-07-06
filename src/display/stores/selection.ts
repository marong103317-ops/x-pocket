// Selection store for multi-select / batch operations
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSelectionStore = defineStore('selection', () => {
  const selectedIds = ref<Set<string>>(new Set())
  const currentPageIds = ref<string[]>([])

  const count = computed(() => selectedIds.value.size)
  const isEmpty = computed(() => selectedIds.value.size === 0)
  const hasSelection = computed(() => selectedIds.value.size > 0)

  function getSelectedIdsArray(): string[] {
    return [...selectedIds.value]
  }

  const isAllPageSelected = computed(() => {
    if (currentPageIds.value.length === 0) return false
    return currentPageIds.value.every(id => selectedIds.value.has(id))
  })

  function toggle(id: string): void {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  function selectAll(ids: string[]): void {
    selectedIds.value = new Set(ids)
  }

  function clear(): void {
    selectedIds.value = new Set()
  }

  function isSelected(id: string): boolean {
    return selectedIds.value.has(id)
  }

  function setPageIds(ids: string[]): void {
    currentPageIds.value = ids
  }

  function toggleSelectAllPage(): void {
    if (isAllPageSelected.value) {
      // Deselect all on current page
      const next = new Set(selectedIds.value)
      currentPageIds.value.forEach(id => next.delete(id))
      selectedIds.value = next
    } else {
      // Select all on current page
      const next = new Set(selectedIds.value)
      currentPageIds.value.forEach(id => next.add(id))
      selectedIds.value = next
    }
  }

  return {
    selectedIds,
    currentPageIds,
    count,
    isEmpty,
    hasSelection,
    isAllPageSelected,
    toggle,
    selectAll,
    clear,
    isSelected,
    setPageIds,
    toggleSelectAllPage,
    getSelectedIdsArray,
  }
})
