<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { categoryBreakdown, totals } from '@/lib/analytics'
import { downloadBlob } from '@/lib/csv'
import { toPersianDigits } from '@/lib/format'
import { canvasToBlob, renderShareCard } from '@/lib/shareCard'
import { useStatementStore } from '@/stores/statement'

const emit = defineEmits<{ close: [] }>()

const statement = useStatementStore()

const hideAmounts = ref(true)
const hideCategories = ref(false)
const previewUrl = ref('')
const error = ref('')
let blob: Blob | null = null

const periodLabel = computed(() => {
  const first = statement.transactions[0]
  const last = statement.transactions[statement.transactions.length - 1]
  if (!first || !last) return ''
  return `از ${toPersianDigits(first.dateLabel)} تا ${toPersianDigits(last.dateLabel)}`
})

async function render() {
  error.value = ''
  try {
    const sums = totals(statement.transactions)
    const canvas = await renderShareCard({
      periodLabel: periodLabel.value,
      totalIn: sums.in,
      totalOut: sums.out,
      transactionCount: statement.transactions.length,
      categories: categoryBreakdown(statement.transactions),
      hideAmounts: hideAmounts.value,
      showCategories: !hideCategories.value,
    })
    blob = await canvasToBlob(canvas)
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'ساخت تصویر ناموفق بود.'
  }
}

const fileName = () => `blu-summary-${new Date().toISOString().slice(0, 10)}.png`

async function share() {
  if (!blob) return
  const file = new File([blob], fileName(), { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'خلاصه صورتحساب' })
    } catch {
      // dismissed
    }
    return
  }
  download()
}

function download() {
  if (blob) downloadBlob(blob, fileName())
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch([hideAmounts, hideCategories], render)
onMounted(() => {
  render()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" @click.self="emit('close')">
    <div class="card w-full max-w-sm">
      <div class="mb-4 flex items-center justify-between">
        <div class="text-[15px] font-bold text-navy">کارت اشتراک‌گذاری</div>
        <button type="button" class="text-[18px] leading-none text-muted hover:text-ink" aria-label="بستن" @click="emit('close')">×</button>
      </div>

      <div class="overflow-hidden rounded-lg border border-line">
        <img v-if="previewUrl" :src="previewUrl" alt="پیش‌نمایش کارت" class="block w-full" />
        <div v-else class="flex aspect-4/5 items-center justify-center text-[13px] text-muted">در حال ساخت تصویر…</div>
      </div>

      <div class="mt-4 space-y-2.5">
        <label class="flex cursor-pointer items-center justify-between text-[13px] text-ink">
          مبالغ روی کارت پنهان باشد
          <input v-model="hideAmounts" type="checkbox" class="h-4 w-4 accent-blu" />
        </label>
        <label class="flex cursor-pointer items-center justify-between text-[13px] text-ink">
          بخش درصد دسته‌ها را نشان نده
          <input v-model="hideCategories" type="checkbox" class="h-4 w-4 accent-blu" />
        </label>
      </div>

      <p v-if="error" class="mt-3 text-[12.5px] text-expense">{{ error }}</p>

      <div class="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" class="btn justify-center" :disabled="!blob" @click="share">اشتراک‌گذاری</button>
        <button type="button" class="btn-ghost justify-center" :disabled="!blob" @click="download">دانلود PNG</button>
      </div>
    </div>
  </div>
</template>
