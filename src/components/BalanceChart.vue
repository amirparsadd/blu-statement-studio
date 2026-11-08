<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart } from 'chart.js'
import { CHART_COLORS, tooltipDefaults } from '@/lib/chartSetup'
import { formatNumber, toPersianDigits } from '@/lib/format'
import { useStatementStore } from '@/stores/statement'

const statement = useStatementStore()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const series = computed(() => ({
  labels: statement.timeline.map((t) => toPersianDigits(t.dateLabel)),
  values: statement.timeline.map((t) => t.balance),
}))

function build() {
  if (!canvas.value || !series.value.values.length) return
  chart?.destroy()
  chart = new Chart<'line'>(canvas.value, {
    type: 'line',
    data: {
      labels: series.value.labels,
      datasets: [
        {
          data: series.value.values,
          borderColor: CHART_COLORS.blue,
          backgroundColor: 'rgba(78,145,230,0.08)',
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipDefaults,
          callbacks: { label: (c) => `${formatNumber(Math.round(c.parsed.y ?? 0))} ریال` },
        },
      },
      scales: {
        x: { display: false },
        y: {
          grid: { color: CHART_COLORS.grid },
          ticks: { font: { size: 11 }, callback: (v) => formatNumber(Number(v)) },
        },
      },
    },
  })
}

onMounted(build)
watch(series, build)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="card">
    <div class="mb-4">
      <div class="text-[15px] font-bold text-navy">مانده در طول زمان</div>
      <div class="mt-0.5 text-[12px] text-muted">مانده بعد از هر تراکنش</div>
    </div>
    <div class="relative h-72"><canvas ref="canvas" /></div>
  </div>
</template>
