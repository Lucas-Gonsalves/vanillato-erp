export type ProductSubcategoryOption = {
  categoryId: string
  categoryName: string
  id: string
  name: string
}

export type ProductListItem = {
  categoryName: string
  costPrice: string | null
  id: string
  isActive: boolean
  name: string
  salePrice: string
  subcategoryId: string
  subcategoryName: string
}
