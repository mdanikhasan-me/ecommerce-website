import type { Role } from '@prisma/client'
import type { NextAuthConfig } from 'next-auth'
import { getAuthHostConfigurationWarnings, shouldTrustAuthHost } from '@/backend/auth/host'
import { getSafeAuthRedirectUrl } from '@/backend/auth/redirect'
import { logSecurityEvent } from '@/backend/security/security-log'

type UserWithRole = {
  id?: string
  role?: Role
  image?: string | null
}

type AuthCallbacks = NonNullable<NextAuthConfig['callbacks']>
type JwtCallbackParams = Parameters<NonNullable<AuthCallbacks['jwt']>>[0]
type RedirectCallbackParams = Parameters<NonNullable<AuthCallbacks['redirect']>>[0]
type SessionCallbackParams = Parameters<NonNullable<AuthCallbacks['session']>>[0]

const authHostWarnings = getAuthHostConfigurationWarnings()

if (process.env.NODE_ENV === 'production' && authHostWarnings.length > 0) {
  logSecurityEvent({
    type: 'auth_host_configuration_warning',
    severity: 'warn',
    errorCode: 'auth_host_configuration_warning',
    metadata: {
      warnings: authHostWarnings,
    },
  })
}

export const authConfig = {
  providers: [],
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: shouldTrustAuthHost(),
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async redirect({ url, baseUrl }: RedirectCallbackParams) {
      return getSafeAuthRedirectUrl(url, baseUrl)
    },
    async jwt({ token, user }: JwtCallbackParams) {
      if (user) {
        const userWithRole = user as UserWithRole
        token.id = userWithRole.id ?? user.id
        token.role = userWithRole.role ?? 'CUSTOMER'
        token.picture = userWithRole.image ?? token.picture
      }

      return token
    },
    async session({ session, token }: SessionCallbackParams) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.image = token.picture ?? null
      }

      return session
    },
  },
} satisfies NextAuthConfig
