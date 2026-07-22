import { Badge } from '@/components/ui/badge'
import type { ReceivableStatus } from '@/generated/prisma/enums'

const receivableStatusLabels: Record<ReceivableStatus, string> = {
  CANCELED: 'Cancelada',
  OPEN: 'Em aberto',
  OVERDUE: 'Vencida',
  PAID: 'Paga',
  PARTIALLY_PAID: 'Pago parcial',
}

type FinancialStatusBadgeProps = {
  status: ReceivableStatus
}

export function FinancialStatusBadge({ status }: FinancialStatusBadgeProps) {
  return (
    <Badge variant={getReceivableStatusVariant(status)}>{receivableStatusLabels[status]}</Badge>
  )
}

function getReceivableStatusVariant(status: ReceivableStatus) {
  if (status === 'CANCELED' || status === 'OVERDUE') {
    return 'destructive'
  }

  if (status === 'PAID') {
    return 'success'
  }

  if (status === 'PARTIALLY_PAID') {
    return 'secondary'
  }

  return 'warning'
}
