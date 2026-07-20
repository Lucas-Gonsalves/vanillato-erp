import { PackagesClient } from '@/components/pages/packages'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type PackagesPageProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const { search = '' } = await searchParams
  const trimmedSearch = search.trim()
  const packageWhere = buildPackageWhere(trimmedSearch)

  const packages = await prisma.package.findMany({
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        name: 'asc',
      },
    ],
    select: {
      _count: {
        select: {
          items: true,
        },
      },
      id: true,
      isActive: true,
      name: true,
      salePrice: true,
    },
    where: packageWhere,
  })

  return (
    <PackagesClient
      packages={packages.map((packageItem) => ({
        id: packageItem.id,
        isActive: packageItem.isActive,
        itemsCount: packageItem._count.items,
        name: packageItem.name,
        salePrice: packageItem.salePrice.toString(),
      }))}
      search={trimmedSearch}
    />
  )
}

function buildPackageWhere(search: string): Prisma.PackageWhereInput | undefined {
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
        items: {
          some: {
            product: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      },
    ],
  }
}
