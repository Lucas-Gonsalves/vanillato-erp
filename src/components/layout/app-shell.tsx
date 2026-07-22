'use client'

import {
  CreditCard,
  FolderTree,
  HandCoins,
  Home,
  LogOut,
  Package,
  ReceiptText,
  ShoppingBag,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { logout } from '@/actions/auth'
import logoSquare from '@/assets/vanillato-logo-off-title.svg'
import { Header } from '@/components/header'
import { Button, buttonVariants } from '@/components/ui/button'
import type { AuthenticatedUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
  user: AuthenticatedUser
}

const navigationItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    title: 'Dashboard',
  },
  {
    href: '/orders',
    icon: ReceiptText,
    label: 'Pedidos',
    title: 'Pedidos',
  },
  {
    href: '/accounts-receivable',
    icon: HandCoins,
    label: 'Contas a Receber',
    title: 'Contas a Receber',
  },
  {
    href: '/customers',
    icon: Users,
    label: 'Clientes',
    title: 'Clientes',
  },
  {
    href: '/products',
    icon: ShoppingBag,
    label: 'Produtos',
    title: 'Produtos',
  },
  {
    href: '/packages',
    icon: Package,
    label: 'Pacotes',
    title: 'Pacotes',
  },
  {
    href: '/categories',
    icon: FolderTree,
    label: 'Categorias',
    title: 'Categorias',
  },
  {
    href: '/payment-methods',
    icon: CreditCard,
    label: 'Formas de Pagamento',
    title: 'Formas de Pagamento',
  },
  {
    href: '/financial',
    icon: WalletCards,
    label: 'Financeiro',
    title: 'Financeiro',
  },
] as const

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const currentTitle = useMemo(() => {
    const currentItem = navigationItems.find((item) => {
      if (item.href === '/dashboard') {
        return pathname === '/dashboard'
      }

      return pathname.startsWith(item.href)
    })

    return currentItem?.title ?? 'Vanillato ERP'
  }, [pathname])

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={cn(
          'border-border/70 bg-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r transition-transform md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-5">
          <Link
            className="flex min-w-0 items-center gap-3"
            href="/"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Image
              alt="Vanillato"
              className="rounded-md"
              height={36}
              priority
              src={logoSquare}
              width={36}
            />
            <span className="text-sidebar-foreground truncate text-sm leading-none font-extralight tracking-[0.35em] uppercase select-none">
              Vanillato
            </span>
          </Link>

          <Button
            aria-label="Fechar navegação"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                className={cn(
                  'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="size-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-sidebar-border border-t p-3">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="bg-sidebar-accent text-sidebar-accent-foreground flex size-9 items-center justify-center rounded-md text-sm font-semibold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sidebar-foreground truncate text-sm font-medium">{user.name}</p>
              <p className="text-sidebar-foreground/60 truncate text-xs">{user.email}</p>
            </div>
          </div>

          <form action={logout}>
            <button
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-sidebar-foreground/75 hover:text-sidebar-accent-foreground w-full justify-start',
              )}
              type="submit"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="md:pl-72">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          title={currentTitle}
          userName={user.name}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  )
}
