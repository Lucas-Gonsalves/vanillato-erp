'use server'

import { revalidatePath } from 'next/cache'

import { packageIdSchema } from '@/actions/package/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivatePackage(input: { id: string }): Promise<ActionResult> {
  const parsedInput = packageIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pacote inválido.',
      success: false,
    }
  }

  await prisma.package.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/packages')

  return {
    message: 'Pacote reativado com sucesso.',
    success: true,
  }
}
