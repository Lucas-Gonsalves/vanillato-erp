import { z } from 'zod'

import { OrderItemType, OrderStatus, PaymentCondition } from '@/generated/prisma/enums'
import { parseCurrencyToDecimalString } from '@/utils'

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

const orderItemSchema = z
  .object({
    packageId: z.string().optional(),
    productId: z.string().optional(),
    quantity: z.coerce
      .number<number>()
      .int('Informe uma quantidade inteira.')
      .min(1, 'A quantidade deve ser maior que zero.'),
    type: z.enum([OrderItemType.PRODUCT, OrderItemType.PACKAGE]),
  })
  .superRefine((item, context) => {
    if (item.type === OrderItemType.PRODUCT && !item.productId) {
      context.addIssue({
        code: 'custom',
        message: 'Selecione um produto.',
        path: ['productId'],
      })
    }

    if (item.type === OrderItemType.PACKAGE && !item.packageId) {
      context.addIssue({
        code: 'custom',
        message: 'Selecione um pacote.',
        path: ['packageId'],
      })
    }
  })

export const orderSchema = z
  .object({
    customerId: z.string().min(1, 'Selecione um cliente.'),
    deliveryDate: z.string().optional(),
    deliveryFee: optionalPriceSchema,
    discount: optionalPriceSchema,
    items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item ao pedido.'),
    notes: z
      .string()
      .trim()
      .max(500, 'As observações devem ter no máximo 500 caracteres.')
      .optional(),
    paymentMethodId: z.string().min(1, 'Selecione uma forma de pagamento.'),
    paymentCondition: z.enum([PaymentCondition.CASH, PaymentCondition.CREDIT]),
    expectedPaymentDate: z.string().optional(),
    expectedPaymentMethodId: z.string().optional(),
    paymentNotes: z
      .string()
      .trim()
      .max(500, 'As observações de pagamento devem ter no máximo 500 caracteres.')
      .optional(),
  })
  .superRefine((value, context) => {
    const itemKeys = new Set<string>()

    value.items.forEach((item, index) => {
      const itemId = item.type === OrderItemType.PRODUCT ? item.productId : item.packageId

      if (!itemId) {
        return
      }

      const itemKey = `${item.type}:${itemId}`

      if (itemKeys.has(itemKey)) {
        context.addIssue({
          code: 'custom',
          message: 'Este item já foi adicionado ao pedido.',
          path: ['items', index, item.type === OrderItemType.PRODUCT ? 'productId' : 'packageId'],
        })
      }

      itemKeys.add(itemKey)
    })

    if (value.paymentCondition === PaymentCondition.CREDIT) {
      if (!value.expectedPaymentDate) {
        context.addIssue({
          code: 'custom',
          message: 'Informe a data prevista de pagamento.',
          path: ['expectedPaymentDate'],
        })
      }

      if (!value.expectedPaymentMethodId) {
        context.addIssue({
          code: 'custom',
          message: 'Informe a forma prevista de pagamento.',
          path: ['expectedPaymentMethodId'],
        })
      }
    }
  })

export const orderIdSchema = z.object({
  id: z.string().min(1, 'Pedido inválido.'),
})

export const updateOrderSchema = orderSchema.extend({
  id: z.string().min(1, 'Pedido inválido.'),
})

export const orderStatusSchema = z.object({
  id: z.string().min(1, 'Pedido inválido.'),
  status: z.enum([
    OrderStatus.CANCELED,
    OrderStatus.DELIVERED,
    OrderStatus.IN_PRODUCTION,
    OrderStatus.PENDING,
    OrderStatus.READY,
  ]),
})

export type OrderInput = z.infer<typeof orderSchema>
export type OrderField = keyof OrderInput
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof orderStatusSchema>
