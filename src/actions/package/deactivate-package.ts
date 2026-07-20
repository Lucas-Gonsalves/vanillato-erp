'use server'

import { revalidatePath } from 'next/cache'

import { packageIdSchema } from '@/actions/package/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deactivatePackage(input: { id: string }): Promise<ActionResult> {
  const parsedInput = packageIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pacote inválido.',
      success: false,
    }
  }

  await prisma.package.update({
    data: {
      isActive: false,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/packages')

  return {
    message: 'Pacote desativado com sucesso.',
    success: true,
  }
}
