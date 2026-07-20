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
