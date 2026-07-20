'use server'

import { revalidatePath } from 'next/cache'

import {
  type CategoryField,
  type UpdateCategoryInput,
  updateCategorySchema,
} from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResult<CategoryField>> {
  const parsedInput = updateCategorySchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, name: rawName } = parsedInput.data
  const name = rawName.trim()
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: {
        not: id,
      },
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  })

  if (existingCategory) {
    return {
      fieldErrors: {
        name: ['Já existe uma categoria com este nome.'],
      },
      message: 'Categoria já cadastrada.',
      success: false,
    }
  }

  await prisma.category.update({
    data: {
      name,
    },
    where: {
      id,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Categoria atualizada com sucesso.',
    success: true,
  }
}
