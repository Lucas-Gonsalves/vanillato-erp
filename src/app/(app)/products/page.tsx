import { ProductsClient } from '@/components/pages/products'
import { Prisma } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search = '' } = await searchParams
  const trimmedSearch = search.trim()
  const productWhere = buildProductWhere(trimmedSearch)

  const [products, subcategories] = await Promise.all([
    prisma.product.findMany({
      orderBy: [
        {
          isActive: 'desc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        costPrice: true,
        id: true,
        isActive: true,
        name: true,
        salePrice: true,
        subcategory: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
            id: true,
            name: true,
          },
        },
        subcategoryId: true,
      },
      where: productWhere,
    }),
    prisma.subcategory.findMany({
      orderBy: [
        {
          category: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
      select: {
        category: {
          select: {
            name: true,
          },
        },
        id: true,
        name: true,
      },
      where: {
        category: {
          isActive: true,
        },
        isActive: true,
      },
    }),
  ])

  return (
    <ProductsClient
      products={products.map((product) => ({
        categoryName: product.subcategory.category.name,
        costPrice: product.costPrice?.toString() ?? null,
        id: product.id,
        isActive: product.isActive,
        name: product.name,
        salePrice: product.salePrice.toString(),
        subcategoryId: product.subcategoryId,
        subcategoryName: product.subcategory.name,
      }))}
      search={trimmedSearch}
      subcategories={subcategories.map((subcategory) => ({
        categoryName: subcategory.category.name,
        id: subcategory.id,
        name: subcategory.name,
      }))}
    />
  )
}

function buildProductWhere(search: string): Prisma.ProductWhereInput | undefined {
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
        subcategory: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
      {
        subcategory: {
          category: {
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
