import logoUrl from '@/assets/blu-logo.svg'
import type { CategoryShare } from './analytics'
import { formatNumber, formatPercent } from './format'

export interface ShareCardInput {
  periodLabel: string
  totalIn: number
  totalOut: number
  transactionCount: number
  categories: CategoryShare[]
  hideAmounts: boolean
  showCategories: boolean
}

const W = 1080
const H = 1350
const PAD = 88
const INK = '#32221b'
const MUTED = '#7e6c63'
const BLUE = '#653825'
const NAVY = '#3b2217'
const GREEN = '#1d9a6c'
const RED = '#d64545'
const LINE = '#eae5e1'
const MASK = '••••••'

let logoPromise: Promise<HTMLImageElement> | null = null

function loadLogo(): Promise<HTMLImageElement> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('لوگو بارگذاری نشد'))
      img.src = logoUrl
    })
  }
  return logoPromise
}

function font(weight: number, size: number): string {
  return `${weight} ${size}px YekanBakh, sans-serif`
}

export async function renderShareCard(input: ShareCardInput): Promise<HTMLCanvasElement> {
  await Promise.all([document.fonts.load(font(400, 40)), document.fonts.load(font(700, 40)), document.fonts.load(font(900, 40))])
  const logo = await loadLogo()

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas not supported')

  ctx.direction = 'rtl'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = BLUE
  ctx.fillRect(0, 0, W, 14)

  const R = W - PAD

  // brand row
  const logoW = 64
  const logoH = (logoW * 37) / 59
  ctx.drawImage(logo, R - logoW, 90, logoW, logoH)
  ctx.fillStyle = NAVY
  ctx.font = font(900, 40)
  ctx.fillText('استیتمنت استودیو', R - logoW - 24, 128)
  ctx.fillStyle = MUTED
  ctx.font = font(400, 24)
  ctx.fillText('خلاصهٔ صورتحساب', R - logoW - 24, 162)

  // period
  ctx.fillStyle = MUTED
  ctx.font = font(400, 28)
  ctx.fillText(`${input.periodLabel} · ${formatNumber(input.transactionCount)} تراکنش`, R, 300)

  // headline
  const top = input.categories[0]
  ctx.fillStyle = INK
  ctx.font = font(900, 92)
  ctx.fillText('پول من کجا رفت؟', R, 410)
  ctx.fillStyle = MUTED
  ctx.font = font(400, 30)
  let headlineSub = 'در این بازه برداشتی ثبت نشده است.'
  if (top) {
    headlineSub = input.showCategories
      ? `بیشترین برداشت من صرف «${top.label}» شد؛ ${formatPercent(top.share)} از کل برداشت‌ها.`
      : `بیشترین برداشت من صرف «${top.label}» شد.`
  }
  wrapText(ctx, headlineSub, R, 470, W - PAD * 2, 44)

  // totals
  const cardY = 580
  const cardW = (W - PAD * 2 - 24) / 2
  const cardH = 200
  statBlock(ctx, R - cardW, cardY, cardW, cardH, 'کل واریزی', amountText(input, input.totalIn), GREEN)
  statBlock(ctx, R - cardW * 2 - 24, cardY, cardW, cardH, 'کل برداشتی', amountText(input, input.totalOut), RED)

  // category bars
  const barsTop = 870
  ctx.fillStyle = INK
  ctx.font = font(700, 34)
  if (input.showCategories) ctx.fillText('سهم دسته‌ها از برداشت‌ها', R, barsTop)

  if (input.showCategories) input.categories.slice(0, 5).forEach((cat, i) => {
    const y = barsTop + 80 + i * 74
    ctx.fillStyle = INK
    ctx.font = font(400, 28)
    ctx.textAlign = 'right'
    ctx.fillText(cat.label, R, y)

    ctx.fillStyle = NAVY
    ctx.font = font(700, 28)
    ctx.textAlign = 'left'
    ctx.fillText(formatPercent(cat.share), PAD, y)
    ctx.textAlign = 'right'

    ctx.fillStyle = LINE
    ctx.beginPath()
    ctx.roundRect(PAD, y + 16, R - PAD, 12, 6)
    ctx.fill()
    ctx.fillStyle = i === 0 ? BLUE : '#bc8b76'
    ctx.beginPath()
    ctx.roundRect(R - Math.max(12, (R - PAD) * cat.share), y + 16, Math.max(12, (R - PAD) * cat.share), 12, 6)
    ctx.fill()
  })

  // footer
  ctx.fillStyle = MUTED
  ctx.font = font(400, 22)
  ctx.fillText('این پروژه غیررسمی است و وابسته به بلوبانک نیست', R, H - 60)

  return canvas
}

function amountText(input: ShareCardInput, rial: number): string {
  if (input.hideAmounts) return MASK
  return `${formatNumber(Math.round(rial))} ریال`
}

function statBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  color: string,
) {
  ctx.fillStyle = '#faf7f5'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 20)
  ctx.fill()

  ctx.fillStyle = MUTED
  ctx.font = font(400, 26)
  ctx.fillText(label, x + w - 28, y + 60)

  ctx.fillStyle = color
  ctx.font = font(900, 40)
  ctx.fillText(value, x + w - 28, y + 136)
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, cy)
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('تولید تصویر ناموفق بود'))), 'image/png')
  })
}
