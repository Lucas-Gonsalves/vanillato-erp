import { z } from 'zod'

import { PersonType } from '@/generated/prisma/enums'
import { isValidPhone } from '@/utils'

export const customerSchema = z.object({
  address: z.string().trim().max(180, 'O endereço deve ter no máximo 180 caracteres.').optional(),
  allowCreditPurchase: z.boolean().optional(),
  alternativePhone: z
    .string()
    .trim()
    .max(30, 'O telefone alternativo deve ter no máximo 30 caracteres.')
    .optional()
    .refine(isValidPhone, 'Informe um telefone alternativo válido.'),
  birthDate: z.string().optional(),
  city: z.string().trim().max(80, 'A cidade deve ter no máximo 80 caracteres.').optional(),
  complement: z
    .string()
    .trim()
    .max(80, 'O complemento deve ter no máximo 80 caracteres.')
    .optional(),
  cpf: z.string().trim().max(20, 'O CPF deve ter no máximo 20 caracteres.').optional(),
  creditLimit: z.string().trim().optional(),
  district: z.string().trim().max(80, 'O bairro deve ter no máximo 80 caracteres.').optional(),
  gender: z.string().trim().max(40, 'O gênero deve ter no máximo 40 caracteres.').optional(),
  instagram: z.string().trim().max(80, 'O Instagram deve ter no máximo 80 caracteres.').optional(),
  internalNotes: z
    .string()
    .trim()
    .max(500, 'As observações internas devem ter no máximo 500 caracteres.')
    .optional(),
  isVip: z.boolean().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome do cliente.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  notes: z
    .string()
    .trim()
    .max(500, 'As observações devem ter no máximo 500 caracteres.')
    .optional(),
  number: z.string().trim().max(20, 'O número deve ter no máximo 20 caracteres.').optional(),
  origin: z.string().trim().max(80, 'A origem deve ter no máximo 80 caracteres.').optional(),
  personType: z.enum([PersonType.COMPANY, PersonType.INDIVIDUAL]).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .max(30, 'O telefone deve ter no máximo 30 caracteres.')
    .optional()
    .refine(isValidPhone, 'Informe um telefone válido.'),
  reference: z
    .string()
    .trim()
    .max(120, 'A referência deve ter no máximo 120 caracteres.')
    .optional(),
  street: z.string().trim().max(120, 'A rua deve ter no máximo 120 caracteres.').optional(),
  whatsapp: z
    .string()
    .trim()
    .max(30, 'O WhatsApp deve ter no máximo 30 caracteres.')
    .optional()
    .refine(isValidPhone, 'Informe um WhatsApp válido.'),
  zipCode: z.string().trim().max(12, 'O CEP deve ter no máximo 12 caracteres.').optional(),
})

export const customerIdSchema = z.object({
  id: z.string().min(1, 'Cliente inválido.'),
})

export const updateCustomerSchema = customerSchema.extend({
  id: z.string().min(1, 'Cliente inválido.'),
})

export type CustomerInput = z.infer<typeof customerSchema>
export type CustomerField = keyof CustomerInput
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
