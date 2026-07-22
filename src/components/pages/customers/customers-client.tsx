'use client'

import { Archive, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { CustomerListItem } from '@/@types'
import { deactivateCustomer, deleteCustomer, reactivateCustomer } from '@/actions/customer'
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
import { Tooltip } from '@/components/ui/tooltip'
import { useDebouncedRouteSearch } from '@/hooks'

import { CustomerForm } from './customer-form'

type CustomersClientProps = {
  customers: CustomerListItem[]
  search: string
}

type DialogState =
  | {
      customer?: undefined
      type: 'create'
    }
  | {
      customer: CustomerListItem
      type: 'edit'
    }
  | null

export function CustomersClient({ customers, search }: CustomersClientProps) {
  const router = useRouter()
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/customers',
  })
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [customerToDeactivate, setCustomerToDeactivate] = useState<CustomerListItem | null>(null)
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null)

  const hasSearch = search.trim().length > 0
  const modalTitle = dialogState?.type === 'edit' ? 'Editar cliente' : 'Novo cliente'
  const modalDescription =
    dialogState?.type === 'edit'
      ? 'Atualize os dados cadastrais do cliente.'
      : 'Cadastre um novo cliente para usar em pedidos.'

  const activeCustomersCount = useMemo(
    () => customers.filter((customer) => customer.isActive).length,
    [customers],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    submitSearch()
  }

  function handleDeactivateCustomer() {
    if (!customerToDeactivate) {
      return Promise.resolve()
    }

    return deactivateCustomer({ id: customerToDeactivate.id }).then((result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setCustomerToDeactivate(null)
      router.refresh()
    })
  }

  function handleReactivateCustomer(customer: CustomerListItem) {
    void reactivateCustomer({ id: customer.id }).then((result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      router.refresh()
    })
  }

  function handleDeleteCustomer() {
    if (!customerToDelete) {
      return Promise.resolve()
    }

    return deleteCustomer({ id: customerToDelete.id }).then((result) => {
      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      setCustomerToDelete(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setDialogState({ type: 'create' })} type="button">
            <Plus className="size-4" />
            Novo Cliente
          </Button>
        }
        description={`${activeCustomersCount} cliente(s) ativo(s) cadastrados.`}
        title="Clientes"
      />

      <form className="flex max-w-xl gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por nome, telefone, cidade ou Instagram"
            value={searchValue}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {customers.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="min-w-48">
                        <p className="font-medium">{customer.name}</p>
                        {customer.notes ? (
                          <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                            {customer.notes}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{customer.phone ?? 'Sem telefone'}</p>
                        <p className="text-muted-foreground text-xs">
                          {customer.instagram ?? 'Sem Instagram'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{customer.city ?? 'Sem cidade'}</p>
                        <p className="text-muted-foreground text-xs">
                          {customer.district ?? customer.address ?? 'Sem endereço'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? 'success' : 'outline'}>
                        {customer.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip content={`Editar ${customer.name}`}>
                          <Button
                            aria-label={`Editar ${customer.name}`}
                            onClick={() => setDialogState({ customer, type: 'edit' })}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </Tooltip>
                        {customer.isActive ? (
                          <Tooltip content={`Inativar ${customer.name}`}>
                            <Button
                              aria-label={`Inativar ${customer.name}`}
                              onClick={() => setCustomerToDeactivate(customer)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Archive className="size-4" />
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip content={`Reativar ${customer.name}`}>
                            <Button
                              aria-label={`Reativar ${customer.name}`}
                              onClick={() => handleReactivateCustomer(customer)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content={`Excluir ${customer.name}`}>
                          <Button
                            aria-label={`Excluir ${customer.name}`}
                            onClick={() => setCustomerToDelete(customer)}
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
              <Button onClick={() => setDialogState({ type: 'create' })} type="button">
                <Plus className="size-4" />
                Novo Cliente
              </Button>
            )
          }
          description={
            hasSearch
              ? 'Nenhum cliente foi encontrado com os filtros atuais.'
              : 'Cadastre clientes para criar pedidos e manter o histórico organizado.'
          }
          title={hasSearch ? 'Nenhum resultado encontrado' : 'Nenhum cliente cadastrado'}
        />
      )}

      <Modal
        description={modalDescription}
        onOpenChange={(open) => !open && setDialogState(null)}
        open={dialogState !== null}
        title={modalTitle}
      >
        <CustomerForm
          customer={dialogState?.type === 'edit' ? dialogState.customer : undefined}
          onSuccess={() => setDialogState(null)}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Desativar"
        description={
          customerToDeactivate
            ? `O cliente ${customerToDeactivate.name} ficará indisponível para novos usos, mas o histórico será mantido.`
            : 'O cliente será desativado.'
        }
        onConfirm={handleDeactivateCustomer}
        onOpenChange={(open) => !open && setCustomerToDeactivate(null)}
        open={customerToDeactivate !== null}
        title="Desativar cliente"
      />

      <ConfirmDialog
        confirmLabel="Excluir"
        description={
          customerToDelete
            ? `O cliente ${customerToDelete.name} será excluído definitivamente se não possuir pedidos.`
            : 'O cliente será excluído definitivamente.'
        }
        onConfirm={handleDeleteCustomer}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        open={customerToDelete !== null}
        title="Excluir cliente"
      />
    </div>
  )
}
