'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { ProductListItem, ProductSubcategoryOption } from '@/@types'
import { createProduct, type ProductInput, productSchema, updateProduct } from '@/actions/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type ProductFormProps = {
  onSuccess: () => void
  product?: ProductListItem
  subcategories: ProductSubcategoryOption[]
}

export function ProductForm({ onSuccess, product, subcategories }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ProductInput>({
    defaultValues: {
      costPrice: product?.costPrice ? decimalToInputValue(product.costPrice) : '',
      name: product?.name ?? '',
      salePrice: product ? decimalToInputValue(product.salePrice) : '',
      subcategoryId: product?.subcategoryId ?? subcategories[0]?.id ?? '',
    },
    resolver: zodResolver(productSchema),
  })

  function onSubmit(values: ProductInput) {
    startTransition(() => {
      const action = product ? updateProduct({ ...values, id: product.id }) : createProduct(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof ProductInput, { message })
              }
            })
          }

          toast.error(result.message)
          return
        }

        toast.success(result.message)
        onSuccess()
        router.refresh()
      })
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product-name">Nome</Label>
          <Input
            autoFocus
            id="product-name"
            placeholder="Ex.: Bolo de chocolate"
            {...register('name')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-sale-price">Preço de venda</Label>
          <Input id="product-sale-price" placeholder="0,00" {...register('salePrice')} />
          {errors.salePrice?.message ? (
            <p className="text-destructive text-sm">{errors.salePrice.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-cost-price">Preço de custo</Label>
          <Input id="product-cost-price" placeholder="0,00" {...register('costPrice')} />
          {errors.costPrice?.message ? (
            <p className="text-destructive text-sm">{errors.costPrice.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product-subcategory">Subcategoria</Label>
          <Select id="product-subcategory" {...register('subcategoryId')}>
            <option value="">Selecione uma subcategoria</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.categoryName} / {subcategory.name}
              </option>
            ))}
          </Select>
          {errors.subcategoryId?.message ? (
            <p className="text-destructive text-sm">{errors.subcategoryId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={onSuccess} type="button" variant="outline">
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
