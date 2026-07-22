import { ReceivableStatus } from '@/generated/prisma/enums'
import { centsToDecimalString, decimalStringToCents, getReceivableStatus } from '@/utils'

type ReceivableAmountState = {
  dueDate: Date
  payments: {
    amount: {
      toString(): string
    }
  }[]
  totalAmount: {
    toString(): string
  }
}

export function calculateReceivableAmounts(receivable: ReceivableAmountState) {
  const totalInCents = decimalStringToCents(receivable.totalAmount.toString())
  const paidInCents = receivable.payments.reduce(
    (total, payment) => total + decimalStringToCents(payment.amount.toString()),
    0,
  )
  const remainingInCents = Math.max(totalInCents - paidInCents, 0)
  const status = getReceivableStatus({
    dueDate: receivable.dueDate,
    paidInCents,
    totalInCents,
  })

  return {
    paidAmount: centsToDecimalString(paidInCents),
    remainingAmount: centsToDecimalString(remainingInCents),
    status:
      status === ReceivableStatus.OVERDUE && paidInCents > 0
        ? ReceivableStatus.PARTIALLY_PAID
        : status,
  }
}
