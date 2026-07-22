'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import type { OrderFormData, OrderFormOptions } from '@/@types'
import { createOrder, type OrderInput, orderSchema, updateOrder } from '@/actions/order'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { OrderItemType, PaymentCondition } from '@/generated/prisma/enums'
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
    setValue,
  } = useForm<OrderInput>({
    defaultValues: {
      customerId: orderData?.customerId ?? '',
      deliveryDate: orderData?.deliveryDate ?? '',
      deliveryFee: orderData ? decimalToInputValue(orderData.deliveryFee) : '',
      discount: orderData ? decimalToInputValue(orderData.discount) : '',
      items: orderData?.items.length ? orderData.items : [emptyOrderItem],
      notes: orderData?.notes ?? '',
      expectedPaymentDate: orderData?.expectedPaymentDate ?? '',
      expectedPaymentMethodId: orderData?.expectedPaymentMethodId ?? '',
      paymentCondition: orderData?.paymentCondition ?? PaymentCondition.CASH,
      paymentMethodId: orderData?.paymentMethodId ?? '',
      paymentNotes: orderData?.paymentNotes ?? '',
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
  const customerId = useWatch({
    control,
    name: 'customerId',
  })
  const selectedCustomer = options.customers.find((customer) => customer.id === customerId)
  const paymentCondition = useWatch({
    control,
    name: 'paymentCondition',
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
            <input type="hidden" {...register('customerId')} />
            <CustomerPicker
              customers={options.customers}
              onSelect={(nextCustomerId) =>
                setValue('customerId', nextCustomerId, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              selectedLabel={
                selectedCustomer
                  ? `${selectedCustomer.name}${selectedCustomer.phone ? ` - ${selectedCustomer.phone}` : ''}`
                  : 'Selecione um cliente'
              }
            />
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
            <Label htmlFor="order-payment-condition">Condição de pagamento</Label>
            <Select id="order-payment-condition" {...register('paymentCondition')}>
              <option value={PaymentCondition.CASH}>À vista</option>
              <option value={PaymentCondition.CREDIT}>A prazo</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-delivery-date">Data de entrega</Label>
            <Input id="order-delivery-date" type="date" {...register('deliveryDate')} />
          </div>

          {paymentCondition === PaymentCondition.CREDIT ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="order-expected-payment-date">Data prevista de pagamento</Label>
                <Input
                  id="order-expected-payment-date"
                  type="date"
                  {...register('expectedPaymentDate')}
                />
                {errors.expectedPaymentDate?.message ? (
                  <p className="text-destructive text-sm">{errors.expectedPaymentDate.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-expected-payment-method">Forma prevista</Label>
                <Select id="order-expected-payment-method" {...register('expectedPaymentMethodId')}>
                  <option value="">Selecione uma forma</option>
                  {options.paymentMethods.map((paymentMethod) => (
                    <option key={paymentMethod.id} value={paymentMethod.id}>
                      {paymentMethod.name}
                    </option>
                  ))}
                </Select>
                {errors.expectedPaymentMethodId?.message ? (
                  <p className="text-destructive text-sm">
                    {errors.expectedPaymentMethodId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="order-payment-notes">Observação do pagamento</Label>
                <Textarea
                  id="order-payment-notes"
                  placeholder="Condição combinada, observações de cobrança ou previsão"
                  {...register('paymentNotes')}
                />
                {errors.paymentNotes?.message ? (
                  <p className="text-destructive text-sm">{errors.paymentNotes.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

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
                    <ProductPicker
                      error={errors.items?.[index]?.productId?.message}
                      index={index}
                      onSelect={(productId) =>
                        setValue(`items.${index}.productId`, productId, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      products={options.products}
                      registerProduct={register(`items.${index}.productId`)}
                      selectedProductId={watchedItems[index]?.productId ?? ''}
                    />
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

type CustomerPickerProps = {
  customers: OrderFormOptions['customers']
  onSelect: (customerId: string) => void
  selectedLabel: string
}

function CustomerPicker({ customers, onSelect, selectedLabel }: CustomerPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return customers
    }

    return customers.filter((customer) =>
      `${customer.name} ${customer.phone ?? ''}`.toLowerCase().includes(normalizedSearch),
    )
  }, [customers, search])

  return (
    <>
      <Button
        className="w-full justify-between"
        id="order-customer"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        <span className="truncate">{selectedLabel}</span>
        <Search className="size-4" />
      </Button>

      <Modal
        description="Busque e selecione o cliente do pedido."
        onOpenChange={setIsOpen}
        open={isOpen}
        title="Selecionar cliente"
      >
        <div className="space-y-4">
          <Input
            autoFocus
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou telefone"
            value={search}
          />
          <div className="border-border/70 max-h-80 overflow-y-auto rounded-md border">
            {filteredCustomers.map((customer) => (
              <button
                className="hover:bg-muted/50 flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm"
                key={customer.id}
                onClick={() => {
                  onSelect(customer.id)
                  setIsOpen(false)
                }}
                type="button"
              >
                <span className="font-medium">{customer.name}</span>
                <span className="text-muted-foreground">{customer.phone ?? 'Sem telefone'}</span>
              </button>
            ))}
            {filteredCustomers.length === 0 ? (
              <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                Nenhum cliente encontrado.
              </p>
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  )
}

type ProductPickerProps = {
  error?: string
  index: number
  onSelect: (productId: string) => void
  products: OrderFormOptions['products']
  registerProduct: UseFormRegisterReturn
  selectedProductId: string
}

function ProductPicker({
  error,
  index,
  onSelect,
  products,
  registerProduct,
  selectedProductId,
}: ProductPickerProps) {
  const selectedProduct = products.find((product) => product.id === selectedProductId)
  const [categoryId, setCategoryId] = useState(selectedProduct?.categoryId ?? '')
  const [subcategoryId, setSubcategoryId] = useState(selectedProduct?.subcategoryId ?? '')
  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          products.map((product) => [
            product.categoryId,
            {
              id: product.categoryId,
              name: product.categoryName,
            },
          ]),
        ).values(),
      ),
    [products],
  )
  const subcategories = useMemo(
    () =>
      Array.from(
        new Map(
          products
            .filter((product) => product.categoryId === categoryId)
            .map((product) => [
              product.subcategoryId,
              {
                id: product.subcategoryId,
                name: product.subcategoryName,
              },
            ]),
        ).values(),
      ),
    [categoryId, products],
  )
  const filteredProducts = useMemo(
    () => products.filter((product) => product.subcategoryId === subcategoryId),
    [products, subcategoryId],
  )

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input type="hidden" {...registerProduct} />
      <div className="space-y-2">
        <Label htmlFor={`order-item-category-${index}`}>Categoria</Label>
        <Select
          id={`order-item-category-${index}`}
          onChange={(event) => {
            setCategoryId(event.target.value)
            setSubcategoryId('')
            onSelect('')
          }}
          value={categoryId}
        >
          <option value="">Categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`order-item-subcategory-${index}`}>Subcategoria</Label>
        <Select
          id={`order-item-subcategory-${index}`}
          onChange={(event) => {
            setSubcategoryId(event.target.value)
            onSelect('')
          }}
          value={subcategoryId}
        >
          <option value="">Subcategoria</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`order-item-product-${index}`}>Produto</Label>
        <Select
          id={`order-item-product-${index}`}
          onChange={(event) => onSelect(event.target.value)}
          value={selectedProductId}
        >
          <option value="">Produto</option>
          {filteredProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({formatCurrency(product.price)})
            </option>
          ))}
        </Select>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    </div>
  )
}
