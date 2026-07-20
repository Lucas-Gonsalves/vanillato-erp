import { PaymentMethodsClient } from '@/components/pages/payment-methods'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type PaymentMethodsPageProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function PaymentMethodsPage({ searchParams }: PaymentMethodsPageProps) {
  const { search = '' } = await searchParams
  const trimmedSearch = search.trim()
  const paymentMethodWhere = buildPaymentMethodWhere(trimmedSearch)

  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        name: 'asc',
      },
    ],
    select: {
      id: true,
      isActive: true,
      name: true,
    },
    where: paymentMethodWhere,
  })

  return <PaymentMethodsClient paymentMethods={paymentMethods} search={trimmedSearch} />
}

function buildPaymentMethodWhere(search: string): Prisma.PaymentMethodWhereInput | undefined {
  if (!search) {
    return undefined
  }

  return {
    name: {
      contains: search,
      mode: 'insensitive',
    },
  }
}
