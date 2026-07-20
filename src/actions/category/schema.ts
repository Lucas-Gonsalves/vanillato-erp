import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome da categoria.')
    .max(80, 'A categoria deve ter no máximo 80 caracteres.'),
})

export const categoryIdSchema = z.object({
  id: z.string().min(1, 'Categoria inválida.'),
})

export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, 'Categoria inválida.'),
})

export const subcategorySchema = z.object({
  categoryId: z.string().min(1, 'Categoria inválida.'),
  name: z
    .string()
    .trim()
    .min(2, 'Informe o nome da subcategoria.')
    .max(80, 'A subcategoria deve ter no máximo 80 caracteres.'),
})

export const updateSubcategorySchema = subcategorySchema.extend({
  id: z.string().min(1, 'Subcategoria inválida.'),
})

export const subcategoryIdSchema = z.object({
  id: z.string().min(1, 'Subcategoria inválida.'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type CategoryField = keyof CategoryInput
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type SubcategoryInput = z.infer<typeof subcategorySchema>
export type SubcategoryField = keyof SubcategoryInput
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>
