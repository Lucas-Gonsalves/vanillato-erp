import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type={type}
      {...props}
    />
  )
}
