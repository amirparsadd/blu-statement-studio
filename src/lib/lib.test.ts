import { describe, expect, it } from 'vitest'
import { categoryBreakdown, totals } from './analytics'
import { categorize } from './categories'
import { gregorianToJalali, jalaliToGregorian } from './jalali'
import { mergeTransactions } from './merge'
import { parseBluStatement } from './parser'
import { parseAmountInput } from './format'
import type { ParsedStatement, Transaction } from './types'

const HEADER = ['ردیف', 'تاریخ', 'شماره سند', 'نوع تراکنش', 'شرح سند', 'برداشت (ریال)', 'واریز (ریال)', 'مانده (ریال)']

// Rows are newest-first, like Blu's export. Running balances are consistent with the amounts.
function sheet(rowsNewestFirst: unknown[][]): unknown[][] {
  return [['نام صاحب حساب: علی رضایی'], ['مانده از قبل: 1,000 (ریال)'], [], HEADER, ...rowsNewestFirst]
}

const sample = sheet([
  [3, '1404/01/10 12:00:00', 'D3', 'خرید', 'خرید از فروشگاه کافه نیلوفر', 300, null, 1000],
  [2, '1404/01/05 09:30:00', 'D2', 'انتقال', 'واریز پایا از بانک دیگر', null, 500, 1300],
  [1, '1404/01/01 08:00:00', 'D1', 'برداشت', 'برداشت از خودپرداز', 200, null, 800],
])

function load(rows: unknown[][]): Transaction[] {
  return mergeTransactions([], parseBluStatement(rows).transactions)
}

describe('jalali', () => {
  it('converts Nowruz 1403 and 1404', () => {
    const n1403 = jalaliToGregorian(1403, 1, 1)
    expect([n1403.getFullYear(), n1403.getMonth() + 1, n1403.getDate()]).toEqual([2024, 3, 20])
    const n1404 = jalaliToGregorian(1404, 1, 1)
    expect([n1404.getFullYear(), n1404.getMonth() + 1, n1404.getDate()]).toEqual([2025, 3, 21])
  })

  it('round-trips a date', () => {
    expect(gregorianToJalali(new Date(2026, 10, 8))).toEqual({ jy: 1405, jm: 8, jd: 17 })
  })
})

describe('parseBluStatement', () => {
  it('reads the holder, orders rows chronologically and categorises them', () => {
    const parsed: ParsedStatement = parseBluStatement(sample)
    expect(parsed.meta.accountHolder).toBe('علی رضایی')
    expect(parsed.transactions.map((t) => t.doc)).toEqual(['D1', 'D2', 'D3'])
    expect(parsed.transactions[0].dateLabel).toBe('1404/01/01')
    expect(parsed.transactions[1].net).toBe(500)
    expect(parsed.transactions.map((t) => t.category)).toEqual(['cash', 'transfer', 'shopping'])
  })

  it('throws a Persian message when no header is found', () => {
    expect(() => parseBluStatement([['hello']])).toThrow()
  })
})

describe('mergeTransactions', () => {
  it('skips rows that already exist, so overlapping exports do not double count', () => {
    const first = load(sample)
    const overlap = parseBluStatement(
      sheet([
        [4, '1404/01/20 10:00:00', 'D4', 'انتقال', 'انتقال کارت به کارت', null, 100, 1100],
        [3, '1404/01/10 12:00:00', 'D3', 'خرید', 'خرید از فروشگاه کافه نیلوفر', 300, null, 1000],
      ]),
    ).transactions

    const merged = mergeTransactions(first, overlap)
    expect(merged).toHaveLength(4)
    expect(merged.map((t) => t.id)).toEqual([0, 1, 2, 3])
    expect(merged[3].doc).toBe('D4')
  })
})

describe('totals and categories', () => {
  it('sums credits and debits', () => {
    const t = totals(load(sample))
    expect(t).toEqual({ in: 500, out: 500 })
  })

  it('breaks withdrawals down by category, largest first', () => {
    const shares = categoryBreakdown(load(sample))
    expect(shares.map((s) => s.id)).toEqual(['shopping', 'cash'])
    expect(shares[0].share + shares[1].share).toBeCloseTo(1)
  })

  it('treats purchases as shopping even when the description names another category', () => {
    expect(categorize('خرید', 'خرید از فروشگاه کافه نیلوفر')).toBe('shopping')
    expect(categorize('نامشخص', 'خرید از اسنپ مارکت')).toBe('shopping')
    expect(categorize('برداشت', 'برداشت از خودپرداز')).toBe('cash')
  })

  it('categorises by keyword, normalising Arabic letters', () => {
    expect(categorize('نامشخص', 'پرداخت قبض برق')).toBe('bills')
    expect(categorize('نامشخص', 'ناشناخته')).toBe('other')
  })
})

describe('parseAmountInput', () => {
  it('reads Persian digits and separators', () => {
    expect(parseAmountInput('۳۵۳٬۳۶۱٬۲۵۳')).toBe(353361253)
    expect(parseAmountInput('1,000')).toBe(1000)
    expect(parseAmountInput('abc')).toBeNull()
  })
})
