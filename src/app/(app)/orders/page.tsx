import { OrdersClient } from '@/components/pages/orders'
import { Prisma } from '@/generated/prisma/client'
import { OrderStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'

type OrdersPageProps = {
  searchParams: Promise<{
    search?: string
    status?: string
  }>
}

const orderStatuses = [
  OrderStatus.CANCELED,
  OrderStatus.DELIVERED,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.PENDING,
  OrderStatus.READY,
] as const

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { search = '', status = '' } = await searchParams
  const trimmedSearch = search.trim()
  const validStatus = getValidOrderStatus(status)
  const orderWhere = buildOrderWhere(trimmedSearch, validStatus)

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      _count: {
        select: {
          items: true,
        },
      },
      createdAt: true,
      customer: {
        select: {
          name: true,
        },
      },
      deliveryDate: true,
      id: true,
      paymentMethod: {
        select: {
          name: true,
        },
      },
      status: true,
      total: true,
    },
    where: orderWhere,
  })

  return (
    <OrdersClient
      orders={orders.map((order) => ({
        createdAt: order.createdAt.toISOString(),
        customerName: order.customer.name,
        deliveryDate: order.deliveryDate?.toISOString() ?? null,
        id: order.id,
        itemsCount: order._count.items,
        paymentMethodName: order.paymentMethod.name,
        status: order.status,
        total: order.total.toString(),
      }))}
      search={trimmedSearch}
      status={validStatus ?? ''}
    />
  )
}

function buildOrderWhere(
  search: string,
  status: OrderStatus | undefined,
): Prisma.OrderWhereInput | undefined {
  const filters: Prisma.OrderWhereInput[] = []

  if (status) {
    filters.push({
      status,
    })
  }

  if (search) {
    filters.push({
      OR: [
        {
          customer: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          paymentMethod: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          notes: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    })
  }

  if (filters.length === 0) {
    return undefined
  }

  return {
    AND: filters,
  }
}

function getValidOrderStatus(value: string): OrderStatus | undefined {
  const status = orderStatuses.find((currentStatus) => currentStatus === value)

  return status
}
