'use server'

import { revalidatePath } from 'next/cache'

import { paymentMethodIdSchema } from '@/actions/payment-method/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function deletePaymentMethod(input: { id: string }): Promise<ActionResult> {
  const parsedInput = paymentMethodIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Forma de pagamento inválida.',
      success: false,
    }
  }

  const ordersCount = await prisma.order.count({
    where: {
      paymentMethodId: parsedInput.data.id,
    },
  })

  if (ordersCount > 0) {
    return {
      message: 'Esta forma de pagamento já foi usada em pedidos e só pode ser inativada.',
      success: false,
    }
  }

  await prisma.paymentMethod.delete({
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/payment-methods')

  return {
    message: 'Forma de pagamento excluída com sucesso.',
    success: true,
  }
}
