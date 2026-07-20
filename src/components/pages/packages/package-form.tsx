'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { PackageFormData, PackageProductOption } from '@/@types'
import { createPackage, type PackageInput, packageSchema, updatePackage } from '@/actions/package'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/utils'

type PackageFormProps = {
  packageData?: PackageFormData
  productOptions: PackageProductOption[]
}

const emptyItem = {
  productId: '',
  quantity: 1,
}

export function PackageForm({ packageData, productOptions }: PackageFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<PackageInput>({
    defaultValues: {
      items: packageData?.items.length ? packageData.items : [emptyItem],
      name: packageData?.name ?? '',
      salePrice: packageData ? decimalToInputValue(packageData.salePrice) : '',
    },
    resolver: zodResolver(packageSchema),
  })
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'items',
  })

  function onSubmit(values: PackageInput) {
    startTransition(() => {
      const action = packageData
        ? updatePackage({ ...values, id: packageData.id })
        : createPackage(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof PackageInput, { message })
              }
            })
          }

          toast.error(result.message)
          return
        }

        toast.success(result.message)
        router.push('/packages')
        router.refresh()
      })
    })
  }

  if (productOptions.length === 0) {
    return (
      <EmptyState
        description="Cadastre ao menos um produto ativo antes de montar pacotes."
        title="Nenhum produto disponível"
      />
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Dados do pacote</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="package-name">Nome</Label>
            <Input autoFocus id="package-name" placeholder="Ex.: Kit festa" {...register('name')} />
            {errors.name?.message ? (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-sale-price">Preço de venda</Label>
            <Input id="package-sale-price" placeholder="0,00" {...register('salePrice')} />
            {errors.salePrice?.message ? (
              <p className="text-destructive text-sm">{errors.salePrice.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Produtos do pacote</CardTitle>
          <Button onClick={() => append(emptyItem)} type="button" variant="secondary">
            <Plus className="size-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              className="border-border/70 grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_140px_40px]"
              key={field.id}
            >
              <div className="space-y-2">
                <Label htmlFor={`package-item-product-${index}`}>Produto</Label>
                <Select
                  id={`package-item-product-${index}`}
                  {...register(`items.${index}.productId`)}
                >
                  <option value="">Selecione um produto</option>
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.subcategoryName} (
                      {formatCurrency(product.salePrice)})
                    </option>
                  ))}
                </Select>
                {errors.items?.[index]?.productId?.message ? (
                  <p className="text-destructive text-sm">
                    {errors.items[index]?.productId?.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`package-item-quantity-${index}`}>Quantidade</Label>
                <Input
                  id={`package-item-quantity-${index}`}
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
                  aria-label="Remover produto"
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
          ))}

          {typeof errors.items?.message === 'string' ? (
            <p className="text-destructive text-sm">{errors.items.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={() => router.push('/packages')} type="button" variant="outline">
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
