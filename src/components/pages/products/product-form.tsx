'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
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
    setValue,
  } = useForm<ProductInput>({
    defaultValues: {
      costPrice: product?.costPrice ? decimalToInputValue(product.costPrice) : '',
      name: product?.name ?? '',
      salePrice: product ? decimalToInputValue(product.salePrice) : '',
      subcategoryId: product?.subcategoryId ?? subcategories[0]?.id ?? '',
    },
    resolver: zodResolver(productSchema),
  })
  const initialCategoryId =
    subcategories.find((subcategory) => subcategory.id === product?.subcategoryId)?.categoryId ??
    subcategories[0]?.categoryId ??
    ''
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          subcategories.map((subcategory) => [
            subcategory.categoryId,
            {
              id: subcategory.categoryId,
              name: subcategory.categoryName,
            },
          ]),
        ).values(),
      ),
    [subcategories],
  )
  const filteredSubcategories = useMemo(
    () => subcategories.filter((subcategory) => subcategory.categoryId === categoryId),
    [categoryId, subcategories],
  )

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

        <div className="space-y-2">
          <Label htmlFor="product-category">Categoria</Label>
          <Select
            id="product-category"
            onChange={(event) => {
              setCategoryId(event.target.value)
              setValue('subcategoryId', '', { shouldDirty: true, shouldValidate: true })
            }}
            value={categoryId}
          >
            <option value="">Selecione uma categoria</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-subcategory">Subcategoria</Label>
          <Select id="product-subcategory" {...register('subcategoryId')}>
            <option value="">Selecione uma subcategoria</option>
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
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
