'use server'

import { revalidatePath } from 'next/cache'

import {
  type SubcategoryField,
  type UpdateSubcategoryInput,
  updateSubcategorySchema,
} from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updateSubcategory(
  input: UpdateSubcategoryInput,
): Promise<ActionResult<SubcategoryField>> {
  const parsedInput = updateSubcategorySchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { categoryId, id, name: rawName } = parsedInput.data
  const name = rawName.trim()
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: {
      categoryId,
      id: {
        not: id,
      },
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  })

  if (existingSubcategory) {
    return {
      fieldErrors: {
        name: ['Já existe uma subcategoria com este nome nesta categoria.'],
      },
      message: 'Subcategoria já cadastrada.',
      success: false,
    }
  }

  await prisma.subcategory.update({
    data: {
      categoryId,
      name,
    },
    where: {
      id,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Subcategoria atualizada com sucesso.',
    success: true,
  }
}
