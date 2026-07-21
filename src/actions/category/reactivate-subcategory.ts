'use server'

import { revalidatePath } from 'next/cache'

import { subcategoryIdSchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivateSubcategory(input: { id: string }): Promise<ActionResult> {
  const parsedInput = subcategoryIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Subcategoria inválida.',
      success: false,
    }
  }

  const subcategory = await prisma.subcategory.findUnique({
    select: {
      category: {
        select: {
          isActive: true,
        },
      },
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  if (!subcategory?.category.isActive) {
    return {
      message: 'Reative a categoria antes de reativar a subcategoria.',
      success: false,
    }
  }

  await prisma.subcategory.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Subcategoria reativada com sucesso.',
    success: true,
  }
}
