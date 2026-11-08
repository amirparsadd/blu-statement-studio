import type { CategoryId } from './categories'

export interface StatementMeta {
  accountHolder?: string
}

export interface Transaction {
  id: number
  date: Date
  dateLabel: string
  timeLabel: string
  balance: number
  withdrawal: number
  deposit: number
  net: number
  type: string
  category: CategoryId
  desc: string
  doc: string
}

export type ParsedTransaction = Omit<Transaction, 'id'>

export interface ParsedStatement {
  meta: StatementMeta
  transactions: ParsedTransaction[]
}
