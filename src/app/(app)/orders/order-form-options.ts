import type { OrderFormOptions } from '@/@types'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type SelectedOrderOptionIds = {
  customerId?: string
  packageIds?: string[]
  paymentMethodId?: string
  productIds?: string[]
}

export async function findOrderFormOptions(
  selectedIds: SelectedOrderOptionIds = {},
): Promise<OrderFormOptions> {
  const customerWhere = buildCustomerWhere(selectedIds.customerId)
  const paymentMethodWhere = buildPaymentMethodWhere(selectedIds.paymentMethodId)

  const [customers, paymentMethods, products, packages] = await Promise.all([
    prisma.customer.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
      where: customerWhere,
    }),
    prisma.paymentMethod.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
      where: paymentMethodWhere,
    }),
    prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        salePrice: true,
      },
      where: {
        OR: [
          {
            isActive: true,
            subcategory: {
              category: {
                isActive: true,
              },
              isActive: true,
            },
          },
          {
            id: {
              in: selectedIds.productIds ?? [],
            },
          },
        ],
      },
    }),
    prisma.package.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        salePrice: true,
      },
      where: {
        OR: [
          {
            isActive: true,
          },
          {
            id: {
              in: selectedIds.packageIds ?? [],
            },
          },
        ],
      },
    }),
  ])

  return {
    customers,
    packages: packages.map((packageItem) => ({
      id: packageItem.id,
      name: packageItem.name,
      price: packageItem.salePrice.toString(),
    })),
    paymentMethods,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.salePrice.toString(),
    })),
  }
}

function buildCustomerWhere(customerId: string | undefined): Prisma.CustomerWhereInput {
  if (!customerId) {
    return {
      isActive: true,
    }
  }

  return {
    OR: [
      {
        isActive: true,
      },
      {
        id: customerId,
      },
    ],
  }
}

function buildPaymentMethodWhere(
  paymentMethodId: string | undefined,
): Prisma.PaymentMethodWhereInput {
  if (!paymentMethodId) {
    return {
      isActive: true,
    }
  }

  return {
    OR: [
      {
        isActive: true,
      },
      {
        id: paymentMethodId,
      },
    ],
  }
}
