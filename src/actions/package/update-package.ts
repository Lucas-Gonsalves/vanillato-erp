'use server'

import { revalidatePath } from 'next/cache'

import { normalizePackageInput } from '@/actions/package/package-normalizer'
import { validateActivePackageProducts } from '@/actions/package/package-products'
import {
  type PackageField,
  type UpdatePackageInput,
  updatePackageSchema,
} from '@/actions/package/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updatePackage(
  input: UpdatePackageInput,
): Promise<ActionResult<PackageField>> {
  const parsedInput = updatePackageSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, ...packageInput } = parsedInput.data
  const productIds = packageInput.items.map((item) => item.productId)
  const hasOnlyActiveProducts = await validateActivePackageProducts(productIds)

  if (!hasOnlyActiveProducts) {
    return {
      message: 'O pacote contém produtos inexistentes ou inativos.',
      success: false,
    }
  }

  const normalizedInput = normalizePackageInput(packageInput)

  await prisma.$transaction(async (transaction) => {
    await transaction.package.update({
      data: {
        name: normalizedInput.name,
        salePrice: normalizedInput.salePrice,
      },
      where: {
        id,
      },
    })

    await transaction.packageItem.deleteMany({
      where: {
        packageId: id,
      },
    })

    await transaction.packageItem.createMany({
      data: normalizedInput.items.map((item) => ({
        packageId: id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  })

  revalidatePath('/packages')
  revalidatePath(`/packages/${id}`)

  return {
    message: 'Pacote atualizado com sucesso.',
    success: true,
  }
}
