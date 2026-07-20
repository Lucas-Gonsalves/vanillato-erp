import { z } from 'zod'

export const paymentMethodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome da forma de pagamento.')
    .max(80, 'A forma de pagamento deve ter no máximo 80 caracteres.'),
})

export const paymentMethodIdSchema = z.object({
  id: z.string().min(1, 'Forma de pagamento inválida.'),
})

export const updatePaymentMethodSchema = paymentMethodSchema.extend({
  id: z.string().min(1, 'Forma de pagamento inválida.'),
})

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>
export type PaymentMethodField = keyof PaymentMethodInput
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>
