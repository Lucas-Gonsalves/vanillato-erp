'use client'

import { Archive, Pencil, Plus, RotateCcw, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { ProductListItem, ProductSubcategoryOption } from '@/@types'
import { deactivateProduct, reactivateProduct } from '@/actions/product'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebouncedRouteSearch } from '@/hooks'
import { formatCurrency } from '@/utils'

import { ProductForm } from './product-form'

type ProductsClientProps = {
  products: ProductListItem[]
  search: string
  subcategories: ProductSubcategoryOption[]
}

type DialogState =
  | {
      product?: undefined
      type: 'create'
    }
  | {
      product: ProductListItem
      type: 'edit'
    }
  | null

export function ProductsClient({ products, search, subcategories }: ProductsClientProps) {
  const router = useRouter()
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/products',
  })
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [productToDeactivate, setProductToDeactivate] = useState<ProductListItem | null>(null)
  const hasSearch = search.trim().length > 0

  const activeProductsCount = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    submitSearch()
  }

  async function handleDeactivateProduct() {
    if (!productToDeactivate) {
      return
    }

    const result = await deactivateProduct({ id: productToDeactivate.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setProductToDeactivate(null)
    router.refresh()
  }

  async function handleReactivateProduct(product: ProductListItem) {
    const result = await reactivateProduct({ id: product.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setDialogState({ type: 'create' })} type="button">
            <Plus className="size-4" />
            Novo Produto
          </Button>
        }
        description={`${activeProductsCount} produto(s) ativo(s) cadastrados.`}
        title="Produtos"
      />

      <form className="flex max-w-xl gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por produto, categoria ou subcategoria"
            value={searchValue}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {products.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço de venda</TableHead>
                  <TableHead>Preço de custo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="min-w-48 font-medium">{product.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{product.categoryName}</p>
                        <p className="text-muted-foreground text-xs">{product.subcategoryName}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell>
                      {product.costPrice ? formatCurrency(product.costPrice) : 'Não informado'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'success' : 'outline'}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label={`Editar ${product.name}`}
                          onClick={() => setDialogState({ product, type: 'edit' })}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {product.isActive ? (
                          <Button
                            aria-label={`Desativar ${product.name}`}
                            onClick={() => setProductToDeactivate(product)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Archive className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            aria-label={`Reativar ${product.name}`}
                            onClick={() => void handleReactivateProduct(product)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <EmptyState
          action={
            hasSearch ? null : (
              <Button onClick={() => setDialogState({ type: 'create' })} type="button">
                <Plus className="size-4" />
                Novo Produto
              </Button>
            )
          }
          description={
            hasSearch
              ? 'Nenhum produto foi encontrado com os filtros atuais.'
              : 'Cadastre produtos individuais para montar pedidos e pacotes.'
          }
          title={hasSearch ? 'Nenhum resultado encontrado' : 'Nenhum produto cadastrado'}
        />
      )}

      <Modal
        description={
          dialogState?.type === 'edit'
            ? 'Atualize os dados do produto.'
            : 'Cadastre um produto individual para venda.'
        }
        onOpenChange={(open) => !open && setDialogState(null)}
        open={dialogState !== null}
        title={dialogState?.type === 'edit' ? 'Editar produto' : 'Novo produto'}
      >
        <ProductForm
          onSuccess={() => setDialogState(null)}
          product={dialogState?.type === 'edit' ? dialogState.product : undefined}
          subcategories={subcategories}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Desativar"
        description={
          productToDeactivate
            ? `O produto ${productToDeactivate.name} ficará indisponível para novos usos, mas o histórico será mantido.`
            : 'O produto será desativado.'
        }
        onConfirm={handleDeactivateProduct}
        onOpenChange={(open) => !open && setProductToDeactivate(null)}
        open={productToDeactivate !== null}
        title="Desativar produto"
      />
    </div>
  )
}
