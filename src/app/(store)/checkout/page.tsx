import { redirect } from 'next/navigation'
import { auth } from '@/backend/auth'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { CheckoutClient } from '@/frontend/components/checkout/CheckoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Checkout',
  'Secure checkout for Boilabin customers.',
  '/checkout',
)

export default async function CheckoutPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/checkout&reason=checkout')
  }

  return <CheckoutClient />
}
