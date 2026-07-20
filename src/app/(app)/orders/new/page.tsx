import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { OrderForm } from '@/components/pages/orders'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { findOrderFormOptions } from '../order-form-options'

export default async function NewOrderPage() {
  const options = await findOrderFormOptions()

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/orders">
            Voltar
          </Link>
        }
        description="Crie um pedido com cliente, forma de pagamento e itens."
        title="Novo Pedido"
      />
      <OrderForm options={options} />
    </div>
  )
}
