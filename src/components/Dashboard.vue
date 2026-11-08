<script setup lang="ts">
import { computed, ref } from 'vue'
import BalanceChart from '@/components/BalanceChart.vue'
import BalanceInput from '@/components/BalanceInput.vue'
import CategoryChart from '@/components/CategoryChart.vue'
import ShareDialog from '@/components/ShareDialog.vue'
import StatCards from '@/components/StatCards.vue'
import TransactionsTable from '@/components/TransactionsTable.vue'
import { useStatementLoader } from '@/composables/useStatementLoader'
import { buildCsv, downloadBlob } from '@/lib/csv'
import { useStatementStore } from '@/stores/statement'
import { useUiStore } from '@/stores/ui'

const statement = useStatementStore()
const ui = useUiStore()
const { loading, error, load } = useStatementLoader()
const showShare = ref(false)

const sourcesText = computed(() => statement.sources.join('، '))

function onAddFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) load(input.files)
  input.value = ''
}

function exportCsv() {
  const blob = new Blob([buildCsv(statement.timeline)], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `blu-statement-${new Date().toISOString().slice(0, 10)}.csv`)
}

function reset() {
  if (!window.confirm('همه‌ی فایل‌ها و موجودی واردشده پاک شوند؟')) return
  statement.reset()
  ui.resetTable()
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-[18px] font-bold text-navy">{{ statement.holder || 'حساب بلو' }}</div>
        <div class="text-[12px] text-muted">{{ sourcesText }}</div>
      </div>
      <div class="flex flex-wrap gap-2">
        <label class="btn-ghost cursor-pointer">
          افزودن فایل
          <input type="file" accept=".xlsx,.xls" multiple class="hidden" @change="onAddFile" />
        </label>
        <button type="button" class="btn-ghost" @click="exportCsv">دانلود CSV</button>
        <button type="button" class="btn" @click="showShare = true">کارت اشتراک‌گذاری</button>
        <button type="button" class="btn-ghost text-expense hover:text-expense" @click="reset">پاک‌کردن</button>
      </div>
    </div>

    <div v-if="loading" class="text-[13px] text-muted">در حال خواندن فایل…</div>
    <div v-if="error" class="rounded-lg border border-expense/30 bg-[#fdf2f2] px-4 py-3 text-[13px] whitespace-pre-line text-expense">
      {{ error }}
    </div>

    <BalanceInput />
    <StatCards />

    <div class="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <BalanceChart />
      <CategoryChart />
    </div>

    <TransactionsTable />

    <ShareDialog v-if="showShare" @close="showShare = false" />
  </div>
</template>
