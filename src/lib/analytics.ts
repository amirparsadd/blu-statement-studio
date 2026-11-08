import { CATEGORY_LABELS, type CategoryId } from './categories'
import type { Transaction } from './types'

export function totals(txs: Transaction[]) {
  let inSum = 0
  let outSum = 0
  for (const t of txs) {
    inSum += t.deposit
    outSum += t.withdrawal
  }
  return { in: inSum, out: outSum }
}

export interface CategoryShare {
  id: CategoryId
  label: string
  amount: number
  share: number
}

export function categoryBreakdown(txs: Transaction[]): CategoryShare[] {
  const sums = new Map<CategoryId, number>()
  let total = 0
  for (const t of txs) {
    if (t.withdrawal <= 0) continue
    sums.set(t.category, (sums.get(t.category) ?? 0) + t.withdrawal)
    total += t.withdrawal
  }
  return [...sums.entries()]
    .map(([id, amount]) => ({ id, label: CATEGORY_LABELS[id], amount, share: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount)
}
