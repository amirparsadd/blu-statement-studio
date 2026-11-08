import { parseBluStatement } from './parser'
import type { ParsedStatement } from './types'

export async function readStatementFile(file: File): Promise<ParsedStatement> {
  const XLSX = await import('xlsx')
  const data = new Uint8Array(await file.arrayBuffer())
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new Error('فایل هیچ شیتی ندارد.')
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: true })
  return parseBluStatement(rows)
}
