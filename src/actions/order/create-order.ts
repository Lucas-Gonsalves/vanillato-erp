'use server'

import { revalidatePath } from 'next/cache'

import { calculateOrder } from '@/actions/order/order-calculator'
import { type OrderField, type OrderInput, orderSchema } from '@/actions/order/schema'
import type { ActionResult } from '@/actions/types'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function createOrder(input: OrderInput): Promise<ActionResult<OrderField>> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      message: 'Sessão inválida.',
      success: false,
    }
  }

  const parsedInput = orderSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const [customer, paymentMethod, calculationResult] = await Promise.all([
    prisma.customer.findUnique({
      select: {
        isActive: true,
      },
      where: {
        id: parsedInput.data.customerId,
      },
    }),
    prisma.paymentMethod.findUnique({
      select: {
        isActive: true,
      },
      where: {
        id: parsedInput.data.paymentMethodId,
      },
    }),
    calculateOrder(parsedInput.data),
  ])

  if (!customer?.isActive) {
    return {
      fieldErrors: {
        customerId: ['Selecione um cliente ativo.'],
      },
      message: 'Cliente inválido.',
      success: false,
    }
  }

  if (!paymentMethod?.isActive) {
    return {
      fieldErrors: {
        paymentMethodId: ['Selecione uma forma de pagamento ativa.'],
      },
      message: 'Forma de pagamento inválida.',
      success: false,
    }
  }

  if (!calculationResult.success) {
    return {
      message: calculationResult.message,
      success: false,
    }
  }

  const calculatedOrder = calculationResult.order

  await prisma.order.create({
    data: {
      createdById: user.id,
      customerId: parsedInput.data.customerId,
      deliveryDate: calculatedOrder.deliveryDate,
      deliveryFee: calculatedOrder.deliveryFee,
      discount: calculatedOrder.discount,
      items: {
        create: calculatedOrder.items,
      },
      notes: calculatedOrder.notes,
      paymentMethodId: parsedInput.data.paymentMethodId,
      total: calculatedOrder.total,
    },
  })

  revalidatePath('/orders')
  revalidatePath('/dashboard')

  return {
    message: 'Pedido criado com sucesso.',
    success: true,
  }
}
