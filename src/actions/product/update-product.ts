'use server'

import { revalidatePath } from 'next/cache'

import { normalizeProductInput } from '@/actions/product/product-normalizer'
import {
  type ProductField,
  productIdSchema,
  type UpdateProductInput,
  updateProductSchema,
} from '@/actions/product/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updateProduct(
  input: UpdateProductInput,
): Promise<ActionResult<ProductField>> {
  const parsedInput = updateProductSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, ...productInput } = parsedInput.data
  const existingProduct = await prisma.product.findUnique({
    select: {
      id: true,
    },
    where: {
      id,
    },
  })

  if (!existingProduct) {
    return {
      message: 'Produto não encontrado.',
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
      id: productInput.subcategoryId,
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

  await prisma.product.update({
    data: normalizeProductInput(productInput),
    where: productIdSchema.parse({ id }),
  })

  revalidatePath('/products')

  return {
    message: 'Produto atualizado com sucesso.',
    success: true,
  }
}
