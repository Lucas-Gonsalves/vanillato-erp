import type { PackageProductOption } from '@/@types'
import prisma from '@/lib/prisma'

export async function findPackageProductOptions(): Promise<PackageProductOption[]> {
  const products = await prisma.product.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
    select: {
      id: true,
      name: true,
      salePrice: true,
      subcategory: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
          name: true,
        },
      },
    },
    where: {
      isActive: true,
      subcategory: {
        category: {
          isActive: true,
        },
        isActive: true,
      },
    },
  })

  return products.map((product) => ({
    categoryName: product.subcategory.category.name,
    id: product.id,
    name: product.name,
    salePrice: product.salePrice.toString(),
    subcategoryName: product.subcategory.name,
  }))
}
