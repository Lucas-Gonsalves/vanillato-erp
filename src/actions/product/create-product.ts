'use server'

import { revalidatePath } from 'next/cache'

import { normalizeProductInput } from '@/actions/product/product-normalizer'
import { type ProductField, type ProductInput, productSchema } from '@/actions/product/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createProduct(input: ProductInput): Promise<ActionResult<ProductField>> {
  const parsedInput = productSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const subcategory = await prisma.subcategory.findUnique({
    include: {
      category: {
        select: {
          isActive: true,
        },
      },
    },
    where: {
      id: parsedInput.data.subcategoryId,
    },
  })

  if (!subcategory || !subcategory.isActive || !subcategory.category.isActive) {
    return {
      fieldErrors: {
        subcategoryId: ['Selecione uma subcategoria ativa.'],
      },
      message: 'Subcategoria inválida.',
      success: false,
    }
  }

  await prisma.product.create({
    data: normalizeProductInput(parsedInput.data),
  })

  revalidatePath('/products')

  return {
    message: 'Produto criado com sucesso.',
    success: true,
  }
}
