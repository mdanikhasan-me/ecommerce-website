import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { FAQPageContent } from '../articles/page'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin FAQ',
  'Browse Boilabin frequently asked questions about orders, checkout, delivery, returns, payments, account support, products, stock, wishlist, and support safety.',
  '/faq',
)

export default function FAQPage() {
  return <FAQPageContent />
}
