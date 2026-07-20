'use server'

import { revalidatePath } from 'next/cache'

import {
  orderIdSchema,
  orderStatusSchema,
  type UpdateOrderStatusInput,
} from '@/actions/order/schema'
import type { ActionResult } from '@/actions/types'
import { OrderStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'

export async function updateOrderStatus(input: UpdateOrderStatusInput): Promise<ActionResult> {
  const parsedInput = orderStatusSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Status inválido.',
      success: false,
    }
  }

  await prisma.order.update({
    data: {
      status: parsedInput.data.status,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/orders')
  revalidatePath(`/orders/${parsedInput.data.id}`)
  revalidatePath('/dashboard')

  return {
    message: 'Status atualizado com sucesso.',
    success: true,
  }
}

export async function cancelOrder(input: { id: string }): Promise<ActionResult> {
  const parsedInput = orderIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pedido inválido.',
      success: false,
    }
  }

  return updateOrderStatus({
    id: parsedInput.data.id,
    status: OrderStatus.CANCELED,
  })
}
