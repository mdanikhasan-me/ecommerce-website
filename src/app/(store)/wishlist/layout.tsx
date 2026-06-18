import type { Metadata } from 'next'
import { generateNoIndexPageMetadata } from '@/backend/seo'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Wishlist',
  'Saved Boilabin products for your account.',
  '/wishlist',
)

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
