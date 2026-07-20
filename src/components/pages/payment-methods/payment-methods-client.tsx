'use client'

import { Archive, Pencil, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { PaymentMethodListItem } from '@/@types'
import { deactivatePaymentMethod } from '@/actions/payment-method'
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
  const [searchValue, setSearchValue] = useState(search)
  const [dialogState, setDialogState] = useState<DialogState>(null)
  const [paymentMethodToDeactivate, setPaymentMethodToDeactivate] =
    useState<PaymentMethodListItem | null>(null)
  const hasSearch = search.trim().length > 0

  const activePaymentMethodsCount = useMemo(
    () => paymentMethods.filter((paymentMethod) => paymentMethod.isActive).length,
    [paymentMethods],
  )

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()
    const trimmedSearchValue = searchValue.trim()

    if (trimmedSearchValue) {
      params.set('search', trimmedSearchValue)
    }

    const queryString = params.toString()
    router.push(queryString ? `/payment-methods?${queryString}` : '/payment-methods')
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
                      <Button
                        aria-label={`Editar ${paymentMethod.name}`}
                        onClick={() => setDialogState({ paymentMethod, type: 'edit' })}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {paymentMethod.isActive ? (
                        <Button
                          aria-label={`Desativar ${paymentMethod.name}`}
                          onClick={() => setPaymentMethodToDeactivate(paymentMethod)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Archive className="size-4" />
                        </Button>
                      ) : null}
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
    </div>
  )
}
