'use client'

import { CalendarClock, CreditCard, Eye, Search, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import type { AccountReceivableListItem, OrderPaymentMethodOption } from '@/@types'
import {
  cancelReceivablePayment,
  registerReceivablePayment,
  renegotiateReceivable,
} from '@/actions/account-receivable'
import { FinancialStatusBadge } from '@/components/financial'
import { PageHeader } from '@/components/page-header'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDebouncedRouteSearch } from '@/hooks'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'

type AccountsReceivableClientProps = {
  paymentMethods: OrderPaymentMethodOption[]
  receivables: AccountReceivableListItem[]
  search: string
  status: string
}

const statusFilters = [
  { label: 'Todas', value: '' },
  { label: 'Em aberto', value: 'OPEN' },
  { label: 'Vencendo hoje', value: 'DUE_TODAY' },
  { label: 'Esta semana', value: 'THIS_WEEK' },
  { label: 'Vencidas', value: 'OVERDUE' },
  { label: 'Pagas', value: 'PAID' },
  { label: 'Renegociadas', value: 'RENEGOTIATED' },
] as const

export function AccountsReceivableClient({
  paymentMethods,
  receivables,
  search,
  status,
}: AccountsReceivableClientProps) {
  const router = useRouter()
  const [statusValue, setStatusValue] = useState(status)
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/accounts-receivable',
    query: statusValue ? { status: statusValue } : {},
  })
  const [paymentReceivable, setPaymentReceivable] = useState<AccountReceivableListItem | null>(null)
  const [renegotiationReceivable, setRenegotiationReceivable] =
    useState<AccountReceivableListItem | null>(null)
  const [historyReceivable, setHistoryReceivable] = useState<AccountReceivableListItem | null>(null)
  const [paymentToCancel, setPaymentToCancel] = useState<{
    paymentId: string
    receivableId: string
  } | null>(null)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitSearch()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants())} href="/orders/new">
            Novo Pedido
          </Link>
        }
        description="Acompanhe valores em aberto, vencimentos, pagamentos e renegociações."
        title="Contas a Receber"
      />

      <form className="grid max-w-4xl gap-2 md:grid-cols-[1fr_220px_auto]" onSubmit={handleSearch}>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por cliente ou pedido"
            value={searchValue}
          />
        </div>
        <Select onChange={(event) => setStatusValue(event.target.value)} value={statusValue}>
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {receivables.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell>
                      <div className="min-w-48">
                        <p className="font-medium">{receivable.customerName}</p>
                        <Link
                          className="text-muted-foreground hover:text-foreground text-xs"
                          href={`/orders/${receivable.orderId}`}
                        >
                          Ver pedido
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(receivable.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(receivable.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(receivable.paidAmount)}</TableCell>
                    <TableCell>{formatCurrency(receivable.remainingAmount)}</TableCell>
                    <TableCell>
                      <FinancialStatusBadge status={receivable.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label={`Registrar pagamento de ${receivable.customerName}`}
                          onClick={() => setPaymentReceivable(receivable)}
                          size="icon"
                          title="Registrar pagamento"
                          type="button"
                          variant="ghost"
                        >
                          <CreditCard className="size-4" />
                        </Button>
                        <Button
                          aria-label={`Alterar vencimento de ${receivable.customerName}`}
                          onClick={() => setRenegotiationReceivable(receivable)}
                          size="icon"
                          title="Alterar vencimento"
                          type="button"
                          variant="ghost"
                        >
                          <CalendarClock className="size-4" />
                        </Button>
                        <Button
                          aria-label={`Ver histórico de ${receivable.customerName}`}
                          onClick={() => setHistoryReceivable(receivable)}
                          size="icon"
                          title="Ver histórico"
                          type="button"
                          variant="ghost"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <EmptyState
          description="Crie um pedido a prazo para gerar automaticamente uma conta a receber."
          title="Nenhuma conta encontrada"
        />
      )}

      <PaymentModal
        onOpenChange={(open) => !open && setPaymentReceivable(null)}
        paymentMethods={paymentMethods}
        receivable={paymentReceivable}
      />
      <RenegotiationModal
        onOpenChange={(open) => !open && setRenegotiationReceivable(null)}
        receivable={renegotiationReceivable}
      />
      <HistoryModal
        onCancelPayment={(receivableId, paymentId) =>
          setPaymentToCancel({ paymentId, receivableId })
        }
        onOpenChange={(open) => !open && setHistoryReceivable(null)}
        receivable={historyReceivable}
      />
      <ConfirmDialog
        confirmLabel="Cancelar pagamento"
        description="O pagamento será marcado como cancelado, mas permanecerá no histórico."
        onConfirm={async () => {
          if (!paymentToCancel) {
            return
          }

          const result = await cancelReceivablePayment(paymentToCancel)

          if (!result.success) {
            toast.error(result.message)
            return
          }

          toast.success(result.message)
          setPaymentToCancel(null)
          router.refresh()
        }}
        onOpenChange={(open) => !open && setPaymentToCancel(null)}
        open={paymentToCancel !== null}
        title="Cancelar pagamento"
      />
    </div>
  )
}

