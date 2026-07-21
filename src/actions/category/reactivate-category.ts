'use server'

import { revalidatePath } from 'next/cache'

import { categoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivateCategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = categoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Categoria inválida.',
      success: false,
    }
  }

  await prisma.category.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Categoria reativada com sucesso.',
    success: true,
  }
}
