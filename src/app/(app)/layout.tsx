import type { ReactNode } from 'react'

import { AppShell } from '@/components/layout'
import { requireAdminUser } from '@/lib/auth'

type ProtectedLayoutProps = {
  children: ReactNode
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = await requireAdminUser()

  return <AppShell user={user}>{children}</AppShell>
}
