'use server'

import { revalidatePath } from 'next/cache'

import {
  type PaymentMethodField,
  type PaymentMethodInput,
  paymentMethodSchema,
} from '@/actions/payment-method/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createPaymentMethod(
  input: PaymentMethodInput,
): Promise<ActionResult<PaymentMethodField>> {
  const parsedInput = paymentMethodSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const name = parsedInput.data.name.trim()
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: {
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

  await prisma.paymentMethod.create({
    data: {
      name,
    },
  })

  revalidatePath('/payment-methods')

  return {
    message: 'Forma de pagamento criada com sucesso.',
    success: true,
  }
}
