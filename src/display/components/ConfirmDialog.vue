<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="visible" class="confirm-overlay" @click.self="emit('cancel')">
    <div class="confirm-dialog">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel-btn" @click="emit('cancel')">取消</button>
        <button class="confirm-ok-btn" @click="emit('confirm')">确认</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog {
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 360px;
  width: calc(100% - 48px);
  box-shadow: var(--shadow-lg);
}

.confirm-dialog h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--color-text);
}

.confirm-dialog p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-cancel-btn {
  padding: 6px 16px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.confirm-ok-btn {
  padding: 6px 16px;
  background: var(--color-danger);
  border: none;
  border-radius: var(--radius-full);
  font-size: 13px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}
</style>
