'use client'

import { Archive, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { PackageListItem } from '@/@types'
import { deactivatePackage, deletePackage, reactivatePackage } from '@/actions/package'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip } from '@/components/ui/tooltip'
import { useDebouncedRouteSearch } from '@/hooks'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'

type PackagesClientProps = {
  packages: PackageListItem[]
  search: string
}

export function PackagesClient({ packages, search }: PackagesClientProps) {
  const router = useRouter()
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/packages',
  })
  const [packageToDeactivate, setPackageToDeactivate] = useState<PackageListItem | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<PackageListItem | null>(null)
  const hasSearch = search.trim().length > 0

  const activePackagesCount = useMemo(
    () => packages.filter((packageItem) => packageItem.isActive).length,
    [packages],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    submitSearch()
  }

  async function handleDeactivatePackage() {
    if (!packageToDeactivate) {
      return
    }

    const result = await deactivatePackage({ id: packageToDeactivate.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setPackageToDeactivate(null)
    router.refresh()
  }

  async function handleReactivatePackage(packageItem: PackageListItem) {
    const result = await reactivatePackage({ id: packageItem.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  async function handleDeletePackage() {
    if (!packageToDelete) {
      return
    }

    const result = await deletePackage({ id: packageToDelete.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setPackageToDelete(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Link className={cn(buttonVariants())} href="/packages/new">
            <Plus className="size-4" />
            Novo Pacote
          </Link>
        }
        description={`${activePackagesCount} pacote(s) ativo(s) cadastrados.`}
        title="Pacotes"
      />

      <form className="flex max-w-xl gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por pacote ou produto"
            value={searchValue}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {packages.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Preço de venda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((packageItem) => (
                  <TableRow key={packageItem.id}>
                    <TableCell>
                      <p className="min-w-48 font-medium">{packageItem.name}</p>
                    </TableCell>
                    <TableCell>{packageItem.itemsCount}</TableCell>
                    <TableCell>{formatCurrency(packageItem.salePrice)}</TableCell>
                    <TableCell>
                      <Badge variant={packageItem.isActive ? 'success' : 'outline'}>
                        {packageItem.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip content={`Editar ${packageItem.name}`}>
                          <Link
                            aria-label={`Editar ${packageItem.name}`}
                            className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}
                            href={`/packages/${packageItem.id}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Tooltip>
                        {packageItem.isActive ? (
                          <Tooltip content={`Inativar ${packageItem.name}`}>
                            <Button
                              aria-label={`Inativar ${packageItem.name}`}
                              onClick={() => setPackageToDeactivate(packageItem)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Archive className="size-4" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip content={`Reativar ${packageItem.name}`}>
                            <Button
                              aria-label={`Reativar ${packageItem.name}`}
                              onClick={() => void handleReactivatePackage(packageItem)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content={`Excluir ${packageItem.name}`}>
                          <Button
                            aria-label={`Excluir ${packageItem.name}`}
                            onClick={() => setPackageToDelete(packageItem)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </Tooltip>
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
              <Link className={cn(buttonVariants())} href="/packages/new">
                <Plus className="size-4" />
                Novo Pacote
              </Link>
            )
          }
          description={
            hasSearch
              ? 'Nenhum pacote foi encontrado com os filtros atuais.'
              : 'Monte pacotes combinando produtos já cadastrados.'
          }
          title={hasSearch ? 'Nenhum resultado encontrado' : 'Nenhum pacote cadastrado'}
        />
      )}

      <ConfirmDialog
        confirmLabel="Desativar"
        description={
          packageToDeactivate
            ? `O pacote ${packageToDeactivate.name} ficará indisponível para novos pedidos, mas o histórico será mantido.`
            : 'O pacote será desativado.'
        }
        onConfirm={handleDeactivatePackage}
        onOpenChange={(open) => !open && setPackageToDeactivate(null)}
        open={packageToDeactivate !== null}
        title="Desativar pacote"
      />

      <ConfirmDialog
        confirmLabel="Excluir"
        description={
          packageToDelete
            ? `O pacote ${packageToDelete.name} será excluído definitivamente se nunca tiver sido usado em pedidos.`
            : 'O pacote será excluído definitivamente.'
        }
        onConfirm={handleDeletePackage}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
        open={packageToDelete !== null}
        title="Excluir pacote"
      />
    </div>
  )
}
