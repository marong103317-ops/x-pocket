// Pinia store for tags
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Tag } from '@/shared/types/tag'
import { getAllTags, createTag, deleteTag } from '@/shared/storage/tagStore'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Record<string, Tag>>({})
  const loading = ref(false)

  const tagList = computed(() => Object.values(tags.value))

  async function load(): Promise<void> {
    loading.value = true
    try {
      const stored = await getAllTags()
      const map: Record<string, Tag> = {}
      for (const t of stored) {
        map[t.id] = t
      }
      tags.value = map
    } finally {
      loading.value = false
    }
  }

  async function add(name: string, color: string = '#1d9bf0'): Promise<Tag> {
    const tag = await createTag(name, color)
    tags.value[tag.id] = tag
    return tag
  }

  async function remove(id: string): Promise<void> {
    await deleteTag(id)
    delete tags.value[id]
  }

  return { tags, tagList, loading, load, add, remove }
})
