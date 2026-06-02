import { generateNoIndexPageMetadata } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Boilabin Auth',
  'Sign in or create a Boilabin account.',
  '/auth/login',
)

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
