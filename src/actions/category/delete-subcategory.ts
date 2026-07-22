'use server'

import { revalidatePath } from 'next/cache'

import { subcategoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deleteSubcategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = subcategoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Subcategoria inválida.',
      success: false,
    }
  }

  const relatedOrderItemsCount = await prisma.orderItem.count({
    where: {
      product: {
        subcategoryId: parsedInput.data.id,
      },
    },
  })

  if (relatedOrderItemsCount > 0) {
    return {
      message: 'Esta subcategoria possui produtos usados em pedidos e só pode ser inativada.',
      success: false,
    }
  }

  await prisma.subcategory.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/categories')
  revalidatePath('/products')

  return {
    message: 'Subcategoria excluída com sucesso.',
    success: true,
  }
}
