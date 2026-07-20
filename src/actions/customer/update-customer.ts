'use server'

import { revalidatePath } from 'next/cache'

import { normalizeCustomerInput } from '@/actions/customer/customer-normalizer'
import {
  type CustomerField,
  type UpdateCustomerInput,
  updateCustomerSchema,
} from '@/actions/customer/schema'
import type { ActionResult } from '@/actions/types'
import prisma from '@/lib/prisma'

export async function updateCustomer(
  input: UpdateCustomerInput,
): Promise<ActionResult<CustomerField>> {
  const parsedInput = updateCustomerSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      fieldErrors: parsedInput.error.flatten().fieldErrors,
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const { id, ...customerInput } = parsedInput.data

  await prisma.customer.update({
    data: normalizeCustomerInput(customerInput),
    where: {
      id,
    },
  })

  revalidatePath('/customers')

  return {
    message: 'Cliente atualizado com sucesso.',
    success: true,
  }
}
