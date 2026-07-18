import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from '@/backend/database'
import { authConfig } from '@/backend/auth/config'
import { getGoogleOAuthCredentials } from '@/backend/auth/google-oauth'
import type { NextAuthConfig } from 'next-auth'
import { rateLimit } from '@/backend/security/rate-limit'

type AuthEvents = NonNullable<NextAuthConfig['events']>
type SignInEventParams = Parameters<NonNullable<AuthEvents['signIn']>>[0]

const googleOAuthCredentials = getGoogleOAuthCredentials()

// Hash of a discarded random value. Compared against when no usable account
// exists so unknown-email and wrong-password attempts take similar time.
const TIMING_EQUALIZATION_HASH = '$2a$12$s1gHIDsPRG9/C3Jqhfe2zuhhwYquueyBdBDNa93rYUke7pVCpkdqm'

export function normalizeCredentialsEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized.length > 254 || !normalized.includes('@')) return null
  return normalized
}

function normalizeCredentialsPassword(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length < 8 || value.length > 72) return null
  if (Buffer.byteLength(value, 'utf8') > 72) return null
  return value
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    ...(googleOAuthCredentials ? [GoogleProvider(googleOAuthCredentials)] : []),
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email = normalizeCredentialsEmail(credentials.email)
        const password = normalizeCredentialsPassword(credentials.password)
        if (!email || !password) return null

        const limited = rateLimit(request, {
          key: 'auth:credentials',
          limit: 10,
          windowMs: 60_000,
        })
        if (limited) return null

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.password || !user.isActive) {
          await bcrypt.compare(password, TIMING_EQUALIZATION_HASH)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  events: {
    async signIn({ user, isNewUser }: SignInEventParams) {
      if (isNewUser && user.id) {
        await Promise.all([
          db.cart.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          }),
          db.wishlist.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          }),
        ])
      }
    },
  },
})
