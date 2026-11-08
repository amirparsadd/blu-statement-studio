<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart } from 'chart.js'
import { categoryBreakdown } from '@/lib/analytics'
import { CATEGORY_PALETTE, tooltipDefaults } from '@/lib/chartSetup'
import { formatNumber, formatPercent } from '@/lib/format'
import { useStatementStore } from '@/stores/statement'

const statement = useStatementStore()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const shares = computed(() => categoryBreakdown(statement.transactions))

const legend = computed(() => shares.value.map((s, i) => ({ ...s, color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] })))

function build() {
  if (!canvas.value) return
  chart?.destroy()
  chart = new Chart<'doughnut'>(canvas.value, {
    type: 'doughnut',
    data: {
      labels: shares.value.map((s) => s.label),
      datasets: [
        {
          data: shares.value.map((s) => Math.round(s.amount)),
          backgroundColor: legend.value.map((s) => s.color),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipDefaults,
          callbacks: { label: (c) => `${formatNumber(c.parsed)} ریال` },
        },
      },
    },
  })
}

onMounted(build)
watch(shares, build)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="card">
    <div class="mb-4">
      <div class="text-[15px] font-bold text-navy">برداشت‌ها بر اساس دسته</div>
      <div class="mt-0.5 text-[12px] text-muted">سهم هر دسته از کل برداشت‌ها</div>
    </div>
    <div class="relative h-52"><canvas ref="canvas" /></div>

    <div class="mt-4 space-y-2">
      <div v-for="row in legend" :key="row.id" class="flex items-center justify-between text-[13px]">
        <span class="flex items-center gap-2 text-ink">
          <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: row.color }" />
          {{ row.label }}
        </span>
        <span class="font-semibold text-navy">{{ formatPercent(row.share) }}</span>
      </div>
      <div v-if="!legend.length" class="text-[13px] text-muted">برداشتی ثبت نشده است.</div>
    </div>
  </div>
</template>
