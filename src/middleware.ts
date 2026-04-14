import { auth } from '@/backend/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes: require admin role
  if (pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
    }
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Seller routes: require seller role
  if (pathname.startsWith('/seller/dashboard') || pathname.startsWith('/seller/products') || pathname.startsWith('/seller/orders') || pathname.startsWith('/seller/analytics') || pathname.startsWith('/seller/settings')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
    }
    if (!['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/seller/register', req.url))
    }
  }

  // Checkout: require authentication (guests can browse, cart is client-side, but checkout needs login)
  if (pathname.startsWith('/checkout')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}&reason=checkout`, req.url))
    }
  }

  // Account routes: require authentication
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
    '/seller/dashboard/:path*',
    '/seller/products/:path*',
    '/seller/orders/:path*',
    '/seller/analytics/:path*',
    '/seller/settings/:path*',
    '/checkout/:path*',
    '/account/:path*',
  ],
}
