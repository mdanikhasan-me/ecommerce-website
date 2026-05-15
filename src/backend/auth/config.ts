import type { Role } from '@prisma/client'
import type { NextAuthConfig } from 'next-auth'

type UserWithRole = {
  id?: string
  role?: Role
}

type AuthCallbacks = NonNullable<NextAuthConfig['callbacks']>
type JwtCallbackParams = Parameters<NonNullable<AuthCallbacks['jwt']>>[0]
type SessionCallbackParams = Parameters<NonNullable<AuthCallbacks['session']>>[0]

export const authConfig = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: JwtCallbackParams) {
      if (user) {
        const userWithRole = user as UserWithRole
        token.id = userWithRole.id ?? user.id
        token.role = userWithRole.role ?? 'CUSTOMER'
      }

      return token
    },
    async session({ session, token }: SessionCallbackParams) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }

      return session
    },
  },
} satisfies NextAuthConfig
