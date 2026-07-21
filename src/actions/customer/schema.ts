import { z } from 'zod'

import { isValidPhone } from '@/utils'

export const customerSchema = z.object({
  address: z.string().trim().max(180, 'O endereço deve ter no máximo 180 caracteres.').optional(),
  city: z.string().trim().max(80, 'A cidade deve ter no máximo 80 caracteres.').optional(),
  district: z.string().trim().max(80, 'O bairro deve ter no máximo 80 caracteres.').optional(),
  instagram: z.string().trim().max(80, 'O Instagram deve ter no máximo 80 caracteres.').optional(),
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
  phone: z
    .string()
    .trim()
    .max(30, 'O telefone deve ter no máximo 30 caracteres.')
    .optional()
    .refine(isValidPhone, 'Informe um telefone válido.'),
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
