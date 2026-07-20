'use server'

import { revalidatePath } from 'next/cache'

import {
  type SubcategoryField,
  type SubcategoryInput,
  subcategorySchema,
} from '@/actions/category/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createSubcategory(
  input: SubcategoryInput,
): Promise<ActionResult<SubcategoryField>> {
  const parsedInput = subcategorySchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { categoryId, name: rawName } = parsedInput.data
  const name = rawName.trim()
  const category = await prisma.category.findUnique({
    select: {
      isActive: true,
    },
    where: {
      id: categoryId,
    },
  })

  if (!category || !category.isActive) {
    return {
      message: 'Categoria não encontrada ou inativa.',
      success: false,
    }
  }

  const existingSubcategory = await prisma.subcategory.findFirst({
    where: {
      categoryId,
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

  await prisma.subcategory.create({
    data: {
      categoryId,
      name,
    },
  })

  revalidatePath('/categories')

  return {
    message: 'Subcategoria criada com sucesso.',
    success: true,
  }
}
