import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'

const orderStatusLabels = {
  IN_PRODUCTION: 'Em produção',
  PENDING: 'Pendentes',
  READY: 'Prontos',
} as const

export default async function DashboardPage() {
  const [customersCount, pendingOrders, productionOrders, readyOrders, recentCustomers] =
    await Promise.all([
      prisma.customer.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'IN_PRODUCTION' } }),
      prisma.order.count({ where: { status: 'READY' } }),
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
      label: 'Clientes',
      value: customersCount,
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

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos que precisam de atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatusSummary label="Pendentes" value={pendingOrders} variant="warning" />
              <StatusSummary label="Em produção" value={productionOrders} variant="secondary" />
              <StatusSummary label="Prontos" value={readyOrders} variant="success" />
            </div>
          </CardContent>
        </Card>

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
  variant: 'secondary' | 'success' | 'warning'
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
