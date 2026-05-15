import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/backend/auth/config'

const { auth } = NextAuth(authConfig)
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
    }

    if (!ADMIN_ROLES.includes(session.user.role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/account')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
}
