'use client'

import { AlertTriangle } from 'lucide-react'
import { useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

type ConfirmDialogProps = {
  confirmLabel?: string
  description: string
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

export function ConfirmDialog({
  confirmLabel = 'Confirmar',
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(() => {
      void onConfirm()
    })
  }

  return (
    <Modal description={description} onOpenChange={onOpenChange} open={open} title={title}>
      <div className="flex items-start gap-3">
        <div className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
          <AlertTriangle className="size-5" />
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
          Cancelar
        </Button>
        <Button disabled={isPending} onClick={handleConfirm} type="button" variant="destructive">
          {isPending ? 'Confirmando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
