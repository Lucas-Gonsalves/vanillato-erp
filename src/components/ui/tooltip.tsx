import type { ReactNode } from 'react'

type TooltipProps = {
  children: ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        className="bg-popover text-popover-foreground border-border/70 pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-56 -translate-x-1/2 rounded-md border px-2 py-1 text-xs opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}
