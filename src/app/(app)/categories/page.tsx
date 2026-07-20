import { CategoriesClient } from '@/components/pages/categories'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type CategoriesPageProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { search = '' } = await searchParams
  const trimmedSearch = search.trim()
  const categoryWhere = buildCategoryWhere(trimmedSearch)

  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
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
      },
    },
    orderBy: [
      {
        isActive: 'desc',
      },
      {
        name: 'asc',
      },
    ],
    where: categoryWhere,
  })

  return <CategoriesClient categories={categories} search={trimmedSearch} />
}

function buildCategoryWhere(search: string): Prisma.CategoryWhereInput | undefined {
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
        subcategories: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      },
    ],
  }
}
