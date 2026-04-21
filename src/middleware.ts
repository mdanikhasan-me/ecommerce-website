import { auth } from '@/backend/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
    }
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/checkout')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}&reason=checkout`, req.url))
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
    '/checkout/:path*',
    '/account/:path*',
  ],
}
