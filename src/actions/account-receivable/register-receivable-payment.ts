'use server'

import { revalidatePath } from 'next/cache'

import { calculateReceivableAmounts } from '@/actions/account-receivable/receivable-status'
import {
  type RegisterReceivablePaymentInput,
  registerReceivablePaymentSchema,
} from '@/actions/account-receivable/schema'
import type { ActionResult } from '@/actions/types'
import { ReceivableHistoryEventType } from '@/generated/prisma/enums'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { parseCurrencyToDecimalString } from '@/utils'

export async function registerReceivablePayment(
  input: RegisterReceivablePaymentInput,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  const parsedInput = registerReceivablePaymentSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      message: 'Verifique os campos informados.',
      success: false,
    }
  }

  const amount = parseCurrencyToDecimalString(parsedInput.data.amount)

  if (!amount) {
    return {
      message: 'Valor inválido.',
      success: false,
    }
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.accountReceivablePayment.create({
      data: {
        amount,
        createdById: user?.id,
        note: normalizeOptionalText(parsedInput.data.note),
        paidAt: new Date(`${parsedInput.data.paidAt}T00:00:00`),
        paymentMethodId: parsedInput.data.paymentMethodId,
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
        eventType: ReceivableHistoryEventType.PAYMENT_REGISTERED,
        newValue: amount,
        note: normalizeOptionalText(parsedInput.data.note),
        receivableId: receivable.id,
        userId: user?.id,
      },
    })

    if (amounts.status === 'PAID') {
      await transaction.accountReceivableHistory.create({
        data: {
          eventType: ReceivableHistoryEventType.PAID,
          newValue: amounts.paidAmount,
          note: 'Conta quitada automaticamente.',
          receivableId: receivable.id,
          userId: user?.id,
        },
      })
    }
  })

  revalidatePath('/accounts-receivable')
  revalidatePath('/financial')
  revalidatePath('/dashboard')

  return {
    message: 'Pagamento registrado com sucesso.',
    success: true,
  }
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
