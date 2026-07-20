'use server'

import { revalidatePath } from 'next/cache'

import {
  type PaymentMethodField,
  type UpdatePaymentMethodInput,
  updatePaymentMethodSchema,
} from '@/actions/payment-method/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updatePaymentMethod(
  input: UpdatePaymentMethodInput,
): Promise<ActionResult<PaymentMethodField>> {
  const parsedInput = updatePaymentMethodSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, name: rawName } = parsedInput.data
  const name = rawName.trim()
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: {
        not: id,
      },
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  })

  if (existingPaymentMethod) {
    return {
      fieldErrors: {
        name: ['Já existe uma forma de pagamento com este nome.'],
      },
      message: 'Forma de pagamento já cadastrada.',
      success: false,
    }
  }

  await prisma.paymentMethod.update({
    data: {
      name,
    },
    where: {
      id,
    },
  })

  revalidatePath('/payment-methods')

  return {
    message: 'Forma de pagamento atualizada com sucesso.',
    success: true,
  }
}
