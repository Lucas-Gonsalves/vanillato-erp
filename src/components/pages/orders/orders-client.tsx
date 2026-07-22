'use client'

import { Ban, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import type { OrderListItem } from '@/@types'
import { cancelOrder, deleteOrder, updateOrderStatus } from '@/actions/order'
import { PageHeader } from '@/components/page-header'
import { Tooltip } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderStatus } from '@/generated/prisma/enums'
import { useDebouncedRouteSearch } from '@/hooks'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'

type OrdersClientProps = {
  orders: OrderListItem[]
  search: string
  status: string
}

const orderStatusOptions = [
  OrderStatus.PENDING,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
] as const

const orderStatusLabels: Record<OrderStatus, string> = {
  CANCELED: 'Cancelado',
  DELIVERED: 'Entregue',
  IN_PRODUCTION: 'Em produção',
  PENDING: 'Pendente',
  READY: 'Pronto',
}

export function OrdersClient({ orders, search, status }: OrdersClientProps) {
  const router = useRouter()
  const [statusValue, setStatusValue] = useState(status)
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/orders',
    query: statusValue ? { status: statusValue } : {},
  })
  const [orderToCancel, setOrderToCancel] = useState<OrderListItem | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<OrderListItem | null>(null)
  const hasFilters = search.trim().length > 0 || status.trim().length > 0

  const activeOrdersCount = useMemo(
    () => orders.filter((order) => order.status !== OrderStatus.CANCELED).length,
    [orders],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    submitSearch()
  }

  async function handleCancelOrder() {
    if (!orderToCancel) {
      return
    }

    const result = await cancelOrder({ id: orderToCancel.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setOrderToCancel(null)
    router.refresh()
  }

  async function handleDeleteOrder() {
    if (!orderToDelete) {
      return
    }

    const result = await deleteOrder({ id: orderToDelete.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setOrderToDelete(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants())} href="/orders/new">
            <Plus className="size-4" />
            Novo Pedido
          </Link>
        }
        description={`${activeOrdersCount} pedido(s) não cancelados na listagem atual.`}
        title="Pedidos"
      />

      <form className="grid max-w-4xl gap-2 md:grid-cols-[1fr_220px_auto]" onSubmit={handleSearch}>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por cliente, forma de pagamento ou observações"
            value={searchValue}
          />
        </div>
        <Select onChange={(event) => setStatusValue(event.target.value)} value={statusValue}>
          <option value="">Todos os status</option>
          {orderStatusOptions.map((option) => (
            <option key={option} value={option}>
              {orderStatusLabels[option]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {orders.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="min-w-52 space-y-1">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-muted-foreground text-xs">
                          {order.itemsCount} item(ns) - criado em {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.deliveryDate ? formatDate(order.deliveryDate) : 'Sem data'}
                    </TableCell>
                    <TableCell>{order.paymentMethodName}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <OrderStatusSelect orderId={order.id} status={order.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip content={`Editar pedido de ${order.customerName}`}>
                          <Link
                            aria-label={`Editar pedido de ${order.customerName}`}
                            className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}
                            href={`/orders/${order.id}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Tooltip>

                        {order.status !== OrderStatus.CANCELED ? (
                          <Tooltip content={`Cancelar pedido de ${order.customerName}`}>
                            <Button
                              aria-label={`Cancelar pedido de ${order.customerName}`}
                              onClick={() => setOrderToCancel(order)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Ban className="size-4" />
                            </Button>
                          </Tooltip>
                        ) : null}

                        <Tooltip content={`Excluir pedido de ${order.customerName}`}>
                          <Button
                            aria-label={`Excluir pedido de ${order.customerName}`}
                            onClick={() => setOrderToDelete(order)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Tooltip>
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
          action={
            hasFilters ? null : (
              <Link className={cn(buttonVariants())} href="/orders/new">
                <Plus className="size-4" />
                Novo Pedido
              </Link>
            )
          }
          description={
            hasFilters
              ? 'Nenhum pedido foi encontrado com os filtros atuais.'
              : 'Crie pedidos para acompanhar a produção e entrega.'
          }
          title={hasFilters ? 'Nenhum resultado encontrado' : 'Nenhum pedido cadastrado'}
        />
      )}

      <ConfirmDialog
        confirmLabel="Cancelar"
        description={
          orderToCancel
            ? `O pedido de ${orderToCancel.customerName} será marcado como cancelado.`
            : 'O pedido será cancelado.'
        }
        onConfirm={handleCancelOrder}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        open={orderToCancel !== null}
        title="Cancelar pedido"
      />

      <ConfirmDialog
        confirmLabel="Excluir"
        description={
          orderToDelete
            ? `O pedido de ${orderToDelete.customerName} será removido definitivamente. Use esta opção apenas para pedidos criados por engano.`
            : 'O pedido será excluído definitivamente.'
        }
        onConfirm={handleDeleteOrder}
        onOpenChange={(open) => !open && setOrderToDelete(null)}
        open={orderToDelete !== null}
        title="Excluir pedido"
      />
    </div>
  )
}

type OrderStatusSelectProps = {
  orderId: string
  status: OrderStatus
}

function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(nextStatus: OrderStatus) {
    startTransition(() => {
      void updateOrderStatus({ id: orderId, status: nextStatus }).then((result) => {
        if (!result.success) {
          toast.error(result.message)
          return
        }

        toast.success(result.message)
        router.refresh()
      })
    })
  }

  return (
    <div className="flex min-w-44 items-center gap-2">
      <Select
        aria-label="Alterar status do pedido"
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as OrderStatus)}
        value={status}
        className="max-w-33"
      >
        {orderStatusOptions.map((option) => (
          <option key={option} value={option}>
            {orderStatusLabels[option]}
          </option>
        ))}
      </Select>
      <Badge variant={getOrderStatusVariant(status)}>{orderStatusLabels[status]}</Badge>
    </div>
  )
}

function getOrderStatusVariant(status: OrderStatus) {
  if (status === OrderStatus.CANCELED) {
    return 'destructive'
  }

  if (status === OrderStatus.DELIVERED || status === OrderStatus.READY) {
    return 'success'
  }

  if (status === OrderStatus.IN_PRODUCTION) {
    return 'secondary'
  }

  return 'warning'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}
