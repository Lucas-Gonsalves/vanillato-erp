'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { CategoryListItem, SubcategoryListItem } from '@/@types'
import {
  createSubcategory,
  type SubcategoryInput,
  subcategorySchema,
  updateSubcategory,
} from '@/actions/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type EditableSubcategory = SubcategoryListItem & {
  categoryId: string
}

type SubcategoryFormProps = {
  categories: CategoryListItem[]
  defaultCategoryId?: string
  onSuccess: () => void
  subcategory?: EditableSubcategory
}

export function SubcategoryForm({
  categories,
  defaultCategoryId,
  onSuccess,
  subcategory,
}: SubcategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const activeCategories = categories.filter((category) => category.isActive)
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<SubcategoryInput>({
    defaultValues: {
      categoryId: subcategory?.categoryId ?? defaultCategoryId ?? activeCategories[0]?.id ?? '',
      name: subcategory?.name ?? '',
    },
    resolver: zodResolver(subcategorySchema),
  })

  function onSubmit(values: SubcategoryInput) {
    startTransition(() => {
      const action = subcategory
        ? updateSubcategory({ ...values, id: subcategory.id })
        : createSubcategory(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof SubcategoryInput, { message })
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
      <div className="space-y-2">
        <Label htmlFor="subcategory-category">Categoria</Label>
        <Select id="subcategory-category" {...register('categoryId')} disabled={!!subcategory}>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        {errors.categoryId?.message ? (
          <p className="text-destructive text-sm">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory-name">Nome</Label>
        <Input autoFocus id="subcategory-name" placeholder="Ex.: Chocolate" {...register('name')} />
        {errors.name?.message ? (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        ) : null}
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
