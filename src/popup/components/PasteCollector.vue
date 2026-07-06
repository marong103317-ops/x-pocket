<script setup lang="ts">
import { ref, watch } from 'vue'
import { parseBlockquote } from '@/shared/parser/blockquoteParser'
import { addTweet } from '@/shared/storage/tweetStore'
import { generateId } from '@/shared/utils/id'
import type { ParsedTweet } from '@/shared/types/tweet'

const emit = defineEmits<{
  collected: []
}>()

const html = ref('')
const parsed = ref<ParsedTweet | null>(null)
const error = ref('')
const loading = ref(false)
const successMsg = ref('')

// Auto-parse on paste/change with debounce
let parseTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  successMsg.value = ''
  error.value = ''

  if (!html.value.trim()) {
    parsed.value = null
    return
  }

  if (parseTimer) clearTimeout(parseTimer)
  parseTimer = setTimeout(() => {
    try {
      const result = parseBlockquote(html.value)
      if (result) {
        parsed.value = result
        error.value = ''
      } else {
        parsed.value = null
        error.value = '无法解析，请检查是否为 twitter-tweet 格式'
      }
    } catch {
      parsed.value = null
      error.value = '无法解析，请检查是否为 twitter-tweet 格式'
    }
  }, 300)
}

async function handleCollect() {
  if (!parsed.value) return

  loading.value = true
  try {
    const tweet = {
      id: generateId(),
      ...parsed.value,
      tags: [],
      collectedAt: new Date().toISOString(),
      source: 'manual' as const,
    }

    const result = await addTweet(tweet)

    if (result.success) {
      successMsg.value = '✓ 已收藏'
      html.value = ''
      parsed.value = null
      emit('collected')
      setTimeout(() => { successMsg.value = '' }, 2000)
    } else if (result.duplicate) {
      error.value = '该推文已收藏过'
    } else {
      error.value = '收藏失败，请重试'
    }
  } catch {
    error.value = '收藏失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="paste-collector">
    <textarea
      v-model="html"
      class="paste-input"
      placeholder="粘贴推文嵌入代码..."
      rows="3"
      @input="onInput"
    />

    <!-- Success message -->
    <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

    <!-- Error message -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Parsed preview -->
    <div v-if="parsed && !successMsg" class="preview-card">
      <div class="preview-header">
        <span class="preview-author">{{ parsed.author }}</span>
        <span class="preview-handle">@{{ parsed.handle }}</span>
      </div>
      <div class="preview-body">{{ parsed.contentText }}</div>
      <div class="preview-footer">
        <span class="preview-date">{{ parsed.postedAt.slice(0, 10) }}</span>
        <span v-if="parsed.mediaUrls.length" class="preview-media">
          📷 {{ parsed.mediaUrls.length }} 张媒体
        </span>
      </div>
    </div>

    <!-- Collect button -->
    <button
      v-if="parsed && !successMsg"
      class="collect-btn"
      :disabled="loading"
      @click="handleCollect"
    >
      {{ loading ? '收藏中...' : '收藏' }}
    </button>
  </div>
</template>

<style scoped>
.paste-collector {
  margin-bottom: 12px;
}

.paste-input {
  width: 100%;
  min-height: 72px;
  max-height: 140px;
  padding: 8px 12px;
  border: 1px solid #cfd9de;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}

.paste-input:focus {
  border-color: #1d9bf0;
}

.paste-input::placeholder {
  color: #7c8b98;
}

.success-msg {
  margin-top: 8px;
  padding: 6px 12px;
  background: #e8f5e8;
  color: #00ba7c;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.error-msg {
  margin-top: 8px;
  padding: 6px 12px;
  background: #fde8e8;
  color: #f4212e;
  border-radius: 8px;
  font-size: 13px;
}

.preview-card {
  margin-top: 8px;
  padding: 12px;
  background: #f7f9f9;
  border: 1px solid #cfd9de;
  border-radius: 8px;
}

.preview-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.preview-author {
  font-weight: 700;
  font-size: 14px;
  color: #0f1419;
}

.preview-handle {
  font-size: 12px;
  color: #536471;
}

.preview-body {
  font-size: 13px;
  line-height: 1.5;
  color: #0f1419;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-footer {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #536471;
}

.collect-btn {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px 0;
  background: #1d9bf0;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.collect-btn:hover:not(:disabled) {
  background: #1a8cd8;
}

.collect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
