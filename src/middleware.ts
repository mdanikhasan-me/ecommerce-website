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

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSessionCookie = req.cookies
    .getAll()
    .some((cookie) => SESSION_COOKIE_PREFIXES.some((prefix) => cookie.name.startsWith(prefix)))

  if (matchesPathSegment(pathname, '/admin')) {
    if (!hasSessionCookie) {
      return withOptionalCspReportOnly(
        req,
        NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)),
      )
    }
  }

  if (matchesPathSegment(pathname, '/account')) {
    if (!hasSessionCookie) {
      return withOptionalCspReportOnly(
        req,
        NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)),
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
