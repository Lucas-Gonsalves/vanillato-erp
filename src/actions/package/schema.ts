import { z } from 'zod'

import { parseCurrencyToDecimalString } from '@/utils'

const packageItemSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto.'),
  quantity: z.coerce
    .number<number>()
    .int('Informe uma quantidade inteira.')
    .min(1, 'A quantidade deve ser maior que zero.'),
})

export const packageSchema = z
  .object({
    items: z.array(packageItemSchema).min(1, 'Adicione pelo menos um produto ao pacote.'),
    name: z
      .string()
      .trim()
      .min(2, 'Informe o nome do pacote.')
      .max(120, 'O nome deve ter no máximo 120 caracteres.'),
    salePrice: z
      .string()
      .trim()
      .min(1, 'Informe o preço de venda.')
      .refine((value) => {
        const parsedValue = parseCurrencyToDecimalString(value)

        return parsedValue !== null && Number(parsedValue) > 0
      }, 'Informe um valor válido maior que zero.'),
  })
  .superRefine((value, context) => {
    const productIds = new Set<string>()

    value.items.forEach((item, index) => {
      if (productIds.has(item.productId)) {
        context.addIssue({
          code: 'custom',
          message: 'Este produto já foi adicionado ao pacote.',
          path: ['items', index, 'productId'],
        })
      }

      productIds.add(item.productId)
    })
  })

export const packageIdSchema = z.object({
  id: z.string().min(1, 'Pacote inválido.'),
})

export const updatePackageSchema = packageSchema.extend({
  id: z.string().min(1, 'Pacote inválido.'),
})

export type PackageInput = z.infer<typeof packageSchema>
export type PackageField = keyof PackageInput
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
