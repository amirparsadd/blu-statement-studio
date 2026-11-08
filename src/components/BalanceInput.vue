<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatNumber, parseAmountInput } from '@/lib/format'
import { useStatementStore } from '@/stores/statement'

const statement = useStatementStore()
const text = ref('')
const error = ref('')

watch(
  () => statement.balance,
  (value) => {
    text.value = value === null ? '' : formatNumber(value)
  },
  { immediate: true },
)

function save() {
  const n = parseAmountInput(text.value)
  if (n === null || n < 0) {
    error.value = 'یک عدد معتبر به ریال وارد کنید.'
    return
  }
  error.value = ''
  statement.setBalance(n)
}

function clear() {
  statement.setBalance(null)
}
</script>

<template>
  <form class="card flex flex-wrap items-end gap-3" @submit.prevent="save">
    <label class="flex min-w-60 flex-1 flex-col gap-1.5 text-[12.5px] text-muted">
      موجودی فعلی حساب (ریال)
      <input v-model="text" type="text" inputmode="numeric" placeholder="مثلاً ۳۵۳٬۳۶۱٬۲۵۳" class="field" />
    </label>
    <button type="submit" class="btn">ثبت</button>
    <button v-if="statement.balance !== null" type="button" class="btn-ghost" @click="clear">حذف</button>
    <p v-if="error" class="w-full text-[12.5px] text-expense">{{ error }}</p>
  </form>
</template>
