import { redirect } from 'next/navigation'
import { getActiveUserSession } from '@/backend/auth/active-user'
import { db } from '@/backend/database'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { CheckoutClient } from '@/frontend/components/checkout/CheckoutClient'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Checkout',
  'Checkout for Boilabin customers.',
  '/checkout',
)

export default async function CheckoutPage() {
  const session = await getActiveUserSession()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/checkout&reason=checkout')
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id, isSaved: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      fullName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      district: true,
      division: true,
      postalCode: true,
      isDefault: true,
    },
  })

  return <CheckoutClient initialAddresses={addresses} />
}
