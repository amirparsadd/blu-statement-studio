import { categorize } from './categories'
import { formatJalaliDate, formatTime, jalaliToGregorian } from './jalali'
import type { ParsedStatement, ParsedTransaction, StatementMeta } from './types'

type Row = unknown[]

const DATE_RE = /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/

function cellText(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function toNumber(v: unknown): number {
  if (typeof v === 'number') return v
  const n = Number(cellText(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

function readMeta(rows: Row[]): StatementMeta {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    for (const cell of rows[r] ?? []) {
      const txt = cellText(cell)
      if (txt.startsWith('نام صاحب حساب')) {
        return { accountHolder: txt.split(':').slice(1).join(':').trim() }
      }
    }
  }
  return {}
}

interface ColumnMap {
  date: number
  desc: number
  balance: number
  withdrawal: number
  deposit: number
  type: number
  doc: number
}

function findHeader(rows: Row[]): { index: number; cols: ColumnMap } {
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const row = rows[r] ?? []
    const found: Partial<Record<keyof ColumnMap, number>> = {}
    row.forEach((cell, c) => {
      const t = cellText(cell)
      if (t === 'تاریخ') found.date = c
      else if (t === 'مانده (ریال)' || (t.startsWith('مانده') && t.includes('('))) found.balance = c
      else if (t === 'برداشت (ریال)') found.withdrawal = c
      else if (t === 'واریز (ریال)') found.deposit = c
      else if (t === 'نوع تراکنش') found.type = c
      else if (t === 'شرح سند') found.desc = c
      else if (t === 'شماره سند') found.doc = c
    })
    if (found.date !== undefined && found.desc !== undefined && found.balance !== undefined) {
      return {
        index: r,
        cols: {
          date: found.date,
          desc: found.desc,
          balance: found.balance,
          withdrawal: found.withdrawal ?? -1,
          deposit: found.deposit ?? -1,
          type: found.type ?? -1,
          doc: found.doc ?? -1,
        },
      }
    }
  }
  throw new Error('ردیف عنوان جدول تراکنش‌ها پیدا نشد.')
}

/**
 * Parses a Blu statement sheet (rows as arrays). The file lists rows newest-first;
 * the returned transactions are chronological.
 */
export function parseBluStatement(rows: Row[]): ParsedStatement {
  const meta = readMeta(rows)
  const header = findHeader(rows)
  const cell = (row: Row, idx: number) => (idx >= 0 ? row[idx] : undefined)

  const transactions: ParsedTransaction[] = []
  for (let r = header.index + 1; r < rows.length; r++) {
    const row = rows[r] ?? []
    const m = cellText(row[header.cols.date]).match(DATE_RE)
    if (!m) continue

    const [jy, jm, jd, hh, mi, ss] = m.slice(1).map(Number)
    const date = jalaliToGregorian(jy, jm, jd)
    date.setHours(hh, mi, ss, 0)

    const type = cellText(cell(row, header.cols.type)) || 'نامشخص'
    const desc = cellText(cell(row, header.cols.desc))
    const withdrawal = toNumber(cell(row, header.cols.withdrawal))
    const deposit = toNumber(cell(row, header.cols.deposit))

    transactions.push({
      date,
      dateLabel: formatJalaliDate(date),
      timeLabel: formatTime(date),
      balance: toNumber(row[header.cols.balance]),
      withdrawal,
      deposit,
      net: deposit - withdrawal,
      type,
      category: categorize(type, desc),
      desc,
      doc: cellText(cell(row, header.cols.doc)),
    })
  }

  if (transactions.length === 0) {
    throw new Error('هیچ ردیف تراکنشی در این فایل پیدا نشد. مطمئن شوید فایل خروجی بلو بدون تغییر باشد.')
  }

  // Flip to oldest-first, then stable-sort so rows sharing a timestamp stay in running-balance order.
  transactions.reverse()
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

  return { meta, transactions }
}
