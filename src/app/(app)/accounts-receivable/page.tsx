import { AccountsReceivableClient } from '@/components/pages/accounts-receivable'
import type { Prisma } from '@/generated/prisma/client'
import { ReceivableStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'
import { endOfDay, startOfDay } from '@/utils'

type AccountsReceivablePageProps = {
  searchParams: Promise<{
    search?: string
    status?: string
  }>
}

export default async function AccountsReceivablePage({
  searchParams,
}: AccountsReceivablePageProps) {
  const { search = '', status = '' } = await searchParams
  const trimmedSearch = search.trim()
  const where = buildReceivableWhere(trimmedSearch, status)

  const [receivables, paymentMethods] = await Promise.all([
    prisma.accountReceivable.findMany({
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        history: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        payments: {
          include: {
            paymentMethod: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            paidAt: 'desc',
          },
        },
      },
      orderBy: [
        {
          dueDate: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
      where,
      take: 100,
    }),
    prisma.paymentMethod.findMany({
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
      },
      where: {
        isActive: true,
      },
    }),
  ])

  return (
    <AccountsReceivableClient
      paymentMethods={paymentMethods}
      receivables={receivables.map((receivable) => ({
        customerName: receivable.customer.name,
        dueDate: receivable.dueDate.toISOString(),
        history: receivable.history.map((history) => ({
          createdAt: history.createdAt.toISOString(),
          eventType: history.eventType,
          id: history.id,
          note: history.note,
          userName: history.user?.name ?? null,
        })),
        id: receivable.id,
        orderId: receivable.orderId,
        paidAmount: receivable.paidAmount.toString(),
        payments: receivable.payments.map((payment) => ({
          amount: payment.amount.toString(),
          canceledAt: payment.canceledAt?.toISOString() ?? null,
          id: payment.id,
          paidAt: payment.paidAt.toISOString(),
          paymentMethodName: payment.paymentMethod?.name ?? null,
        })),
        remainingAmount: receivable.remainingAmount.toString(),
        status: receivable.status,
        totalAmount: receivable.totalAmount.toString(),
      }))}
      search={trimmedSearch}
      status={status}
    />
  )
}

function buildReceivableWhere(search: string, status: string): Prisma.AccountReceivableWhereInput {
  const where: Prisma.AccountReceivableWhereInput = {}

  if (search) {
    where.OR = [
      {
        customer: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      {
        orderId: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ]
  }

  const now = new Date()

  if (status === 'OPEN') {
    where.status = {
      in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID],
    }
  }

  if (status === 'DUE_TODAY') {
    where.dueDate = {
      gte: startOfDay(now),
      lte: endOfDay(now),
    }
    where.status = {
      in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID],
    }
  }

  if (status === 'THIS_WEEK') {
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() + 7)
    where.dueDate = {
      gte: startOfDay(now),
      lte: endOfDay(weekEnd),
    }
    where.status = {
      in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID],
    }
  }

  if (status === 'OVERDUE') {
    where.OR = [
      ...(where.OR ?? []),
      {
        status: ReceivableStatus.OVERDUE,
      },
      {
        dueDate: {
          lt: startOfDay(now),
        },
        status: {
          in: [ReceivableStatus.OPEN, ReceivableStatus.PARTIALLY_PAID],
        },
      },
    ]
  }

  if (status === 'PAID') {
    where.status = ReceivableStatus.PAID
  }

  if (status === 'RENEGOTIATED') {
    where.renegotiations = {
      some: {},
    }
  }

  return where
}
