'use server'

import { revalidatePath } from 'next/cache'

import { productIdSchema } from '@/actions/product/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivateProduct(input: { id: string }): Promise<ActionResult> {
  const parsedInput = productIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Produto inválido.',
      success: false,
    }
  }

  const product = await prisma.product.findUnique({
    select: {
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
      id: parsedInput.data.id,
    },
  })

  if (!product?.subcategory.isActive || !product.subcategory.category.isActive) {
    return {
      message: 'Reative a categoria e a subcategoria antes de reativar o produto.',
      success: false,
    }
  }

  await prisma.product.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/products')

  return {
    message: 'Produto reativado com sucesso.',
    success: true,
  }
}
