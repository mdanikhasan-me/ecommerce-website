import { getActiveUserSession } from '@/backend/auth/active-user'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { AddressManager } from '@/frontend/components/account/AddressManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin Addresses' }

export default async function AddressesPage() {
  const session = await getActiveUserSession()
  if (!session?.user) redirect('/auth/login')

  const addresses = await db.address.findMany({
    where: { userId: session.user.id, isSaved: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="container-site py-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-6">My Addresses</h1>
        <AddressManager addresses={addresses} />
      </div>
    </div>
  )
}
