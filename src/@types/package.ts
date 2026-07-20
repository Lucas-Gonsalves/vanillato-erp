export type PackageListItem = {
  id: string
  isActive: boolean
  itemsCount: number
  name: string
  salePrice: string
}

export type PackageProductOption = {
  categoryName: string
  id: string
  name: string
  salePrice: string
  subcategoryName: string
}

export type PackageFormItem = {
  productId: string
  quantity: number
}

export type PackageFormData = {
  id: string
  items: PackageFormItem[]
  name: string
  salePrice: string
}
