import type { OrderItemType, OrderStatus, PaymentCondition } from '@/generated/prisma/enums'

export type OrderListItem = {
  createdAt: string
  customerName: string
  deliveryDate: string | null
  id: string
  itemsCount: number
  paymentMethodName: string
  status: OrderStatus
  total: string
}

export type OrderCustomerOption = {
  id: string
  name: string
  phone: string | null
}

export type OrderPaymentMethodOption = {
  id: string
  name: string
}

export type OrderCatalogOption = {
  id: string
  name: string
  price: string
}

export type OrderProductOption = OrderCatalogOption & {
  categoryId: string
  categoryName: string
  subcategoryId: string
  subcategoryName: string
}

export type OrderFormItem = {
  packageId?: string
  productId?: string
  quantity: number
  type: OrderItemType
}

export type OrderFormData = {
  customerId: string
  deliveryDate: string
  deliveryFee: string
  discount: string
  id: string
  items: OrderFormItem[]
  notes: string
  expectedPaymentDate: string
  paymentCondition: PaymentCondition
  paymentMethodId: string
  paymentNotes: string
}

export type OrderFormOptions = {
  customers: OrderCustomerOption[]
  packages: OrderCatalogOption[]
  paymentMethods: OrderPaymentMethodOption[]
  products: OrderProductOption[]
}
