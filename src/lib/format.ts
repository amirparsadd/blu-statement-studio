/** Swaps Latin digits in a plain string (dates, percentages) for Persian digits. */
export function toPersianDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => String.fromCharCode(0x06f0 + Number(d)))
}

/** Persian digits with the Persian thousands separator (٬). */
export function formatNumber(n: number): string {
  return toPersianDigits(n.toLocaleString('en-US')).replace(/,/g, '٬')
}

export function formatPercent(share: number): string {
  return toPersianDigits(`${Math.round(share * 100)}%`)
}

export function formatRial(amount: number, opts: { sign?: boolean } = {}): string {
  const sign = amount < 0 ? '−' : opts.sign && amount > 0 ? '+' : ''
  return `${sign}${formatNumber(Math.abs(Math.round(amount)))} ریال`
}

/** Reads a user-typed amount. Accepts Persian and Arabic digits and thousands separators. */
export function parseAmountInput(raw: string): number | null {
  const latin = raw
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[,٬،\s]/g, '')
  if (!/^-?\d+$/.test(latin)) return null
  return Number(latin)
}
