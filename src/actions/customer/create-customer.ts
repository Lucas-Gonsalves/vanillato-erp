'use server'

import { revalidatePath } from 'next/cache'

import { normalizeCustomerInput } from '@/actions/customer/customer-normalizer'
import { type CustomerField, type CustomerInput, customerSchema } from '@/actions/customer/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function createCustomer(input: CustomerInput): Promise<ActionResult<CustomerField>> {
  const parsedInput = customerSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  await prisma.customer.create({
    data: normalizeCustomerInput(parsedInput.data),
  })

  revalidatePath('/customers')

  return {
    message: 'Cliente criado com sucesso.',
    success: true,
  }
}
