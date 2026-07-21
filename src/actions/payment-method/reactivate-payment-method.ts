'use server'

import { revalidatePath } from 'next/cache'

import { paymentMethodIdSchema } from '@/actions/payment-method/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function reactivatePaymentMethod(input: { id: string }): Promise<ActionResult> {
  const parsedInput = paymentMethodIdSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Forma de pagamento inválida.',
      success: false,
    }
  }

  await prisma.paymentMethod.update({
    data: {
      isActive: true,
    },
    where: {
      id: parsedInput.data.id,
    },
  })

  revalidatePath('/payment-methods')

  return {
    message: 'Forma de pagamento reativada com sucesso.',
    success: true,
  }
}
