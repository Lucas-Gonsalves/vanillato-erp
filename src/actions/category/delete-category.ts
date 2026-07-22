'use server'

import { revalidatePath } from 'next/cache'

import { categoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deleteCategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = categoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Categoria inválida.',
      success: false,
    }
  }

  const relatedOrderItemsCount = await prisma.orderItem.count({
    where: {
      product: {
        subcategory: {
          categoryId: parsedInput.data.id,
        },
      },
    },
  })

  if (relatedOrderItemsCount > 0) {
    return {
      message: 'Esta categoria possui produtos usados em pedidos e só pode ser inativada.',
      success: false,
    }
  }

  await prisma.category.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/categories')
  revalidatePath('/products')

  return {
    message: 'Categoria excluída com sucesso.',
    success: true,
  }
}
