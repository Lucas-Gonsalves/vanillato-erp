'use server'

import { revalidatePath } from 'next/cache'

import { subcategoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deactivateSubcategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = subcategoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Subcategoria inválida.',
      success: false,
    }
  }

  await prisma.subcategory.update({
    data: {
      isActive: false,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Subcategoria desativada com sucesso.',
    success: true,
  }
}
