import type { OrderInput } from '@/actions/order/schema'
import { OrderItemType } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'
import { centsToDecimalString, decimalStringToCents, parseCurrencyToDecimalString } from '@/utils'

type CalculatedOrderItem = {
  packageId: string | null
  productId: string | null
  quantity: number
  totalPrice: string
  type: OrderItemType
  unitPrice: string
}

export type CalculatedOrder = {
  deliveryDate: Date | null
  deliveryFee: string
  discount: string
  items: CalculatedOrderItem[]
  notes: string | null
  total: string
}

export async function calculateOrder(input: OrderInput): Promise<CalculatedOrder | null> {
  const productIds = input.items
    .filter((item) => item.type === OrderItemType.PRODUCT && item.productId)
    .map((item) => item.productId as string)
  const packageIds = input.items
    .filter((item) => item.type === OrderItemType.PACKAGE && item.packageId)
    .map((item) => item.packageId as string)

  const [products, packages] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        isActive: true,
        salePrice: true,
        subcategory: {
          select: {
            category: {
              select: {
                isActive: true,
              },
            },
            isActive: true,
          },
        },
      },
      where: {
        id: {
          in: productIds,
        },
      },
    }),
    prisma.package.findMany({
      select: {
        id: true,
        isActive: true,
        salePrice: true,
      },
      where: {
        id: {
          in: packageIds,
        },
      },
    }),
  ])

  const calculatedItems: CalculatedOrderItem[] = []
  let subtotalCents = 0

  for (const item of input.items) {
    if (item.type === OrderItemType.PRODUCT) {
      const product = products.find((currentProduct) => currentProduct.id === item.productId)

      if (
        !product?.isActive ||
        !product.subcategory.isActive ||
        !product.subcategory.category.isActive
      ) {
        return null
      }

      const unitPrice = product.salePrice.toString()
      const totalPriceCents = decimalStringToCents(unitPrice) * item.quantity
      subtotalCents += totalPriceCents
      calculatedItems.push({
        packageId: null,
        productId: product.id,
        quantity: item.quantity,
        totalPrice: centsToDecimalString(totalPriceCents),
        type: OrderItemType.PRODUCT,
        unitPrice,
      })
    }

    if (item.type === OrderItemType.PACKAGE) {
      const packageItem = packages.find((currentPackage) => currentPackage.id === item.packageId)

      if (!packageItem?.isActive) {
        return null
      }

      const unitPrice = packageItem.salePrice.toString()
      const totalPriceCents = decimalStringToCents(unitPrice) * item.quantity
      subtotalCents += totalPriceCents
      calculatedItems.push({
        packageId: packageItem.id,
        productId: null,
        quantity: item.quantity,
        totalPrice: centsToDecimalString(totalPriceCents),
        type: OrderItemType.PACKAGE,
        unitPrice,
      })
    }
  }

  const discount = parseCurrencyToDecimalString(input.discount ?? '') ?? '0.00'
  const deliveryFee = parseCurrencyToDecimalString(input.deliveryFee ?? '') ?? '0.00'
  const totalCents =
    subtotalCents - decimalStringToCents(discount) + decimalStringToCents(deliveryFee)

  return {
    deliveryDate: input.deliveryDate ? new Date(`${input.deliveryDate}T00:00:00`) : null,
    deliveryFee,
    discount,
    items: calculatedItems,
    notes: normalizeOptionalText(input.notes),
    total: centsToDecimalString(totalCents),
  }
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
