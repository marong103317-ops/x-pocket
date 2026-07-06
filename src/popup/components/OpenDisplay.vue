<script setup lang="ts">
function openDisplay() {
  const url = chrome.runtime.getURL('src/display/index.html')
  chrome.tabs.create({ url })
}
</script>

<template>
  <button class="open-display-btn" @click="openDisplay">
    📋 打开展示页
  </button>
</template>

<style scoped>
.open-display-btn {
  display: block;
  width: 100%;
  padding: 8px 0;
  background: transparent;
  color: #1d9bf0;
  border: 1px solid #1d9bf0;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.open-display-btn:hover {
  background: #e8f5fd;
}
</style>
