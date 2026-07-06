<script setup lang="ts">
import { ref } from 'vue'
import PasteCollector from './components/PasteCollector.vue'
import RecentList from './components/RecentList.vue'
import OpenDisplay from './components/OpenDisplay.vue'

const recentListKey = ref(0)

function onCollected() {
  recentListKey.value++
}

function openSponsor() {
  const url = chrome.runtime.getURL('src/display/index.html')
  chrome.tabs.create({ url: url + '#/settings' })
}
</script>

<template>
  <div class="popup-container">
    <header class="popup-header">
      <h2>Pocket for X</h2>
      <a class="sponsor-link" href="#" @click.prevent="openSponsor">☕</a>
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

.popup-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.popup-header h2 {
  margin: 0; font-size: 16px; font-weight: 700; color: #0f1419;
}
.sponsor-link {
  font-size: 18px; text-decoration: none; color: #536471; padding: 2px 6px; border-radius: 4px;
}
.sponsor-link:hover { background: #f7f9f9; }

.popup-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #cfd9de;
}
</style>
