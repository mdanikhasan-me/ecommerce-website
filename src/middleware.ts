import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getCspReportOnlyHeader } from '@/backend/security/csp'

const SESSION_COOKIE_PREFIXES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
]

function withOptionalCspReportOnly(req: NextRequest, response: NextResponse) {
  const cspHeader = getCspReportOnlyHeader(req.nextUrl.pathname)
  if (cspHeader) {
    response.headers.set(cspHeader.key, cspHeader.value)
  }

  return response
}

function matchesPathSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`)
}

function isSessionCookieName(cookieName: string) {
  return SESSION_COOKIE_PREFIXES.some((prefix) => {
    if (cookieName === prefix) return true
    const suffix = cookieName.slice(prefix.length)
    return /^\.\d+$/.test(suffix)
  })
}

function buildLoginRedirectUrl(req: NextRequest) {
  const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`
  const url = new URL('/auth/login', req.url)
  url.searchParams.set('callbackUrl', callbackUrl)
  return url
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSessionCookie = req.cookies.getAll().some((cookie) => isSessionCookieName(cookie.name))

  if (matchesPathSegment(pathname, '/admin')) {
    if (!hasSessionCookie) {
      return withOptionalCspReportOnly(
        req,
        NextResponse.redirect(buildLoginRedirectUrl(req)),
      )
    }
  }

  if (matchesPathSegment(pathname, '/account')) {
    if (!hasSessionCookie) {
      return withOptionalCspReportOnly(
        req,
        NextResponse.redirect(buildLoginRedirectUrl(req)),
      )
    }
  }

  return withOptionalCspReportOnly(req, NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/(?:static|image)(?:/|$)|assets/|uploads/|favicon\\.ico$|apple-touch-icon\\.png$).*)',
  ],
}
