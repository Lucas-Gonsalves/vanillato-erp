'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { CustomerListItem } from '@/@types'
import {
  createCustomer,
  type CustomerInput,
  customerSchema,
  updateCustomer,
} from '@/actions/customer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatPhone } from '@/utils'

type CustomerFormProps = {
  customer?: CustomerListItem
  onSuccess: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CustomerInput>({
    defaultValues: {
      address: customer?.address ?? '',
      city: customer?.city ?? '',
      district: customer?.district ?? '',
      instagram: customer?.instagram ?? '',
      name: customer?.name ?? '',
      notes: customer?.notes ?? '',
      phone: customer?.phone ?? '',
    },
    resolver: zodResolver(customerSchema),
  })

  const phoneField = register('phone')

  function onSubmit(values: CustomerInput) {
    startTransition(() => {
      const action = customer
        ? updateCustomer({ ...values, id: customer.id })
        : createCustomer(values)

      void action.then((result) => {
        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, messages]) => {
              const message = messages?.at(0)

              if (message) {
                setError(field as keyof CustomerInput, { message })
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
        <FormField error={errors.name?.message} label="Nome" name="name">
          <Input autoFocus id="name" placeholder="Nome do cliente" {...register('name')} />
        </FormField>

        <FormField error={errors.phone?.message} label="Telefone" name="phone">
          <Input
            id="phone"
            placeholder="(00) 00000-0000"
            {...phoneField}
            onChange={(event) => {
              event.target.value = formatPhone(event.target.value)
              void phoneField.onChange(event)
            }}
          />
        </FormField>

        <FormField error={errors.instagram?.message} label="Instagram" name="instagram">
          <Input id="instagram" placeholder="@cliente" {...register('instagram')} />
        </FormField>

        <FormField error={errors.city?.message} label="Cidade" name="city">
          <Input id="city" placeholder="Cidade" {...register('city')} />
        </FormField>

        <FormField error={errors.district?.message} label="Bairro" name="district">
          <Input id="district" placeholder="Bairro" {...register('district')} />
        </FormField>

        <FormField error={errors.address?.message} label="Endereço" name="address">
          <Input id="address" placeholder="Rua, número e complemento" {...register('address')} />
        </FormField>
      </div>

      <FormField error={errors.notes?.message} label="Observações" name="notes">
        <Textarea
          id="notes"
          placeholder="Preferências, restrições ou observações internas"
          {...register('notes')}
        />
      </FormField>

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

type FormFieldProps = {
  children: React.ReactNode
  error?: string
  label: string
  name: string
}

function FormField({ children, error, label, name }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  )
}
