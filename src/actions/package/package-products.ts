import prisma from '@/lib/prisma'

export async function validateActivePackageProducts(productIds: string[]) {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      isActive: true,
      subcategory: {
        select: {
          category: {
            select: {
              isActive: true,
            },
          },
          isActive: true,
        },
      },
    },
    where: {
      id: {
        in: productIds,
      },
    },
  })

  return productIds.every((productId) => {
    const product = products.find((currentProduct) => currentProduct.id === productId)

    return (
      product?.isActive && product.subcategory.isActive && product.subcategory.category.isActive
    )
  })
}
