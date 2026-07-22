'use server'

import { revalidatePath } from 'next/cache'

import { customerIdSchema } from '@/actions/customer/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deleteCustomer(input: { id: string }): Promise<ActionResult> {
  const parsedInput = customerIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Cliente inválido.',
      success: false,
    }
  }

  const ordersCount = await prisma.order.count({
    where: {
      customerId: parsedInput.data.id,
    },
  })

  if (ordersCount > 0) {
    return {
      message: 'Este cliente possui pedidos e só pode ser inativado.',
      success: false,
    }
  }

  await prisma.customer.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/customers')

  return {
    message: 'Cliente excluído com sucesso.',
    success: true,
  }
}
