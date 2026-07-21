'use server'

import { revalidatePath } from 'next/cache'

import { customerIdSchema } from '@/actions/customer/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivateCustomer(input: { id: string }): Promise<ActionResult> {
  const parsedInput = customerIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Cliente inválido.',
      success: false,
    }
  }

  await prisma.customer.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/customers')

  return {
    message: 'Cliente reativado com sucesso.',
    success: true,
  }
}
