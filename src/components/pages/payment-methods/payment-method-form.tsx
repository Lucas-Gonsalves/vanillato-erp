'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { PaymentMethodListItem } from '@/@types'
import {
  createPaymentMethod,
  type PaymentMethodInput,
  paymentMethodSchema,
  updatePaymentMethod,
} from '@/actions/payment-method'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type PaymentMethodFormProps = {
  onSuccess: () => void
  paymentMethod?: PaymentMethodListItem
}

export function PaymentMethodForm({ onSuccess, paymentMethod }: PaymentMethodFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<PaymentMethodInput>({
    defaultValues: {
      name: paymentMethod?.name ?? '',
    },
    resolver: zodResolver(paymentMethodSchema),
  })

  function onSubmit(values: PaymentMethodInput) {
    startTransition(() => {
      const action = paymentMethod
        ? updatePaymentMethod({ ...values, id: paymentMethod.id })
        : createPaymentMethod(values)

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
        <Label htmlFor="payment-method-name">Nome</Label>
        <Input autoFocus id="payment-method-name" placeholder="Ex.: Pix" {...register('name')} />
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
