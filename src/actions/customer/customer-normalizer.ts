import type { CustomerInput } from '@/actions/customer/schema'
import { parseCurrencyToDecimalString } from '@/utils'

export function normalizeCustomerInput(input: CustomerInput) {
  return {
    address: normalizeOptionalText(input.address),
    allowCreditPurchase: input.allowCreditPurchase ?? false,
    alternativePhone: normalizeOptionalText(input.alternativePhone),
    birthDate: input.birthDate ? new Date(`${input.birthDate}T00:00:00`) : null,
    city: normalizeOptionalText(input.city),
    complement: normalizeOptionalText(input.complement),
    cpf: normalizeOptionalText(input.cpf),
    creditLimit: parseCurrencyToDecimalString(input.creditLimit ?? '') ?? null,
    district: normalizeOptionalText(input.district),
    gender: normalizeOptionalText(input.gender),
    instagram: normalizeOptionalText(input.instagram),
    internalNotes: normalizeOptionalText(input.internalNotes),
    isVip: input.isVip ?? false,
    name: input.name.trim(),
    notes: normalizeOptionalText(input.notes),
    number: normalizeOptionalText(input.number),
    origin: normalizeOptionalText(input.origin),
    personType: input.personType || null,
    phone: normalizeOptionalText(input.phone),
    reference: normalizeOptionalText(input.reference),
    street: normalizeOptionalText(input.street),
    whatsapp: normalizeOptionalText(input.whatsapp),
    zipCode: normalizeOptionalText(input.zipCode),
  }
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
