import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { SellerSettingsForm } from '@/frontend/components/seller/SellerSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Store Settings | Boilabin Seller' }

export default async function SellerSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      storeName: true,
      slug: true,
      description: true,
      logo: true,
      banner: true,
      phone: true,
      returnPolicy: true,
      shippingPolicy: true,
      address: true,
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
