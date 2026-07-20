'use server'

import { revalidatePath } from 'next/cache'

import { productIdSchema } from '@/actions/product/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deactivateProduct(input: { id: string }): Promise<ActionResult> {
  const parsedInput = productIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Produto inválido.',
      success: false,
    }
  }

  await prisma.product.update({
    data: {
      isActive: false,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/products')

  return {
    message: 'Produto desativado com sucesso.',
    success: true,
  }
}
