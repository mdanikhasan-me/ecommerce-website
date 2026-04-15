import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { SellerSettingsForm } from '@/frontend/components/seller/SellerSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seller Store Settings' }

export default async function SellerSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      storeName: true,
      storeSlug: true,
      description: true,
      storeLogo: true,
      storeBanner: true,
      businessType: true,
      tradeLicense: true,
      nidNumber: true,
      bankName: true,
      bankAccount: true,
      bkashNumber: true,
    },
  })
  if (!seller) redirect('/seller/register')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your store profile and policies</p>
      </div>
      <SellerSettingsForm seller={seller} />
    </div>
  )
}
