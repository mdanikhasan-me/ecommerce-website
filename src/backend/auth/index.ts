import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from '@/backend/database'
import { authConfig } from '@/backend/auth/config'
import type { NextAuthConfig } from 'next-auth'

type AuthEvents = NonNullable<NextAuthConfig['events']>
type SignInEventParams = Parameters<NonNullable<AuthEvents['signIn']>>[0]

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null
        if (!user.isActive) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
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
        await db.cart.create({ data: { userId: user.id } })
        await db.wishlist.create({ data: { userId: user.id } })
      }
    },
  },
})
