import type { Metadata } from 'next'
import { generateNoIndexPageMetadata } from '@/backend/seo'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Compare Products',
  'Compare saved Boilabin products side by side.',
  '/compare',
)

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
