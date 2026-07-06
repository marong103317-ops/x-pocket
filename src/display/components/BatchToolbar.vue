<script setup lang="ts">
import { useSelectionStore } from '@/display/stores/selection'

const selectionStore = useSelectionStore()

const emit = defineEmits<{
  delete: [ids: string[]]
  exportSelected: [ids: string[]]
}>()
</script>

<template>
  <div v-if="selectionStore.count > 0" class="batch-toolbar">
    <label class="batch-select-all">
      <input
        type="checkbox"
        :checked="selectionStore.isAllPageSelected"
        @change="selectionStore.toggleSelectAllPage()"
      />
      全选本页
    </label>
    <span class="batch-count">已选 {{ selectionStore.count }} 条</span>
    <div class="batch-actions">
      <button class="batch-btn" @click="selectionStore.clear()">取消</button>
      <button class="batch-btn batch-export" @click="emit('exportSelected', selectionStore.getSelectedIdsArray())">📤 导出选中 ({{ selectionStore.count }})</button>
      <button class="batch-btn batch-delete" @click="emit('delete', selectionStore.getSelectedIdsArray())">🗑 删除选中</button>
    </div>
  </div>
</template>

<style scoped>
.batch-toolbar {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 14px; background: var(--color-primary-light); border-radius: var(--radius-md);
  margin-bottom: 12px; position: sticky; top: 0; z-index: 50;
}
.batch-select-all { font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; user-select: none; }
.batch-select-all input { width: 15px; height: 15px; cursor: pointer; }
.batch-count { font-size: 13px; font-weight: 600; color: var(--color-primary); flex: 1; }
.batch-actions { display: flex; gap: 6px; }
.batch-btn { padding: 4px 10px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; cursor: pointer; white-space: nowrap; }
.batch-delete { color: var(--color-danger); border-color: var(--color-danger); }
.batch-delete:hover { background: #fde8e8; }
.batch-export { color: var(--color-primary); border-color: var(--color-primary); }
.batch-export:hover { background: var(--color-primary-light); }
</style>
