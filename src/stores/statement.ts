import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { mergeTransactions } from '@/lib/merge'
import type { ParsedStatement, Transaction } from '@/lib/types'

export const useStatementStore = defineStore('statement', () => {
  const sources = ref<string[]>([])
  const transactions = shallowRef<Transaction[]>([])
  const holder = ref('')
  /** Current balance typed by the user, in rial. */
  const balance = ref<number | null>(null)

  const hasData = computed(() => transactions.value.length > 0)

  /**
   * Difference between the typed balance and the statement's last balance.
   * Treated as the balance carried in from before the exported year, so it is added to every row.
   */
  const offset = computed(() => {
    const last = transactions.value[transactions.value.length - 1]
    return balance.value !== null && last ? balance.value - last.balance : 0
  })

  const timeline = computed<Transaction[]>(() =>
    offset.value === 0
      ? transactions.value
      : transactions.value.map((t) => ({ ...t, balance: t.balance + offset.value })),
  )

  const currentBalance = computed(() => {
    if (balance.value !== null) return balance.value
    return transactions.value[transactions.value.length - 1]?.balance ?? 0
  })

  function addStatement(name: string, parsed: ParsedStatement) {
    transactions.value = mergeTransactions(transactions.value, parsed.transactions)
    sources.value = [...sources.value, name]
    if (!holder.value && parsed.meta.accountHolder) holder.value = parsed.meta.accountHolder
  }

  function setBalance(amount: number | null) {
    balance.value = amount
  }

  function reset() {
    sources.value = []
    transactions.value = []
    holder.value = ''
    balance.value = null
  }

  return {
    sources,
    transactions,
    timeline,
    holder,
    balance,
    hasData,
    currentBalance,
    addStatement,
    setBalance,
    reset,
  }
})
