<script setup lang="ts">
import { computed } from 'vue'
import { totals } from '@/lib/analytics'
import { formatNumber, formatRial, toPersianDigits } from '@/lib/format'
import { useStatementStore } from '@/stores/statement'

const statement = useStatementStore()

const sums = computed(() => totals(statement.transactions))

const cards = computed(() => {
  const txs = statement.transactions
  const first = txs[0]
  const last = txs[txs.length - 1]
  return [
    {
      label: 'موجودی فعلی',
      value: formatRial(statement.currentBalance),
      tone: 'text-navy',
    },
    {
      label: 'کل واریزی',
      value: formatRial(sums.value.in, { sign: true }),
      tone: 'text-income',
    },
    {
      label: 'کل برداشتی',
      value: formatRial(-sums.value.out),
      tone: 'text-expense',
    },
    {
      label: 'بازه‌ی صورتحساب',
      value: first && last ? `${toPersianDigits(first.dateLabel)} تا ${toPersianDigits(last.dateLabel)}` : '—',
      tone: 'text-ink text-[15px]',
      sub: `${formatNumber(txs.length)} تراکنش`,
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div v-for="card in cards" :key="card.label" class="card">
      <div class="text-[12.5px] text-muted">{{ card.label }}</div>
      <div class="mt-2 text-[19px] font-bold" :class="card.tone">{{ card.value }}</div>
      <div v-if="card.sub" class="mt-1 text-[12px] text-muted">{{ card.sub }}</div>
    </div>
  </div>
</template>
