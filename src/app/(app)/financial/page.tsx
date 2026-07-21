import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Prisma } from '@/generated/prisma/client'
import { OrderItemType, OrderStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'
import { formatCurrency } from '@/utils'

export default async function FinancialPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [orders, openOrders] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: {
            package: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            product: true,
          },
        },
        paymentMethod: true,
      },
      where: {
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
        status: {
          not: OrderStatus.CANCELED,
        },
      },
    }),
    prisma.order.findMany({
      select: {
        total: true,
      },
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.IN_PRODUCTION, OrderStatus.READY],
        },
      },
    }),
  ])

  const revenueInCents = orders.reduce((total, order) => total + decimalToCents(order.total), 0)
  const costInCents = orders.reduce(
    (total, order) => total + order.items.reduce((sum, item) => sum + getItemCostInCents(item), 0),
    0,
  )
  const grossProfitInCents = revenueInCents - costInCents
  const openAmountInCents = openOrders.reduce(
    (total, order) => total + decimalToCents(order.total),
    0,
  )
  const paymentTotals = getPaymentTotals(orders)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Receita do mês" value={formatCents(revenueInCents)} />
        <MetricCard label="Custo estimado" value={formatCents(costInCents)} />
        <MetricCard label="Lucro bruto" value={formatCents(grossProfitInCents)} />
        <MetricCard label="Em aberto" value={formatCents(openAmountInCents)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Receita por forma de pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentTotals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forma</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTotals.map((paymentTotal) => (
                    <TableRow key={paymentTotal.name}>
                      <TableCell>{paymentTotal.name}</TableCell>
                      <TableCell>{paymentTotal.ordersCount}</TableCell>
                      <TableCell className="text-right">
                        {formatCents(paymentTotal.amountInCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum pedido financeiro encontrado neste mês.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SummaryRow label="Pedidos considerados" value={String(orders.length)} />
            <SummaryRow
              label="Margem bruta"
              value={formatPercentage(revenueInCents, grossProfitInCents)}
            />
            <SummaryRow label="Despesas operacionais" value="Não cadastradas" />
            <SummaryRow label="Lucro líquido" value={formatCents(grossProfitInCents)} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

type FinancialOrder = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        package: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
        product: true
      }
    }
    paymentMethod: true
  }
}>
type FinancialOrderItem = FinancialOrder['items'][number]

function getItemCostInCents(item: FinancialOrderItem) {
  if (item.type === OrderItemType.PRODUCT) {
    return decimalToCents(item.product?.costPrice) * item.quantity
  }

  const packageCost =
    item.package?.items.reduce(
      (total, packageItem) =>
        total + decimalToCents(packageItem.product.costPrice) * packageItem.quantity,
      0,
    ) ?? 0

  return packageCost * item.quantity
}

function getPaymentTotals(orders: FinancialOrder[]) {
  const totals = new Map<string, { amountInCents: number; name: string; ordersCount: number }>()

  orders.forEach((order) => {
    const current = totals.get(order.paymentMethod.name) ?? {
      amountInCents: 0,
      name: order.paymentMethod.name,
      ordersCount: 0,
    }

    totals.set(order.paymentMethod.name, {
      ...current,
      amountInCents: current.amountInCents + decimalToCents(order.total),
      ordersCount: current.ordersCount + 1,
    })
  })

  return Array.from(totals.values()).sort(
    (first, second) => second.amountInCents - first.amountInCents,
  )
}

function decimalToCents(value: { toString(): string } | null | undefined) {
  if (!value) {
    return 0
  }

  return Math.round(Number(value.toString()) * 100)
}

function formatCents(value: number) {
  return formatCurrency((value / 100).toFixed(2))
}

function formatPercentage(baseInCents: number, valueInCents: number) {
  if (baseInCents === 0) {
    return '0%'
  }

  return `${((valueInCents / baseInCents) * 100).toFixed(1).replace('.', ',')}%`
}

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

type SummaryRowProps = {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
