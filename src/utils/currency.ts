export type CurrencyValue = number | string | { toString(): string }

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
})

export function formatCurrency(value: CurrencyValue) {
  const numericValue = typeof value === 'number' ? value : Number(value.toString())

  return currencyFormatter.format(numericValue)
}

export function parseCurrencyToDecimalString(value: string) {
  const sanitizedValue = value
    .trim()
    .replace(/[^\d,.]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')

  if (!sanitizedValue || !/^\d+(\.\d{1,2})?$/u.test(sanitizedValue)) {
    return null
  }

  const numericValue = Number(sanitizedValue)

  if (!Number.isFinite(numericValue)) {
    return null
  }

  return numericValue.toFixed(2)
}

export function decimalStringToCents(value: string) {
  const [rawReais = '0', rawCents = '0'] = value.split('.')
  const cents = rawCents.padEnd(2, '0').slice(0, 2)

  return Number(rawReais) * 100 + Number(cents)
}

export function centsToDecimalString(value: number) {
  const normalizedValue = Math.max(0, Math.round(value))
  const reais = Math.floor(normalizedValue / 100)
  const cents = normalizedValue % 100

  return `${reais}.${cents.toString().padStart(2, '0')}`
}
