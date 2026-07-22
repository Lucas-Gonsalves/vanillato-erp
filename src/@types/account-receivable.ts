import type { ReceivableHistoryEventType, ReceivableStatus } from '@/generated/prisma/enums'

export type AccountReceivableListItem = {
  customerName: string
  dueDate: string
  history: {
    createdAt: string
    eventType: ReceivableHistoryEventType
    id: string
    note: string | null
    userName: string | null
  }[]
  id: string
  orderId: string
  paidAmount: string
  payments: {
    amount: string
    canceledAt: string | null
    id: string
    paidAt: string
    paymentMethodName: string | null
  }[]
  remainingAmount: string
  status: ReceivableStatus
  totalAmount: string
}
