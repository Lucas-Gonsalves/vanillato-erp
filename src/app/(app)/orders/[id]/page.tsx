import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/page-header'
import { OrderForm } from '@/components/pages/orders'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { OrderItemType, OrderStatus } from '@/generated/prisma/enums'
import prisma from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'

import { findOrderFormOptions } from '../order-form-options'

type EditOrderPageProps = {
  params: Promise<{
    id: string
  }>
}

const orderStatusLabels: Record<OrderStatus, string> = {
  CANCELED: 'Cancelado',
  DELIVERED: 'Entregue',
  IN_PRODUCTION: 'Em produção',
  PENDING: 'Pendente',
  READY: 'Pronto',
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    select: {
      createdAt: true,
      customerId: true,
      deliveryDate: true,
      deliveryFee: true,
      discount: true,
      id: true,
      items: {
        orderBy: {
          id: 'asc',
        },
        select: {
          packageId: true,
          productId: true,
          quantity: true,
          totalPrice: true,
          type: true,
          unitPrice: true,
        },
      },
      notes: true,
      expectedPaymentDate: true,
      expectedPaymentMethodId: true,
      paymentCondition: true,
      paymentMethodId: true,
      paymentNotes: true,
      status: true,
      total: true,
    },
    where: {
      id,
    },
  })

  if (!order) {
    notFound()
  }

  const options = await findOrderFormOptions({
    customerId: order.customerId,
    packageIds: order.items
      .filter((item) => item.type === OrderItemType.PACKAGE && item.packageId)
      .map((item) => item.packageId as string),
    paymentMethodId: order.paymentMethodId,
    productIds: order.items
      .filter((item) => item.type === OrderItemType.PRODUCT && item.productId)
      .map((item) => item.productId as string),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/orders">
            Voltar
          </Link>
        }
        description="Visualize e atualize os dados do pedido."
        title="Editar Pedido"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-border/70 rounded-md border p-4">
          <p className="text-muted-foreground text-sm">Status</p>
          <div className="mt-2">
            <Badge variant={getOrderStatusVariant(order.status)}>
              {orderStatusLabels[order.status]}
            </Badge>
          </div>
        </div>
        <div className="border-border/70 rounded-md border p-4">
          <p className="text-muted-foreground text-sm">Total atual</p>
          <p className="mt-2 text-lg font-semibold">{formatCurrency(order.total.toString())}</p>
        </div>
        <div className="border-border/70 rounded-md border p-4">
          <p className="text-muted-foreground text-sm">Criado em</p>
          <p className="mt-2 text-lg font-semibold">
            {order.createdAt.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <OrderForm
        options={options}
        orderData={{
          customerId: order.customerId,
          deliveryDate: order.deliveryDate ? toDateInputValue(order.deliveryDate) : '',
          deliveryFee: order.deliveryFee.toString(),
          discount: order.discount.toString(),
          id: order.id,
          items: order.items.map((item) => ({
            packageId: item.packageId ?? '',
            productId: item.productId ?? '',
            quantity: item.quantity,
            type: item.type,
          })),
          notes: order.notes ?? '',
          expectedPaymentDate: order.expectedPaymentDate
            ? toDateInputValue(order.expectedPaymentDate)
            : '',
          expectedPaymentMethodId: order.expectedPaymentMethodId ?? '',
          paymentCondition: order.paymentCondition,
          paymentMethodId: order.paymentMethodId,
          paymentNotes: order.paymentNotes ?? '',
        }}
      />
    </div>
  )
}

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10)
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
