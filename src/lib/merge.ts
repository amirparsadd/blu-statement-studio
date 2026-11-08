import type { ParsedTransaction, Transaction } from './types'

function rowKey(t: ParsedTransaction): string {
  return [t.doc, t.date.getTime(), t.type, t.desc, t.withdrawal, t.deposit, t.balance].join('|')
}

/**
 * Merges newly parsed rows into the existing timeline. Rows already present (for example
 * the overlap between two yearly exports) are skipped, so re-uploading a file is harmless.
 */
export function mergeTransactions(existing: Transaction[], incoming: ParsedTransaction[]): Transaction[] {
  const known = new Set(existing.map(rowKey))
  const fresh = incoming.filter((t) => {
    const key = rowKey(t)
    if (known.has(key)) return false
    known.add(key)
    return true
  })

  const combined: ParsedTransaction[] = [...existing, ...fresh]
  combined.sort((a, b) => a.date.getTime() - b.date.getTime())

  return combined.map((t, id) => ({ ...t, id }))
}
