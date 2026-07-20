'use server'

import { revalidatePath } from 'next/cache'

import { type CategoryField, type CategoryInput, categorySchema } from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createCategory(input: CategoryInput): Promise<ActionResult<CategoryField>> {
  const parsedInput = categorySchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const name = parsedInput.data.name.trim()
  const existingCategory = await prisma.category.findFirst({
    where: {
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

  await prisma.category.create({
    data: {
      name,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Categoria criada com sucesso.',
    success: true,
  }
}
