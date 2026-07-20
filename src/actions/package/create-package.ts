'use server'

import { revalidatePath } from 'next/cache'

import { normalizePackageInput } from '@/actions/package/package-normalizer'
import { validateActivePackageProducts } from '@/actions/package/package-products'
import { type PackageField, type PackageInput, packageSchema } from '@/actions/package/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createPackage(input: PackageInput): Promise<ActionResult<PackageField>> {
  const parsedInput = packageSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const productIds = parsedInput.data.items.map((item) => item.productId)
  const hasOnlyActiveProducts = await validateActivePackageProducts(productIds)

  if (!hasOnlyActiveProducts) {
    return {
      message: 'O pacote contém produtos inexistentes ou inativos.',
      success: false,
    }
  }

  const normalizedInput = normalizePackageInput(parsedInput.data)

  await prisma.package.create({
    data: {
      name: normalizedInput.name,
      salePrice: normalizedInput.salePrice,
      items: {
        create: normalizedInput.items,
      },
    },
  })

  revalidatePath('/packages')

  return {
    message: 'Pacote criado com sucesso.',
    success: true,
  }
}
