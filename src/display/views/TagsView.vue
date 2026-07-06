<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTagsStore } from '@/display/stores/tags'

const router = useRouter()
const tagsStore = useTagsStore()
const newName = ref('')
const newColor = ref('#1d9bf0')

onMounted(async () => {
  await tagsStore.load()
})

async function handleCreate() {
  const name = newName.value.trim()
  if (!name) return
  await tagsStore.add(name, newColor.value)
  newName.value = ''
}

async function handleDelete(id: string) {
  await tagsStore.remove(id)
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="tags-view">
    <header class="tags-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1>标签管理</h1>
    </header>

    <div class="create-tag">
      <input
        v-model="newName"
        type="text"
        placeholder="输入标签名..."
        class="create-input"
        @keyup.enter="handleCreate"
      />
      <input v-model="newColor" type="color" class="color-picker" />
      <button class="create-btn" @click="handleCreate">创建</button>
    </div>

    <div v-if="tagsStore.tagList.length === 0" class="no-tags">
      还没有标签，创建一个吧。
    </div>

    <div v-else class="tag-list">
      <div v-for="tag in tagsStore.tagList" :key="tag.id" class="tag-row">
        <span class="tag-color-dot" :style="{ background: tag.color }" />
        <span class="tag-name">{{ tag.name }}</span>
        <button class="tag-delete" @click="handleDelete(tag.id)">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tags-view { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
.tags-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.tags-header h1 { font-size: 18px; margin: 0; }
.back-btn { background: none; border: none; font-size: 16px; color: var(--color-primary); cursor: pointer; }

.create-tag { display: flex; gap: 8px; margin-bottom: 20px; align-items: center; }
.create-input { flex: 1; padding: 6px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 13px; outline: none; }
.create-input:focus { border-color: var(--color-primary); }
.color-picker { width: 32px; height: 32px; border: none; cursor: pointer; padding: 0; border-radius: 50%; }
.create-btn { padding: 6px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; cursor: pointer; }

.no-tags { text-align: center; padding: 40px; color: var(--color-text-tertiary); font-size: 13px; }

.tag-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.tag-color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.tag-name { flex: 1; font-size: 14px; color: var(--color-text); }
.tag-delete { padding: 4px 10px; background: none; border: 1px solid var(--color-danger); border-radius: var(--radius-full); font-size: 12px; color: var(--color-danger); cursor: pointer; }
</style>
