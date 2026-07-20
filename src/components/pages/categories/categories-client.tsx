'use client'

import { Archive, FolderPlus, Pencil, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { CategoryListItem, SubcategoryListItem } from '@/@types'
import { deactivateCategory, deactivateSubcategory } from '@/actions/category'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'

import { CategoryForm } from './category-form'
import { SubcategoryForm } from './subcategory-form'

type CategoriesClientProps = {
  categories: CategoryListItem[]
  search: string
}

type CategoryDialog =
  | {
      category?: undefined
      type: 'create-category'
    }
  | {
      category: CategoryListItem
      type: 'edit-category'
    }
  | {
      category: CategoryListItem
      type: 'create-subcategory'
    }
  | {
      category: CategoryListItem
      subcategory: SubcategoryListItem
      type: 'edit-subcategory'
    }
  | null

type ConfirmState =
  | {
      category: CategoryListItem
      type: 'category'
    }
  | {
      category: CategoryListItem
      subcategory: SubcategoryListItem
      type: 'subcategory'
    }
  | null

export function CategoriesClient({ categories, search }: CategoriesClientProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const [dialogState, setDialogState] = useState<CategoryDialog>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const hasSearch = search.trim().length > 0

  const activeCategoriesCount = useMemo(
    () => categories.filter((category) => category.isActive).length,
    [categories],
  )

  const dialogContent = getDialogContent(dialogState)
  const editableSubcategory = getEditableSubcategory(dialogState)
  const isCategoryDialog =
    dialogState?.type === 'create-category' || dialogState?.type === 'edit-category'
  const isSubcategoryDialog =
    dialogState?.type === 'create-subcategory' || dialogState?.type === 'edit-subcategory'

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()
    const trimmedSearchValue = searchValue.trim()

    if (trimmedSearchValue) {
      params.set('search', trimmedSearchValue)
    }

    const queryString = params.toString()
    router.push(queryString ? `/categories?${queryString}` : '/categories')
  }

  async function handleConfirm() {
    if (!confirmState) {
      return
    }

    const result =
      confirmState.type === 'category'
        ? await deactivateCategory({ id: confirmState.category.id })
        : await deactivateSubcategory({ id: confirmState.subcategory.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setConfirmState(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setDialogState({ type: 'create-category' })} type="button">
            <Plus className="size-4" />
            Nova Categoria
          </Button>
        }
        description={`${activeCategoriesCount} categoria(s) ativa(s) cadastradas.`}
        title="Categorias"
      />

      <form className="flex max-w-xl gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por categoria ou subcategoria"
            value={searchValue}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {categories.length > 0 ? (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{category.name}</CardTitle>
                    <Badge variant={category.isActive ? 'success' : 'outline'}>
                      {category.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {category.subcategories.length} subcategoria(s)
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {category.isActive ? (
                    <Button
                      aria-label={`Adicionar subcategoria em ${category.name}`}
                      onClick={() => setDialogState({ category, type: 'create-subcategory' })}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <FolderPlus className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    aria-label={`Editar ${category.name}`}
                    onClick={() => setDialogState({ category, type: 'edit-category' })}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {category.isActive ? (
                    <Button
                      aria-label={`Desativar ${category.name}`}
                      onClick={() => setConfirmState({ category, type: 'category' })}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Archive className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent>
                {category.subcategories.length > 0 ? (
                  <div className="divide-border/70 border-border/70 divide-y rounded-md border">
                    {category.subcategories.map((subcategory) => (
                      <div
                        className="flex items-center justify-between gap-3 px-4 py-3"
                        key={subcategory.id}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{subcategory.name}</p>
                          <Badge
                            className="mt-1"
                            variant={subcategory.isActive ? 'success' : 'outline'}
                          >
                            {subcategory.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button
                            aria-label={`Editar ${subcategory.name}`}
                            onClick={() =>
                              setDialogState({ category, subcategory, type: 'edit-subcategory' })
                            }
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {subcategory.isActive ? (
                            <Button
                              aria-label={`Desativar ${subcategory.name}`}
                              onClick={() =>
                                setConfirmState({ category, subcategory, type: 'subcategory' })
                              }
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Archive className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma subcategoria cadastrada nesta categoria.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          action={
            hasSearch ? null : (
              <Button onClick={() => setDialogState({ type: 'create-category' })} type="button">
                <Plus className="size-4" />
                Nova Categoria
              </Button>
            )
          }
          description={
            hasSearch
              ? 'Nenhuma categoria foi encontrada com os filtros atuais.'
              : 'Crie categorias para organizar os produtos e suas subcategorias.'
          }
          title={hasSearch ? 'Nenhum resultado encontrado' : 'Nenhuma categoria cadastrada'}
        />
      )}

      <Modal
        description={dialogContent.description}
        onOpenChange={(open) => !open && setDialogState(null)}
        open={dialogState !== null}
        title={dialogContent.title}
      >
        {isCategoryDialog ? (
          <CategoryForm
            category={dialogState.type === 'edit-category' ? dialogState.category : undefined}
            onSuccess={() => setDialogState(null)}
          />
        ) : null}

        {isSubcategoryDialog ? (
          <SubcategoryForm
            categories={categories}
            defaultCategoryId={dialogState.category.id}
            onSuccess={() => setDialogState(null)}
            subcategory={editableSubcategory}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        confirmLabel="Desativar"
        description={getConfirmDescription(confirmState)}
        onConfirm={handleConfirm}
        onOpenChange={(open) => !open && setConfirmState(null)}
        open={confirmState !== null}
        title="Confirmar desativação"
      />
    </div>
  )
}

function getDialogContent(dialogState: CategoryDialog) {
  if (dialogState?.type === 'edit-category') {
    return {
      description: 'Atualize o nome da categoria.',
      title: 'Editar categoria',
    }
  }

  if (dialogState?.type === 'create-subcategory') {
    return {
      description: `Adicione uma subcategoria em ${dialogState.category.name}.`,
      title: 'Nova subcategoria',
    }
  }

  if (dialogState?.type === 'edit-subcategory') {
    return {
      description: 'Atualize o nome da subcategoria.',
      title: 'Editar subcategoria',
    }
  }

  return {
    description: 'Crie uma nova categoria para organizar produtos.',
    title: 'Nova categoria',
  }
}

function getEditableSubcategory(dialogState: CategoryDialog) {
  if (dialogState?.type !== 'edit-subcategory') {
    return undefined
  }

  return {
    ...dialogState.subcategory,
    categoryId: dialogState.category.id,
  }
}

function getConfirmDescription(confirmState: ConfirmState) {
  if (!confirmState) {
    return 'O registro será desativado.'
  }

  if (confirmState.type === 'category') {
    return `A categoria ${confirmState.category.name} e suas subcategorias ficarão inativas, mas o histórico será mantido.`
  }

  return `A subcategoria ${confirmState.subcategory.name} ficará inativa, mas o histórico será mantido.`
}
