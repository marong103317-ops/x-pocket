<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTweetsStore } from './stores/tweets'
import { useSettingsStore } from './stores/settings'
import { useTagsStore } from './stores/tags'

const tweetsStore = useTweetsStore()
const settingsStore = useSettingsStore()
const tagsStore = useTagsStore()

onMounted(async () => {
  await settingsStore.load()
  await tweetsStore.load()
  await tagsStore.load()

  // Apply theme
  document.documentElement.setAttribute('data-theme', settingsStore.settings.theme)
})
</script>

<template>
  <div class="display-app">
    <RouterView />
  </div>
</template>

<style>
@import '@/display/styles/global.css';
</style>
