import { ReceivableStatus } from '@/generated/prisma/enums'

export function calculateRemainingAmountInCents(totalInCents: number, paidInCents: number) {
  return Math.max(totalInCents - paidInCents, 0)
}

export function getReceivableStatus({
  dueDate,
  paidInCents,
  totalInCents,
}: {
  dueDate: Date
  paidInCents: number
  totalInCents: number
}) {
  if (paidInCents >= totalInCents) {
    return ReceivableStatus.PAID
  }

  if (paidInCents > 0) {
    return ReceivableStatus.PARTIALLY_PAID
  }

  if (isPastDate(dueDate)) {
    return ReceivableStatus.OVERDUE
  }

  return ReceivableStatus.OPEN
}

export function isPastDate(date: Date, referenceDate = new Date()) {
  return startOfDay(date).getTime() < startOfDay(referenceDate).getTime()
}

export function isSameDate(firstDate: Date, secondDate = new Date()) {
  return startOfDay(firstDate).getTime() === startOfDay(secondDate).getTime()
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}
