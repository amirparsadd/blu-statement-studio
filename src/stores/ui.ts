import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CategoryId } from '@/lib/categories'

export const useUiStore = defineStore('ui', () => {
  const search = ref('')
  const categoryFilter = ref<CategoryId | ''>('')
  const page = ref(1)

  function resetTable() {
    search.value = ''
    categoryFilter.value = ''
    page.value = 1
  }

  return { search, categoryFilter, page, resetTable }
})
