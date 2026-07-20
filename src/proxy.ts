import { type NextRequest, NextResponse } from 'next/server'

import { Role } from '@/generated/prisma/enums'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

const PUBLIC_ROUTES = ['/login']

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route)
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  const isAuthenticatedAdmin = session?.role === Role.ADMIN

  if (isPublicRoute && isAuthenticatedAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!isPublicRoute && !isAuthenticatedAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
