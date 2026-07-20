'use server'

import { revalidatePath } from 'next/cache'

import { categoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deactivateCategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = categoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Categoria inválida.',
      success: false,
    }
  }

  await prisma.$transaction([
    prisma.category.update({
      data: {
        isActive: false,
      },
      where: {
        id: parsedInput.data.id,
      },
    }),
    prisma.subcategory.updateMany({
      data: {
        isActive: false,
      },
      where: {
        categoryId: parsedInput.data.id,
      },
    }),
  ])

  revalidatePath('/categories')

  return {
    message: 'Categoria desativada com sucesso.',
    success: true,
  }
}
