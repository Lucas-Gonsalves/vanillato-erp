'use client'

import { Archive, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { PaymentMethodListItem } from '@/@types'
import {
  deactivatePaymentMethod,
  deletePaymentMethod,
  reactivatePaymentMethod,
} from '@/actions/payment-method'
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

import { PaymentMethodForm } from './payment-method-form'

type PaymentMethodsClientProps = {
  paymentMethods: PaymentMethodListItem[]
  search: string
}

type DialogState =
  | {
      paymentMethod?: undefined
      type: 'create'
    }
  | {
      paymentMethod: PaymentMethodListItem
      type: 'edit'
    }
  | null

export function PaymentMethodsClient({ paymentMethods, search }: PaymentMethodsClientProps) {
  const router = useRouter()
  const { searchValue, setSearchValue, submitSearch } = useDebouncedRouteSearch({
    initialSearch: search,
    pathname: '/payment-methods',
  })
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [paymentMethodToDeactivate, setPaymentMethodToDeactivate] =
    useState<PaymentMethodListItem | null>(null)
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethodListItem | null>(
    null,
  )
  const hasSearch = search.trim().length > 0

  const activePaymentMethodsCount = useMemo(
    () => paymentMethods.filter((paymentMethod) => paymentMethod.isActive).length,
    [paymentMethods],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    submitSearch()
  }

  async function handleDeactivatePaymentMethod() {
    if (!paymentMethodToDeactivate) {
      return
    }

    const result = await deactivatePaymentMethod({ id: paymentMethodToDeactivate.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setPaymentMethodToDeactivate(null)
    router.refresh()
  }

  async function handleReactivatePaymentMethod(paymentMethod: PaymentMethodListItem) {
    const result = await reactivatePaymentMethod({ id: paymentMethod.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    router.refresh()
  }

  async function handleDeletePaymentMethod() {
    if (!paymentMethodToDelete) {
      return
    }

    const result = await deletePaymentMethod({ id: paymentMethodToDelete.id })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)
    setPaymentMethodToDelete(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          <Button onClick={() => setDialogState({ type: 'create' })} type="button">
            <Plus className="size-4" />
            Nova Forma
          </Button>
        }
        description={`${activePaymentMethodsCount} forma(s) ativa(s) cadastradas.`}
        title="Formas de Pagamento"
      />

      <form className="flex max-w-xl gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por forma de pagamento"
            value={searchValue}
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {paymentMethods.length > 0 ? (
        <div className="border-border/70 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((paymentMethod) => (
                <TableRow key={paymentMethod.id}>
                  <TableCell>
                    <p className="font-medium">{paymentMethod.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentMethod.isActive ? 'success' : 'outline'}>
                      {paymentMethod.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Tooltip content={`Editar ${paymentMethod.name}`}>
                        <Button
                          aria-label={`Editar ${paymentMethod.name}`}
                          onClick={() => setDialogState({ paymentMethod, type: 'edit' })}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Tooltip>
                      {paymentMethod.isActive ? (
                        <Tooltip content={`Inativar ${paymentMethod.name}`}>
                          <Button
                            aria-label={`Inativar ${paymentMethod.name}`}
                            onClick={() => setPaymentMethodToDeactivate(paymentMethod)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <Archive className="size-4" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content={`Reativar ${paymentMethod.name}`}>
                          <Button
                            aria-label={`Reativar ${paymentMethod.name}`}
                            onClick={() => void handleReactivatePaymentMethod(paymentMethod)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content={`Excluir ${paymentMethod.name}`}>
                        <Button
                          aria-label={`Excluir ${paymentMethod.name}`}
                          onClick={() => setPaymentMethodToDelete(paymentMethod)}
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
      ) : (
        <EmptyState
          action={
            hasSearch ? null : (
              <Button onClick={() => setDialogState({ type: 'create' })} type="button">
                <Plus className="size-4" />
                Nova Forma
              </Button>
            )
          }
          description={
            hasSearch
              ? 'Nenhuma forma de pagamento foi encontrada com os filtros atuais.'
              : 'Cadastre as formas de pagamento aceitas pela operação.'
          }
          title={hasSearch ? 'Nenhum resultado encontrado' : 'Nenhuma forma cadastrada'}
        />
      )}

      <Modal
        description={
          dialogState?.type === 'edit'
            ? 'Atualize o nome da forma de pagamento.'
            : 'Cadastre uma nova forma de pagamento.'
        }
        onOpenChange={(open) => !open && setDialogState(null)}
        open={dialogState !== null}
        title={dialogState?.type === 'edit' ? 'Editar forma' : 'Nova forma'}
      >
        <PaymentMethodForm
          onSuccess={() => setDialogState(null)}
          paymentMethod={dialogState?.type === 'edit' ? dialogState.paymentMethod : undefined}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Desativar"
        description={
          paymentMethodToDeactivate
            ? `A forma ${paymentMethodToDeactivate.name} ficará indisponível para novos pedidos, mas o histórico será mantido.`
            : 'A forma de pagamento será desativada.'
        }
        onConfirm={handleDeactivatePaymentMethod}
        onOpenChange={(open) => !open && setPaymentMethodToDeactivate(null)}
        open={paymentMethodToDeactivate !== null}
        title="Desativar forma de pagamento"
      />

      <ConfirmDialog
        confirmLabel="Excluir"
        description={
          paymentMethodToDelete
            ? `A forma ${paymentMethodToDelete.name} será excluída definitivamente se nunca tiver sido usada em pedidos.`
            : 'A forma de pagamento será excluída definitivamente.'
        }
        onConfirm={handleDeletePaymentMethod}
        onOpenChange={(open) => !open && setPaymentMethodToDelete(null)}
        open={paymentMethodToDelete !== null}
        title="Excluir forma de pagamento"
      />
    </div>
  )
}
