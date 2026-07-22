'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
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
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PersonType } from '@/generated/prisma/enums'
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
      allowCreditPurchase: customer?.allowCreditPurchase ?? false,
      alternativePhone: customer?.alternativePhone ?? '',
      birthDate: customer?.birthDate ? customer.birthDate.slice(0, 10) : '',
      city: customer?.city ?? '',
      complement: customer?.complement ?? '',
      cpf: customer?.cpf ?? '',
      creditLimit: customer?.creditLimit?.replace('.', ',') ?? '',
      district: customer?.district ?? '',
      gender: customer?.gender ?? '',
      instagram: customer?.instagram ?? '',
      internalNotes: customer?.internalNotes ?? '',
      isVip: customer?.isVip ?? false,
      name: customer?.name ?? '',
      notes: customer?.notes ?? '',
      number: customer?.number ?? '',
      origin: customer?.origin ?? '',
      personType: customer?.personType ?? '',
      phone: customer?.phone ?? '',
      reference: customer?.reference ?? '',
      street: customer?.street ?? '',
      whatsapp: customer?.whatsapp ?? '',
      zipCode: customer?.zipCode ?? '',
    },
    resolver: zodResolver(customerSchema),
  })

  const phoneField = register('phone')
  const alternativePhoneField = register('alternativePhone')
  const whatsappField = register('whatsapp')
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false)

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

      <div className="border-border/70 rounded-md border">
        <button
          aria-expanded={isAdditionalOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
          onClick={() => setIsAdditionalOpen((current) => !current)}
          type="button"
        >
          Informações adicionais
          <span className="text-muted-foreground">
            {isAdditionalOpen ? 'Recolher' : 'Expandir'}
          </span>
        </button>

        {isAdditionalOpen ? (
          <div className="grid gap-4 border-t px-4 py-4 sm:grid-cols-2">
            <FormField error={errors.cpf?.message} label="CPF" name="cpf">
              <Input id="cpf" placeholder="000.000.000-00" {...register('cpf')} />
            </FormField>

            <FormField error={errors.personType?.message} label="Tipo de pessoa" name="personType">
              <Select id="personType" {...register('personType')}>
                <option value="">Não informado</option>
                <option value={PersonType.INDIVIDUAL}>Física</option>
                <option value={PersonType.COMPANY}>Jurídica</option>
              </Select>
            </FormField>

            <FormField
              error={errors.birthDate?.message}
              label="Data de nascimento"
              name="birthDate"
            >
              <Input id="birthDate" type="date" {...register('birthDate')} />
            </FormField>

            <FormField error={errors.gender?.message} label="Gênero" name="gender">
              <Input id="gender" placeholder="Gênero" {...register('gender')} />
            </FormField>

            <FormField error={errors.zipCode?.message} label="CEP" name="zipCode">
              <Input id="zipCode" placeholder="00000-000" {...register('zipCode')} />
            </FormField>

            <FormField error={errors.street?.message} label="Rua" name="street">
              <Input id="street" placeholder="Rua" {...register('street')} />
            </FormField>

            <FormField error={errors.number?.message} label="Número" name="number">
              <Input id="number" placeholder="Número" {...register('number')} />
            </FormField>

            <FormField error={errors.complement?.message} label="Complemento" name="complement">
              <Input id="complement" placeholder="Complemento" {...register('complement')} />
            </FormField>

            <FormField error={errors.reference?.message} label="Referência" name="reference">
              <Input id="reference" placeholder="Referência" {...register('reference')} />
            </FormField>

            <FormField
              error={errors.alternativePhone?.message}
              label="Telefone alternativo"
              name="alternativePhone"
            >
              <Input
                id="alternativePhone"
                placeholder="(00) 00000-0000"
                {...alternativePhoneField}
                onChange={(event) => {
                  event.target.value = formatPhone(event.target.value)
                  void alternativePhoneField.onChange(event)
                }}
              />
            </FormField>

            <FormField error={errors.whatsapp?.message} label="WhatsApp" name="whatsapp">
              <Input
                id="whatsapp"
                placeholder="(00) 00000-0000"
                {...whatsappField}
                onChange={(event) => {
                  event.target.value = formatPhone(event.target.value)
                  void whatsappField.onChange(event)
                }}
              />
            </FormField>

            <FormField error={errors.origin?.message} label="Origem do cliente" name="origin">
              <Input
                id="origin"
                placeholder="Instagram, indicação, evento..."
                {...register('origin')}
              />
            </FormField>

            <FormField
              error={errors.creditLimit?.message}
              label="Limite de crédito"
              name="creditLimit"
            >
              <Input id="creditLimit" placeholder="0,00" {...register('creditLimit')} />
            </FormField>

            <label className="flex items-center gap-2 text-sm">
              <input className="size-4" type="checkbox" {...register('allowCreditPurchase')} />
              Permite comprar a prazo
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input className="size-4" type="checkbox" {...register('isVip')} />
              Cliente VIP
            </label>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="internalNotes">Observações internas</Label>
              <Textarea
                id="internalNotes"
                placeholder="Informações comerciais internas"
                {...register('internalNotes')}
              />
              {errors.internalNotes?.message ? (
                <p className="text-destructive text-sm">{errors.internalNotes.message}</p>
              ) : null}
            </div>
          </div>
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
