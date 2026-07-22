'use server'

import { revalidatePath } from 'next/cache'

import {
  type RenegotiateReceivableInput,
  renegotiateReceivableSchema,
} from '@/actions/account-receivable/schema'
import type { ActionResult } from '@/actions/types'
import { ReceivableHistoryEventType } from '@/generated/prisma/enums'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function renegotiateReceivable(
  input: RenegotiateReceivableInput,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  const parsedInput = renegotiateReceivableSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const newDueDate = new Date(`${parsedInput.data.newDueDate}T00:00:00`)

  await prisma.$transaction(async (transaction) => {
    const receivable = await transaction.accountReceivable.findUniqueOrThrow({
      where: {
        id: parsedInput.data.id,
      },
    })

    await transaction.accountReceivable.update({
      data: {
        dueDate: newDueDate,
      },
      where: {
        id: receivable.id,
      },
    })

    await transaction.accountReceivableRenegotiation.create({
      data: {
        newDueDate,
        oldDueDate: receivable.dueDate,
        reason: parsedInput.data.reason.trim(),
        receivableId: receivable.id,
        userId: user?.id,
      },
    })

    await transaction.accountReceivableHistory.create({
      data: {
        eventType: ReceivableHistoryEventType.DUE_DATE_CHANGED,
        newValue: newDueDate.toISOString(),
        note: parsedInput.data.reason.trim(),
        oldValue: receivable.dueDate.toISOString(),
        receivableId: receivable.id,
        userId: user?.id,
      },
    })
  })

  revalidatePath('/accounts-receivable')
  revalidatePath('/financial')
  revalidatePath('/dashboard')

  return {
    message: 'Vencimento atualizado com sucesso.',
    success: true,
  }
}
