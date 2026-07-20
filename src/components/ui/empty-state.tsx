import type { ReactNode } from 'react'

type EmptyStateProps = {
  action?: ReactNode
  description: string
  title: string
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="border-border/70 flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
