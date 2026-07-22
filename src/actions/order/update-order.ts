'use server'

import { revalidatePath } from 'next/cache'

import { calculateOrder } from '@/actions/order/order-calculator'
import { syncOrderReceivable } from '@/actions/order/order-receivable'
import { type OrderField, type UpdateOrderInput, updateOrderSchema } from '@/actions/order/schema'
import type { ActionResult } from '@/actions/types'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function updateOrder(input: UpdateOrderInput): Promise<ActionResult<OrderField>> {
  const user = await getCurrentUser()
  const parsedInput = updateOrderSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, ...orderInput } = parsedInput.data
  const [customer, paymentMethod, calculationResult] = await Promise.all([
    prisma.customer.findUnique({
      select: {
        isActive: true,
      },
      where: {
        id: orderInput.customerId,
      },
    }),
    prisma.paymentMethod.findUnique({
      select: {
        isActive: true,
      },
      where: {
        id: orderInput.paymentMethodId,
      },
    }),
    calculateOrder(orderInput),
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
  const expectedPaymentDate =
    orderInput.paymentCondition === 'CREDIT' ? parseDate(orderInput.expectedPaymentDate) : null
  const paymentNotes =
    orderInput.paymentCondition === 'CREDIT' ? normalizeOptionalText(orderInput.paymentNotes) : null

  await prisma.$transaction(async (transaction) => {
    await transaction.order.update({
      data: {
        customerId: orderInput.customerId,
        deliveryDate: calculatedOrder.deliveryDate,
        deliveryFee: calculatedOrder.deliveryFee,
        discount: calculatedOrder.discount,
        expectedPaymentDate,
        expectedPaymentMethodId:
          orderInput.paymentCondition === 'CREDIT' ? orderInput.paymentMethodId : null,
        notes: calculatedOrder.notes,
        paymentCondition: orderInput.paymentCondition,
        paymentMethodId: orderInput.paymentMethodId,
        paymentNotes,
        total: calculatedOrder.total,
      },
      where: {
        id,
      },
    })

    await transaction.orderItem.deleteMany({
      where: {
        orderId: id,
      },
    })

    await transaction.orderItem.createMany({
      data: calculatedOrder.items.map((item) => ({
        orderId: id,
        packageId: item.packageId,
        productId: item.productId,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        type: item.type,
        unitPrice: item.unitPrice,
      })),
    })

    await syncOrderReceivable(transaction, {
      customerId: orderInput.customerId,
      dueDate: expectedPaymentDate,
      note: paymentNotes,
      orderId: id,
      paymentCondition: orderInput.paymentCondition,
      total: calculatedOrder.total,
      userId: user?.id ?? null,
    })
  })

  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  revalidatePath('/dashboard')

  return {
    message: 'Pedido atualizado com sucesso.',
    success: true,
  }
}

function parseDate(value: string | undefined) {
  return value ? new Date(`${value}T00:00:00`) : null
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