type PaymentModalProps = {
  onOpenChange: (open: boolean) => void
  paymentMethods: OrderPaymentMethodOption[]
  receivable: AccountReceivableListItem | null
}

function PaymentModal({ onOpenChange, paymentMethods, receivable }: PaymentModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!receivable) {
    return null
  }

  return (
    <Modal
      description={`Saldo restante: ${formatCurrency(receivable.remainingAmount)}`}
      onOpenChange={onOpenChange}
      open={receivable !== null}
      title="Registrar pagamento"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)

          startTransition(() => {
            void registerReceivablePayment({
              amount: String(formData.get('amount') ?? ''),
              note: String(formData.get('note') ?? ''),
              paidAt: String(formData.get('paidAt') ?? ''),
              paymentMethodId: String(formData.get('paymentMethodId') ?? ''),
              receivableId: receivable.id,
            }).then((result) => {
              if (!result.success) {
                toast.error(result.message)
                return
              }

              toast.success(result.message)
              onOpenChange(false)
              router.refresh()
            })
          })
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Valor pago</Label>
            <Input
              id="payment-amount"
              name="amount"
              placeholder="0,00"
              required
              defaultValue={receivable.remainingAmount.replace('.', ',')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">Data real</Label>
            <Input
              defaultValue={new Date().toISOString().slice(0, 10)}
              id="payment-date"
              name="paidAt"
              required
              type="date"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payment-method">Forma utilizada</Label>
            <Select id="payment-method" name="paymentMethodId" required>
              <option value="">Selecione uma forma</option>
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.id} value={paymentMethod.id}>
                  {paymentMethod.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payment-note">Observação</Label>
            <Textarea id="payment-note" name="note" placeholder="Observações do pagamento" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

type RenegotiationModalProps = {
  onOpenChange: (open: boolean) => void
  receivable: AccountReceivableListItem | null
}

function RenegotiationModal({ onOpenChange, receivable }: RenegotiationModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!receivable) {
    return null
  }

  return (
    <Modal
      description={`Vencimento atual: ${formatDate(receivable.dueDate)}`}
      onOpenChange={onOpenChange}
      open={receivable !== null}
      title="Alterar vencimento"
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.currentTarget)

          startTransition(() => {
            void renegotiateReceivable({
              id: receivable.id,
              newDueDate: String(formData.get('newDueDate') ?? ''),
              reason: String(formData.get('reason') ?? ''),
            }).then((result) => {
              if (!result.success) {
                toast.error(result.message)
                return
              }

              toast.success(result.message)
              onOpenChange(false)
              router.refresh()
            })
          })
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="new-due-date">Novo vencimento</Label>
          <Input id="new-due-date" name="newDueDate" required type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="renegotiation-reason">Motivo</Label>
          <Textarea id="renegotiation-reason" name="reason" required />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancelar
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

type HistoryModalProps = {
  onCancelPayment: (receivableId: string, paymentId: string) => void
  onOpenChange: (open: boolean) => void
  receivable: AccountReceivableListItem | null
}

function HistoryModal({ onCancelPayment, onOpenChange, receivable }: HistoryModalProps) {
  if (!receivable) {
    return null
  }

  return (
    <Modal
      description="Pagamentos e eventos financeiros desta conta."
      onOpenChange={onOpenChange}
      open={receivable !== null}
      title="Histórico financeiro"
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Pagamentos</h3>
          {receivable.payments.length > 0 ? (
            receivable.payments.map((payment) => (
              <div
                className="border-border/70 flex items-center justify-between gap-3 rounded-md border p-3"
                key={payment.id}
              >
                <div>
                  <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(payment.paidAt)} - {payment.paymentMethodName ?? 'Forma removida'}
                    {payment.canceledAt ? ' - cancelado' : ''}
                  </p>
                </div>
                {!payment.canceledAt ? (
                  <Button
                    aria-label="Cancelar pagamento"
                    onClick={() => onCancelPayment(receivable.id, payment.id)}
                    size="icon"
                    title="Cancelar pagamento"
                    type="button"
                    variant="ghost"
                  >
                    <XCircle className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum pagamento registrado.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Eventos</h3>
          {receivable.history.map((event) => (
            <div className="border-border/70 rounded-md border p-3" key={event.id}>
              <p className="text-sm font-medium">{getHistoryLabel(event.eventType)}</p>
              <p className="text-muted-foreground text-xs">
                {formatDateTime(event.createdAt)}
                {event.userName ? ` por ${event.userName}` : ''}
              </p>
              {event.note ? <p className="mt-2 text-sm">{event.note}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR')
}

function getHistoryLabel(eventType: AccountReceivableListItem['history'][number]['eventType']) {
  const labels = {
    CANCELED: 'Conta cancelada',
    CREATED: 'Conta criada',
    DUE_DATE_CHANGED: 'Vencimento alterado',
    PAID: 'Conta quitada',
    PAYMENT_CANCELED: 'Pagamento cancelado',
    PAYMENT_REGISTERED: 'Pagamento registrado',
  }

  return labels[eventType]
}
