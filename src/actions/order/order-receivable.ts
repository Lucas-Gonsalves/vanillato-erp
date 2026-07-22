import type { PrismaClient } from '@/generated/prisma/client'
import {
  PaymentCondition,
  ReceivableHistoryEventType,
  ReceivableStatus,
} from '@/generated/prisma/enums'
import { centsToDecimalString, decimalStringToCents } from '@/utils'

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

type SyncOrderReceivableParams = {
  customerId: string
  dueDate: Date | null
  note: string | null
  orderId: string
  paymentCondition: PaymentCondition
  total: string
  userId: string | null
}

export async function syncOrderReceivable(
  transaction: TransactionClient,
  {
    customerId,
    dueDate,
    note,
    orderId,
    paymentCondition,
    total,
    userId,
  }: SyncOrderReceivableParams,
) {
  const existingReceivable = await transaction.accountReceivable.findUnique({
    include: {
      payments: {
        where: {
          canceledAt: null,
        },
      },
    },
    where: {
      orderId,
    },
  })

  if (paymentCondition === PaymentCondition.CASH) {
    if (existingReceivable && existingReceivable.status !== ReceivableStatus.CANCELED) {
      await transaction.accountReceivable.update({
        data: {
          status: ReceivableStatus.CANCELED,
        },
        where: {
          id: existingReceivable.id,
        },
      })

      await createReceivableHistory(transaction, {
        eventType: ReceivableHistoryEventType.CANCELED,
        newValue: ReceivableStatus.CANCELED,
        note: 'Conta cancelada porque o pedido foi alterado para pagamento à vista.',
        receivableId: existingReceivable.id,
        userId,
      })
    }

    return
  }

  if (!dueDate) {
    return
  }

  const totalInCents = decimalStringToCents(total)
  const paidInCents =
    existingReceivable?.payments.reduce(
      (sum, payment) => sum + decimalStringToCents(payment.amount.toString()),
      0,
    ) ?? 0
  const remainingInCents = Math.max(totalInCents - paidInCents, 0)
  const status =
    paidInCents >= totalInCents
      ? ReceivableStatus.PAID
      : paidInCents > 0
        ? ReceivableStatus.PARTIALLY_PAID
        : ReceivableStatus.OPEN

  if (!existingReceivable) {
    const receivable = await transaction.accountReceivable.create({
      data: {
        customerId,
        dueDate,
        note,
        orderId,
        paidAmount: '0.00',
        remainingAmount: total,
        status,
        totalAmount: total,
      },
    })

    await createReceivableHistory(transaction, {
      eventType: ReceivableHistoryEventType.CREATED,
      newValue: total,
      note: note ?? 'Conta a receber criada automaticamente pelo pedido.',
      receivableId: receivable.id,
      userId,
    })

    return
  }

  const oldDueDate = existingReceivable.dueDate
  await transaction.accountReceivable.update({
    data: {
      customerId,
      dueDate,
      note,
      remainingAmount: centsToDecimalString(remainingInCents),
      status,
      totalAmount: total,
    },
    where: {
      id: existingReceivable.id,
    },
  })

  if (oldDueDate.getTime() !== dueDate.getTime()) {
    await createReceivableHistory(transaction, {
      eventType: ReceivableHistoryEventType.DUE_DATE_CHANGED,
      oldValue: oldDueDate.toISOString(),
      newValue: dueDate.toISOString(),
      note: 'Vencimento atualizado pela edição do pedido.',
      receivableId: existingReceivable.id,
      userId,
    })
  }
}

type CreateReceivableHistoryParams = {
  eventType: ReceivableHistoryEventType
  newValue?: string
  note?: string | null
  oldValue?: string
  receivableId: string
  userId: string | null
}

export function createReceivableHistory(
  transaction: TransactionClient,
  { eventType, newValue, note, oldValue, receivableId, userId }: CreateReceivableHistoryParams,
) {
  return transaction.accountReceivableHistory.create({
    data: {
      eventType,
      newValue,
      note,
      oldValue,
      receivableId,
      userId,
    },
  })
}

export type ReceivableTransactionClient = TransactionClient
