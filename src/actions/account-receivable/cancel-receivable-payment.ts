'use server'

import { revalidatePath } from 'next/cache'

import { calculateReceivableAmounts } from '@/actions/account-receivable/receivable-status'
import {
  type CancelReceivablePaymentInput,
  cancelReceivablePaymentSchema,
} from '@/actions/account-receivable/schema'
import type { ActionResult } from '@/actions/types'
import { ReceivableHistoryEventType } from '@/generated/prisma/enums'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function cancelReceivablePayment(
  input: CancelReceivablePaymentInput,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  const parsedInput = cancelReceivablePaymentSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Pagamento inválido.',
      success: false,
    }
  }

  await prisma.$transaction(async (transaction) => {
    const payment = await transaction.accountReceivablePayment.update({
      data: {
        canceledAt: new Date(),
      },
      where: {
        id: parsedInput.data.paymentId,
        receivableId: parsedInput.data.receivableId,
      },
    })
    const receivable = await transaction.accountReceivable.findUniqueOrThrow({
      include: {
        payments: {
          where: {
            canceledAt: null,
          },
        },
      },
      where: {
        id: parsedInput.data.receivableId,
      },
    })
    const amounts = calculateReceivableAmounts(receivable)

    await transaction.accountReceivable.update({
      data: amounts,
      where: {
        id: receivable.id,
      },
    })

    await transaction.accountReceivableHistory.create({
      data: {
        eventType: ReceivableHistoryEventType.PAYMENT_CANCELED,
        oldValue: payment.amount.toString(),
        note: normalizeOptionalText(parsedInput.data.note) ?? 'Pagamento cancelado.',
        receivableId: receivable.id,
        userId: user?.id,
      },
    })
  })

  revalidatePath('/accounts-receivable')
  revalidatePath('/financial')
  revalidatePath('/dashboard')

  return {
    message: 'Pagamento cancelado com sucesso.',
    success: true,
  }
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
