import type { CustomerInput } from '@/actions/customer/schema'

export function normalizeCustomerInput(input: CustomerInput) {
  return {
    address: normalizeOptionalText(input.address),
    city: normalizeOptionalText(input.city),
    district: normalizeOptionalText(input.district),
    instagram: normalizeOptionalText(input.instagram),
    name: input.name.trim(),
    notes: normalizeOptionalText(input.notes),
    phone: normalizeOptionalText(input.phone),
  }
}

function normalizeOptionalText(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : null
}
