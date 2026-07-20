'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ModalProps = {
  children: ReactNode
  description?: string
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

export function Modal({ children, description, onOpenChange, open, title }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/65"
        onClick={() => onOpenChange(false)}
        type="button"
      />

      <section
        aria-describedby={description ? 'modal-description' : undefined}
        aria-modal="true"
        className={cn(
          'bg-card text-card-foreground border-border/70 relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border p-5 shadow-xl',
        )}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="text-muted-foreground text-sm" id="modal-description">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            aria-label="Fechar"
            onClick={() => onOpenChange(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        {children}
      </section>
    </div>
  )
}
