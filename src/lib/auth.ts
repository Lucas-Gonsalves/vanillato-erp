import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Role } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import {
  createSessionPayload,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionPayload,
  verifySessionToken,
} from '@/lib/session'

export type AuthenticatedUser = {
  email: string
  id: string
  name: string
  role: Role
}

export async function createSession(user: { id: string; role: Role }) {
  const cookieStore = await cookies()
  const token = await signSessionPayload(createSessionPayload(user))

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies()
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session || session.role !== Role.ADMIN) {
    return null
  }

  const user = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: {
      id: session.userId,
    },
  })

  if (!user || user.role !== Role.ADMIN) {
    return null
  }

  return user
}

export async function requireAdminUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function redirectAuthenticatedUser() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }
}
