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
    <main className="container-site py-7 sm:py-9 lg:py-10">
      <div className="w-full">
        <header className="mb-6 border-b border-border pb-5 sm:mb-7 sm:pb-6">
          <h1 className="font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">My Addresses</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Manage your saved delivery addresses for a faster checkout.</p>
        </header>
        <AddressManager addresses={addresses} />
      </div>
    </main>
  )
}
