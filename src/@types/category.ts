export type SubcategoryListItem = {
  id: string
  isActive: boolean
  name: string
}

export type CategoryListItem = {
  id: string
  isActive: boolean
  name: string
  subcategories: SubcategoryListItem[]
}
