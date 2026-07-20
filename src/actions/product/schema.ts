import { z } from 'zod'

import { parseCurrencyToDecimalString } from '@/utils'

const priceSchema = z
  .string()
  .trim()
  .min(1, 'Informe o preço.')
  .refine((value) => {
    const parsedValue = parseCurrencyToDecimalString(value)

    return parsedValue !== null && Number(parsedValue) > 0
  }, 'Informe um valor válido maior que zero.')

const optionalPriceSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    if (!value) {
      return true
    }

    const parsedValue = parseCurrencyToDecimalString(value)

    return parsedValue !== null && Number(parsedValue) >= 0
  }, 'Informe um valor válido.')

export const productSchema = z.object({
  costPrice: optionalPriceSchema,
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome do produto.')
    .max(120, 'O nome deve ter no máximo 120 caracteres.'),
  salePrice: priceSchema,
  subcategoryId: z.string().min(1, 'Selecione uma subcategoria.'),
})

export const productIdSchema = z.object({
  id: z.string().min(1, 'Produto inválido.'),
})

export const updateProductSchema = productSchema.extend({
  id: z.string().min(1, 'Produto inválido.'),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductField = keyof ProductInput
export type UpdateProductInput = z.infer<typeof updateProductSchema>
