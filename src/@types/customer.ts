export type CustomerListItem = {
  allowCreditPurchase: boolean
  alternativePhone: string | null
  address: string | null
  birthDate: string | null
  city: string | null
  complement: string | null
  cpf: string | null
  creditLimit: string | null
  district: string | null
  gender: string | null
  id: string
  internalNotes: string | null
  instagram: string | null
  isActive: boolean
  isVip: boolean
  name: string
  number: string | null
  notes: string | null
  origin: string | null
  personType: 'COMPANY' | 'INDIVIDUAL' | null
  phone: string | null
  reference: string | null
  street: string | null
  whatsapp: string | null
  zipCode: string | null
}
