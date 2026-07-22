'use server'

import { revalidatePath } from 'next/cache'

import { packageIdSchema } from '@/actions/package/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deletePackage(input: { id: string }): Promise<ActionResult> {
  const parsedInput = packageIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pacote inválido.',
      success: false,
    }
  }

  const orderItemsCount = await prisma.orderItem.count({
    where: {
      packageId: parsedInput.data.id,
    },
  })

  if (orderItemsCount > 0) {
    return {
      message: 'Este pacote já foi usado em pedidos e só pode ser inativado.',
      success: false,
    }
  }

  await prisma.package.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/packages')

  return {
    message: 'Pacote excluído com sucesso.',
    success: true,
  }
}
