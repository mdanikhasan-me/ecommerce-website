import { generateNoIndexPageMetadata } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Boilabin Account',
  'Private Boilabin customer account area.',
  '/account',
)

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
