'use client'

import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

type HeaderProps = {
  onMenuClick: () => void
  title: string
  userName: string
}

export function Header({ onMenuClick, title, userName }: HeaderProps) {
  return (
    <header className="border-border/60 bg-background/95 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Abrir navegação"
          className="md:hidden"
          onClick={onMenuClick}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Menu className="size-5" />
        </Button>
        <div>
          <h1 className="text-foreground text-base font-semibold md:text-lg">{title}</h1>
        </div>
      </div>

      <div className="text-muted-foreground hidden text-sm sm:block">{userName}</div>
    </header>
  )
}
