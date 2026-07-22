import { z } from 'zod'

import { parseCurrencyToDecimalString } from '@/utils'

const moneySchema = z
  .string()
  .trim()
  .refine((value) => {
    const parsedValue = parseCurrencyToDecimalString(value)

    return parsedValue !== null && Number(parsedValue) > 0
  }, 'Informe um valor maior que zero.')

export const receivableIdSchema = z.object({
  id: z.string().min(1, 'Conta inválida.'),
})

export const registerReceivablePaymentSchema = z.object({
  amount: moneySchema,
  paidAt: z.string().min(1, 'Informe a data do pagamento.'),
  paymentMethodId: z.string().min(1, 'Informe a forma de pagamento.'),
  receivableId: z.string().min(1, 'Conta inválida.'),
  note: z.string().trim().max(500, 'A observação deve ter no máximo 500 caracteres.').optional(),
})

export const cancelReceivablePaymentSchema = z.object({
  paymentId: z.string().min(1, 'Pagamento inválido.'),
  receivableId: z.string().min(1, 'Conta inválida.'),
  note: z.string().trim().max(500, 'A observação deve ter no máximo 500 caracteres.').optional(),
})

export const renegotiateReceivableSchema = z.object({
  id: z.string().min(1, 'Conta inválida.'),
  newDueDate: z.string().min(1, 'Informe o novo vencimento.'),
  reason: z
    .string()
    .trim()
    .min(2, 'Informe o motivo.')
    .max(500, 'O motivo deve ter no máximo 500 caracteres.'),
})

export type RegisterReceivablePaymentInput = z.infer<typeof registerReceivablePaymentSchema>
export type CancelReceivablePaymentInput = z.infer<typeof cancelReceivablePaymentSchema>
export type RenegotiateReceivableInput = z.infer<typeof renegotiateReceivableSchema>
