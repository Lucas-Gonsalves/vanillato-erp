'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { CategoryListItem } from '@/@types'
import {
  type CategoryInput,
  categorySchema,
  createCategory,
  updateCategory,
} from '@/actions/category'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CategoryFormProps = {
  category?: CategoryListItem
  onSuccess: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CategoryInput>({
    defaultValues: {
      name: category?.name ?? '',
    },
    resolver: zodResolver(categorySchema),
  })

  function onSubmit(values: CategoryInput) {
    startTransition(() => {
      const action = category
        ? updateCategory({ ...values, id: category.id })
        : createCategory(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors?.name?.[0]) {
            setError('name', { message: result.fieldErrors.name[0] })
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
        <Label htmlFor="category-name">Nome</Label>
        <Input autoFocus id="category-name" placeholder="Ex.: Bolos" {...register('name')} />
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
