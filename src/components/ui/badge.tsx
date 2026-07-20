import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'bg-primary/12 text-primary',
      destructive: 'bg-destructive/15 text-destructive',
      outline: 'border border-border text-muted-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-emerald-500/15 text-emerald-300',
      warning: 'bg-amber-500/15 text-amber-300',
    },
  },
})

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, variant }))} {...props} />
}
