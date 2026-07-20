'use server'

import { revalidatePath } from 'next/cache'

import { customerIdSchema } from '@/actions/customer/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deactivateCustomer(input: { id: string }): Promise<ActionResult> {
  const parsedInput = customerIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Cliente inválido.',
      success: false,
    }
  }

  await prisma.customer.update({
    data: {
      isActive: false,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/customers')

  return {
    message: 'Cliente desativado com sucesso.',
    success: true,
  }
}
