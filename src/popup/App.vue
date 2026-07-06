<script setup lang="ts">
import { ref } from 'vue'
import PasteCollector from './components/PasteCollector.vue'
import RecentList from './components/RecentList.vue'
import OpenDisplay from './components/OpenDisplay.vue'

// Refresh key to force RecentList to reload after a new collection
const recentListKey = ref(0)

function onCollected() {
  recentListKey.value++
}
</script>

<template>
  <div class="popup-container">
    <header class="popup-header">
      <h2>X-Pocket</h2>
    </header>

    <PasteCollector @collected="onCollected" />

    <RecentList :key="recentListKey" />

    <footer class="popup-footer">
      <OpenDisplay />
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 360px;
  min-height: 200px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  color: #0f1419;
  background: #ffffff;
}

.popup-container {
  padding: 16px;
}

.popup-header h2 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f1419;
}

.popup-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #cfd9de;
}
</style>
