import { generateNoIndexPageMetadata } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Shopping Cart',
  'Private Boilabin shopping cart.',
  '/cart',
)

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
