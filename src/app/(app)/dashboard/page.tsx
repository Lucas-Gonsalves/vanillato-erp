import { Plus, ReceiptText, ShoppingBag, Users } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'

const orderStatusLabels = {
  CANCELED: 'Cancelado',
  DELIVERED: 'Entregue',
  IN_PRODUCTION: 'Em produção',
  PENDING: 'Pendentes',
  READY: 'Prontos',
} as const

export default async function DashboardPage() {
  const [
    pendingOrders,
    productionOrders,
    readyOrders,
    overdueOrders,
    recentCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.IN_PRODUCTION } }),
    prisma.order.count({ where: { status: OrderStatus.READY } }),
    prisma.order.count({
      where: {
        deliveryDate: {
          lt: new Date(),
        },
        status: {
          in: [OrderStatus.PENDING, OrderStatus.IN_PRODUCTION, OrderStatus.READY],
        },
      },
    }),
    prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        id: true,
        name: true,
        phone: true,
      },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        customer: {
          select: {
            name: true,
          },
        },
        deliveryDate: true,
        id: true,
        status: true,
        total: true,
      },
      take: 5,
    }),
  ])

  const operationalCards = [
    {
      label: orderStatusLabels.PENDING,
      value: pendingOrders,
    },
    {
      label: orderStatusLabels.IN_PRODUCTION,
      value: productionOrders,
    },
    {
      label: orderStatusLabels.READY,
      value: readyOrders,
    },
    {
      label: 'Atrasados',
      value: overdueOrders,
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {operationalCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-wrap gap-2">
        <Link className={cn(buttonVariants())} href="/orders/new">
          <Plus className="size-4" />
          Novo Pedido
        </Link>
        <Link
          className={cn(buttonVariants({ variant: 'secondary' }))}
          href="/orders?status=PENDING"
        >
          <ReceiptText className="size-4" />
          Pendentes
        </Link>
        <Link className={cn(buttonVariants({ variant: 'secondary' }))} href="/customers">
          <Users className="size-4" />
          Clientes
        </Link>
        <Link className={cn(buttonVariants({ variant: 'secondary' }))} href="/products">
          <ShoppingBag className="size-4" />
          Produtos
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos que precisam de atenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatusSummary label="Pendentes" value={pendingOrders} variant="warning" />
                <StatusSummary label="Em produção" value={productionOrders} variant="secondary" />
                <StatusSummary label="Prontos" value={readyOrders} variant="success" />
                <StatusSummary label="Atrasados" value={overdueOrders} variant="destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      className="hover:bg-muted/40 flex items-center justify-between gap-3 rounded-md p-2 transition-colors"
                      href={`/orders/${order.id}`}
                      key={order.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{order.customer.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {order.deliveryDate
                            ? `Entrega em ${order.deliveryDate.toLocaleDateString('pt-BR')}`
                            : 'Sem data de entrega'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge variant={getOrderStatusVariant(order.status)}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatCurrency(order.total.toString())}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum pedido cadastrado ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clientes recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCustomers.length > 0 ? (
              <div className="space-y-3">
                {recentCustomers.map((customer) => (
                  <div className="flex items-center justify-between gap-3" key={customer.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{customer.name}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {customer.phone ?? 'Sem telefone'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {customer.createdAt.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum cliente cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

type StatusSummaryProps = {
  label: string
  value: number
  variant: 'destructive' | 'secondary' | 'success' | 'warning'
}

function getOrderStatusVariant(status: keyof typeof orderStatusLabels) {
  if (status === 'CANCELED') {
    return 'destructive'
  }

  if (status === 'DELIVERED' || status === 'READY') {
    return 'success'
  }

  if (status === 'IN_PRODUCTION') {
    return 'secondary'
  }

  return 'warning'
}

function StatusSummary({ label, value, variant }: StatusSummaryProps) {
  return (
    <div className="border-border/70 rounded-md border p-4">
      <div className="mb-3">
        <Badge variant={variant}>{label}</Badge>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
