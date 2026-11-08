// Keyword-based categories. Blu's raw "نوع تراکنش" is too coarse, so each row is also
// matched against its description. Rules are checked in order; the first match wins.
// Extend the keyword lists as you see real statements.

export type CategoryId =
  | 'shopping'
  | 'food'
  | 'transport'
  | 'bills'
  | 'cash'
  | 'transfer'
  | 'salary'
  | 'interest'
  | 'fees'
  | 'other'

export interface CategoryDef {
  id: CategoryId
  label: string
  keywords: string[]
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'salary', label: 'حقوق و درآمد', keywords: ['حقوق', 'درآمد', 'دستمزد'] },
  { id: 'interest', label: 'سود', keywords: ['سود', 'بهره'] },
  { id: 'fees', label: 'کارمزد', keywords: ['کارمزد', 'مالیات'] },
  { id: 'cash', label: 'برداشت نقدی', keywords: ['خودپرداز', 'برداشت نقد', 'atm'] },
  { id: 'bills', label: 'قبوض و شارژ', keywords: ['قبض', 'برق', 'آب ', 'گاز', 'تلفن', 'همراه', 'اینترنت', 'شارژ', 'ایرانسل', 'رایتل', 'همراه اول'] },
  { id: 'food', label: 'غذا و کافه', keywords: ['کافه', 'رستوران', 'غذا', 'فست فود', 'نانوایی', 'قنادی', 'پیتزا', 'کبابی', 'سوپرمارکت'] },
  { id: 'transport', label: 'حمل‌ونقل', keywords: ['اسنپ', 'تپسی', 'تاکسی', 'بنزین', 'سوخت', 'آژانس', 'مترو', 'بلیط', 'قطار', 'هواپیما'] },
  { id: 'shopping', label: 'خرید', keywords: ['خرید', 'پذیرنده', 'فروشگاه', 'دیجی‌کالا', 'دیجی کالا', 'هایپر'] },
  { id: 'transfer', label: 'انتقال وجه', keywords: ['انتقال', 'کارت به کارت', 'پایا', 'ساتنا', 'پل', 'شبا'] },
  { id: 'other', label: 'سایر', keywords: [] },
]

export const CATEGORY_LABELS: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CategoryId, string>

export function normalizeText(s: string): string {
  return s
    .replace(/\u200c/g, ' ')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLowerCase()
}

// A purchase is recognised first, so "خرید از کافه" counts as shopping rather than food.
const PURCHASE_MARKERS = ['خرید', 'پذیرنده']

export function categorize(type: string, desc: string): CategoryId {
  const text = normalizeText(`${type} ${desc}`)
  if (PURCHASE_MARKERS.some((m) => text.includes(normalizeText(m)))) return 'shopping'
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => text.includes(normalizeText(k)))) return cat.id
  }
  return 'other'
}
