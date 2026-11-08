<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORIES, normalizeText, CATEGORY_LABELS } from '@/lib/categories'
import { formatNumber, toPersianDigits } from '@/lib/format'
import { useStatementStore } from '@/stores/statement'
import { useUiStore } from '@/stores/ui'
import type { Transaction } from '@/lib/types'

const PAGE_SIZE = 15

const statement = useStatementStore()
const ui = useUiStore()

const filtered = computed<Transaction[]>(() => {
  const q = normalizeText(ui.search.trim())
  return statement.timeline
    .filter((t) => !ui.categoryFilter || t.category === ui.categoryFilter)
    .filter((t) => !q || normalizeText(`${t.desc} ${t.type} ${t.doc}`).includes(q))
    .slice()
    .reverse()
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const page = computed(() => Math.min(ui.page, pageCount.value))
const pageItems = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function goTo(p: number) {
  ui.page = Math.min(Math.max(1, p), pageCount.value)
}

function amount(n: number): string {
  return formatNumber(Math.round(n))
}

function onFilter() {
  ui.page = 1
}
</script>

<template>
  <section class="card overflow-hidden p-0!">
    <div class="flex flex-wrap items-center gap-3 border-b border-line p-4">
      <input
        v-model="ui.search"
        type="text"
        placeholder="جستجو در شرح یا شماره سند"
        class="field min-w-56 flex-1"
        @input="onFilter"
      />
      <select v-model="ui.categoryFilter" class="field" @change="onFilter">
        <option value="">همه‌ی دسته‌ها</option>
        <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.label }}</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-[13px]">
        <thead>
          <tr class="bg-page text-[12px] text-muted">
            <th class="px-4 py-2.5 text-right font-semibold whitespace-nowrap">تاریخ</th>
            <th class="px-4 py-2.5 text-right font-semibold">شرح</th>
            <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">برداشت</th>
            <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">واریز</th>
            <th class="px-4 py-2.5 text-left font-semibold whitespace-nowrap">مانده</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in pageItems" :key="t.id" class="border-t border-line align-top">
            <td class="px-4 py-3 whitespace-nowrap text-muted">
              <div dir="ltr" class="text-right">{{ toPersianDigits(t.dateLabel) }}</div>
              <div class="text-[11.5px]">{{ toPersianDigits(t.timeLabel) }}</div>
            </td>
            <td class="max-w-80 px-4 py-3 leading-relaxed">
              <div class="text-ink">{{ t.desc || t.type }}</div>
              <div class="mt-0.5 text-[11.5px] text-muted">{{ CATEGORY_LABELS[t.category] }}</div>
            </td>
            <td class="px-4 py-3 text-left whitespace-nowrap text-expense">
              <span v-if="t.withdrawal > 0">{{ amount(t.withdrawal) }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="px-4 py-3 text-left whitespace-nowrap text-income">
              <span v-if="t.deposit > 0">{{ amount(t.deposit) }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="px-4 py-3 text-left whitespace-nowrap text-ink">{{ amount(t.balance) }}</td>
          </tr>
          <tr v-if="!pageItems.length">
            <td colspan="5" class="px-4 py-10 text-center text-muted">تراکنشی مطابق جستجو پیدا نشد.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between border-t border-line px-4 py-3 text-[13px] text-muted">
      <span>{{ formatNumber(filtered.length) }} تراکنش</span>
      <div class="flex items-center gap-2">
        <button type="button" class="btn-ghost" :disabled="page === 1" @click="goTo(page - 1)">قبلی</button>
        <span class="min-w-24 text-center">صفحه {{ toPersianDigits(String(page)) }} از {{ toPersianDigits(String(pageCount)) }}</span>
        <button type="button" class="btn-ghost" :disabled="page === pageCount" @click="goTo(page + 1)">بعدی</button>
      </div>
    </div>
  </section>
</template>
