import type { ProductInput } from '@/actions/product/schema'
import { parseCurrencyToDecimalString } from '@/utils'

export function normalizeProductInput(input: ProductInput) {
  const salePrice = parseCurrencyToDecimalString(input.salePrice)
  const costPrice = input.costPrice ? parseCurrencyToDecimalString(input.costPrice) : null

  if (!salePrice) {
    throw new Error('Invalid sale price.')
  }

  return {
    costPrice,
    name: input.name.trim(),
    salePrice,
    subcategoryId: input.subcategoryId,
  }
}
