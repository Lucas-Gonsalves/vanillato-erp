import type { PackageInput } from '@/actions/package/schema'
import { parseCurrencyToDecimalString } from '@/utils'

export function normalizePackageInput(input: PackageInput) {
  const salePrice = parseCurrencyToDecimalString(input.salePrice)

  if (!salePrice) {
    throw new Error('Invalid sale price.')
  }

  return {
    items: input.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    name: input.name.trim(),
    salePrice,
  }
}
