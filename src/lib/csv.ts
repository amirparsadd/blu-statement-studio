import { CATEGORY_LABELS } from './categories'
import type { Transaction } from './types'

const HEADERS = ['تاریخ', 'ساعت', 'نوع تراکنش', 'دسته‌بندی', 'شرح سند', 'برداشت (ریال)', 'واریز (ریال)', 'مانده (ریال)', 'شماره سند']

function escapeCell(value: string | number): string {
  const s = String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Builds a UTF-8 CSV (with BOM so Excel reads Persian correctly). Amounts stay in rial. */
export function buildCsv(txs: Transaction[]): string {
  const lines = [HEADERS.map(escapeCell).join(',')]
  for (const t of txs) {
    lines.push(
      [
        t.dateLabel,
        t.timeLabel,
        t.type,
        CATEGORY_LABELS[t.category],
        t.desc,
        t.withdrawal,
        t.deposit,
        t.balance,
        t.doc,
      ]
        .map(escapeCell)
        .join(','),
    )
  }
  return '\uFEFF' + lines.join('\r\n')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
