'use server'

import { revalidatePath } from 'next/cache'

import { productIdSchema } from '@/actions/product/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deleteProduct(input: { id: string }): Promise<ActionResult> {
  const parsedInput = productIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Produto inválido.',
      success: false,
    }
  }

  const orderItemsCount = await prisma.orderItem.count({
    where: {
      productId: parsedInput.data.id,
    },
  })

  if (orderItemsCount > 0) {
    return {
      message: 'Este produto já foi usado em pedidos e só pode ser inativado.',
      success: false,
    }
  }

  await prisma.product.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/products')
  revalidatePath('/packages')

  return {
    message: 'Produto excluído com sucesso.',
    success: true,
  }
}
