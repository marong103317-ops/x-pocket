<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTweetsStore } from '@/display/stores/tweets'
import { useSettingsStore } from '@/display/stores/settings'
import { useSelectionStore } from '@/display/stores/selection'
import SearchBar from '@/display/components/SearchBar.vue'
import FilterPanel from '@/display/components/FilterPanel.vue'
import SortControls from '@/display/components/SortControls.vue'
import TweetGrid from '@/display/components/TweetGrid.vue'
import TweetList from '@/display/components/TweetList.vue'
import TweetDetail from '@/display/components/TweetDetail.vue'
import ConfirmDialog from '@/display/components/ConfirmDialog.vue'
import ExportDialog from '@/display/components/ExportDialog.vue'
import Pagination from '@/display/components/Pagination.vue'
import BatchToolbar from '@/display/components/BatchToolbar.vue'

const tweetsStore = useTweetsStore()
const settingsStore = useSettingsStore()
const selectionStore = useSelectionStore()
const route = useRoute()

const showDeleteConfirm = ref(false)
const deletingTweetId = ref<string | null>(null)
const batchDeleteIds = ref<string[] | null>(null)
const showExportDialog = ref(false)

watch(() => tweetsStore.paginatedTweets, (tweets) => {
  selectionStore.setPageIds(tweets.map(t => t.id))
}, { immediate: true })

// Selected tweets for batch export
const selectedTweets = computed(() => {
  const ids = selectionStore.getSelectedIdsArray()
  return ids.map(id => tweetsStore.tweets[id]).filter(Boolean)
})

onMounted(() => {
  const tweetId = route.query.tweet as string | undefined
  if (tweetId && tweetsStore.tweets[tweetId]) tweetsStore.selectTweet(tweetId)
})

async function toggleDisplayMode() {
  const next = settingsStore.settings.displayMode === 'grid' ? 'list' : 'grid'
  await settingsStore.update({ displayMode: next })
}

function handleSelectTweet(id: string) { tweetsStore.selectTweet(id) }
function handleCloseDetail() { tweetsStore.selectTweet(null) }

function handleDeleteRequest(id: string) {
  deletingTweetId.value = id
  showDeleteConfirm.value = true
}

function handleBatchDelete(ids: string[]) {
  batchDeleteIds.value = ids
  showDeleteConfirm.value = true
}

async function handleConfirmDelete() {
  if (batchDeleteIds.value) {
    for (const id of batchDeleteIds.value) await tweetsStore.remove(id)
    selectionStore.clear()
    batchDeleteIds.value = null
  } else if (deletingTweetId.value) {
    await tweetsStore.remove(deletingTweetId.value)
    deletingTweetId.value = null
  }
  showDeleteConfirm.value = false
}

function handleCancelDelete() {
  showDeleteConfirm.value = false
  deletingTweetId.value = null
  batchDeleteIds.value = null
}

function handleCloseExport() { showExportDialog.value = false }

function handleBatchExport(_ids: string[]) {
  showExportDialog.value = true
}
</script>

<template>
  <div class="home-layout">
    <div class="home-header">
      <header class="top-bar">
        <h1>X-Pocket</h1>
        <span class="tweet-count">共 {{ tweetsStore.filteredCount }} 条</span>
        <div class="top-bar-actions">
          <router-link to="/tags" class="nav-link">🏷</router-link>
          <router-link to="/settings" class="settings-link">⚙</router-link>
        </div>
      </header>
      <SearchBar />
      <FilterPanel />
      <div class="toolbar">
        <SortControls />
        <div class="toolbar-actions">
          <button class="view-toggle-btn" @click="toggleDisplayMode">
            {{ settingsStore.settings.displayMode === 'grid' ? '📋 列表' : '⊞ 宫格' }}
          </button>
          <button class="export-btn" @click="showExportDialog = true" :disabled="tweetsStore.tweetCount === 0">
            📤 导出
          </button>
        </div>
      </div>
    </div>

    <div class="home-content">
      <BatchToolbar @delete="handleBatchDelete" @export-selected="handleBatchExport" />
      <TweetGrid
        v-if="settingsStore.settings.displayMode === 'grid'"
        :tweets="tweetsStore.paginatedTweets"
        :loading="tweetsStore.loading"
        @select="handleSelectTweet"
      />
      <TweetList
        v-else
        :tweets="tweetsStore.paginatedTweets"
        :loading="tweetsStore.loading"
        @select="handleSelectTweet"
        @delete="handleDeleteRequest"
      />
    </div>

    <div class="home-footer">
      <Pagination />
    </div>

    <TweetDetail
      v-if="tweetsStore.selectedTweet"
      :tweet="tweetsStore.selectedTweet"
      @close="handleCloseDetail"
      @delete="handleDeleteRequest"
    />
    <ExportDialog
      v-if="showExportDialog"
      :tweets="tweetsStore.paginatedTweets"
      :allTweets="tweetsStore.filteredTweets"
      :selectedTweets="selectedTweets"
      @close="handleCloseExport"
    />
    <ConfirmDialog
      :visible="showDeleteConfirm"
      :title="batchDeleteIds ? '确认批量删除' : '确认删除'"
      :message="batchDeleteIds ? `确定要删除选中的 ${batchDeleteIds.length} 条推文吗？此操作不可恢复。` : '确定要删除这条推文吗？此操作不可恢复。'"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </div>
</template>

<style scoped>
.home-layout { display: flex; flex-direction: column; height: 100vh; overflow: hidden; max-width: 1200px; margin: 0 auto; }
.home-header { flex-shrink: 0; padding: 16px 16px 0; }
.home-content { flex: 1; overflow-y: auto; padding: 0 16px 16px; min-height: 0; }
.home-footer { flex-shrink: 0; padding: 4px 16px 12px; border-top: 1px solid var(--color-border); }
.top-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.top-bar h1 { font-size: 20px; font-weight: 700; margin: 0; }
.tweet-count { font-size: 13px; color: var(--color-text-secondary); }
.top-bar-actions { margin-left: auto; display: flex; gap: 6px; }
.nav-link, .settings-link { font-size: 18px; text-decoration: none; color: var(--color-text-secondary); padding: 4px 8px; border-radius: var(--radius-sm); }
.nav-link:hover, .settings-link:hover { background: var(--color-bg-secondary); }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; }
.view-toggle-btn { padding: 6px 12px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 13px; color: var(--color-text); cursor: pointer; white-space: nowrap; }
.view-toggle-btn:hover { background: var(--color-bg-secondary); }
.export-btn { padding: 6px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.export-btn:hover:not(:disabled) { background: var(--color-primary-hover); }
.export-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
