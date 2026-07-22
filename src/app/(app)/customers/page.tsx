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
      allowCreditPurchase: true,
      alternativePhone: true,
      birthDate: true,
      city: true,
      complement: true,
      cpf: true,
      creditLimit: true,
      district: true,
      gender: true,
      id: true,
      internalNotes: true,
      instagram: true,
      isActive: true,
      isVip: true,
      name: true,
      number: true,
      notes: true,
      origin: true,
      personType: true,
      phone: true,
      reference: true,
      street: true,
      whatsapp: true,
      zipCode: true,
    },
    where: customerWhere,
  })

  return (
    <CustomersClient
      customers={customers.map((customer) => ({
        ...customer,
        birthDate: customer.birthDate?.toISOString() ?? null,
        creditLimit: customer.creditLimit?.toString() ?? null,
      }))}
      search={trimmedSearch}
    />
  )
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
