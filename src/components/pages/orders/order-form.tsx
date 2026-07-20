'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import type { OrderFormData, OrderFormOptions } from '@/@types'
import { createOrder, type OrderInput, orderSchema, updateOrder } from '@/actions/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { OrderItemType } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils'

type OrderFormProps = {
  options: OrderFormOptions
  orderData?: OrderFormData
}

const emptyOrderItem = {
  packageId: '',
  productId: '',
  quantity: 1,
  type: OrderItemType.PRODUCT,
}

export function OrderForm({ options, orderData }: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<OrderInput>({
    defaultValues: {
      customerId: orderData?.customerId ?? '',
      deliveryDate: orderData?.deliveryDate ?? '',
      deliveryFee: orderData ? decimalToInputValue(orderData.deliveryFee) : '',
      discount: orderData ? decimalToInputValue(orderData.discount) : '',
      items: orderData?.items.length ? orderData.items : [emptyOrderItem],
      notes: orderData?.notes ?? '',
      paymentMethodId: orderData?.paymentMethodId ?? '',
    },
    resolver: zodResolver(orderSchema),
  })
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'items',
  })
  const watchedItems = useWatch({
    control,
    name: 'items',
  })

  function onSubmit(values: OrderInput) {
    startTransition(() => {
      const action = orderData ? updateOrder({ ...values, id: orderData.id }) : createOrder(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof OrderInput, { message })
              }
            })
          }

          toast.error(result.message)
          return
        }

        toast.success(result.message)
        router.push('/orders')
        router.refresh()
      })
    })
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do pedido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="order-customer">Cliente</Label>
            <Select id="order-customer" {...register('customerId')}>
              <option value="">Selecione um cliente</option>
              {options.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `- ${customer.phone}` : ''}
                </option>
              ))}
            </Select>
            {errors.customerId?.message ? (
              <p className="text-destructive text-sm">{errors.customerId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-payment-method">Forma de pagamento</Label>
            <Select id="order-payment-method" {...register('paymentMethodId')}>
              <option value="">Selecione uma forma</option>
              {options.paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.id} value={paymentMethod.id}>
                  {paymentMethod.name}
                </option>
              ))}
            </Select>
            {errors.paymentMethodId?.message ? (
              <p className="text-destructive text-sm">{errors.paymentMethodId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-delivery-date">Data de entrega</Label>
            <Input id="order-delivery-date" type="date" {...register('deliveryDate')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-discount">Desconto</Label>
              <Input id="order-discount" placeholder="0,00" {...register('discount')} />
              {errors.discount?.message ? (
                <p className="text-destructive text-sm">{errors.discount.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-delivery-fee">Taxa de entrega</Label>
              <Input id="order-delivery-fee" placeholder="0,00" {...register('deliveryFee')} />
              {errors.deliveryFee?.message ? (
                <p className="text-destructive text-sm">{errors.deliveryFee.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="order-notes">Observações</Label>
            <Textarea
              id="order-notes"
              placeholder="Detalhes de entrega, preferências ou observações internas"
              {...register('notes')}
            />
            {errors.notes?.message ? (
              <p className="text-destructive text-sm">{errors.notes.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Itens do pedido</CardTitle>
          <Button onClick={() => append(emptyOrderItem)} type="button" variant="secondary">
            <Plus className="size-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const currentType = watchedItems[index]?.type ?? OrderItemType.PRODUCT

            return (
              <div
                className="border-border/70 grid gap-3 rounded-md border p-3 lg:grid-cols-[180px_1fr_140px_40px]"
                key={field.id}
              >
                <div className="space-y-2">
                  <Label htmlFor={`order-item-type-${index}`}>Tipo</Label>
                  <Select id={`order-item-type-${index}`} {...register(`items.${index}.type`)}>
                    <option value={OrderItemType.PRODUCT}>Produto</option>
                    <option value={OrderItemType.PACKAGE}>Pacote</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  {currentType === OrderItemType.PRODUCT ? (
                    <>
                      <Label htmlFor={`order-item-product-${index}`}>Produto</Label>
                      <Select
                        id={`order-item-product-${index}`}
                        {...register(`items.${index}.productId`)}
                      >
                        <option value="">Selecione um produto</option>
                        {options.products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({formatCurrency(product.price)})
                          </option>
                        ))}
                      </Select>
                      {errors.items?.[index]?.productId?.message ? (
                        <p className="text-destructive text-sm">
                          {errors.items[index]?.productId?.message}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Label htmlFor={`order-item-package-${index}`}>Pacote</Label>
                      <Select
                        id={`order-item-package-${index}`}
                        {...register(`items.${index}.packageId`)}
                      >
                        <option value="">Selecione um pacote</option>
                        {options.packages.map((packageItem) => (
                          <option key={packageItem.id} value={packageItem.id}>
                            {packageItem.name} ({formatCurrency(packageItem.price)})
                          </option>
                        ))}
                      </Select>
                      {errors.items?.[index]?.packageId?.message ? (
                        <p className="text-destructive text-sm">
                          {errors.items[index]?.packageId?.message}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`order-item-quantity-${index}`}>Quantidade</Label>
                  <Input
                    id={`order-item-quantity-${index}`}
                    min={1}
                    type="number"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  {errors.items?.[index]?.quantity?.message ? (
                    <p className="text-destructive text-sm">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-end">
                  <Button
                    aria-label="Remover item"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })}

          {typeof errors.items?.message === 'string' ? (
            <p className="text-destructive text-sm">{errors.items.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={() => router.push('/orders')} type="button" variant="outline">
          Cancelar
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

function decimalToInputValue(value: string) {
  return value.replace('.', ',')
}
