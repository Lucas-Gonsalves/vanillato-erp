'use server'

import { revalidatePath } from 'next/cache'

import { orderIdSchema } from '@/actions/order/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deleteOrder(input: { id: string }): Promise<ActionResult> {
  const parsedInput = orderIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pedido inválido.',
      success: false,
    }
  }

  await prisma.order.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/orders')
  revalidatePath('/dashboard')

  return {
    message: 'Pedido excluído com sucesso.',
    success: true,
  }
}
