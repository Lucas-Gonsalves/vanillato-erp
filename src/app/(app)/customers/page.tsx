import { CustomersClient } from '@/components/pages/customers'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type CustomersPageProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { search = '' } = await searchParams
  const trimmedSearch = search.trim()
  const customerWhere = buildCustomerWhere(trimmedSearch)

  const customers = await prisma.customer.findMany({
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        name: 'asc',
      },
    ],
    select: {
      address: true,
      city: true,
      district: true,
      id: true,
      instagram: true,
      isActive: true,
      name: true,
      notes: true,
      phone: true,
    },
    where: customerWhere,
  })

  return <CustomersClient customers={customers} search={trimmedSearch} />
}

function buildCustomerWhere(search: string): Prisma.CustomerWhereInput | undefined {
  if (!search) {
    return undefined
  }

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        phone: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        city: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        instagram: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ],
  }
}
