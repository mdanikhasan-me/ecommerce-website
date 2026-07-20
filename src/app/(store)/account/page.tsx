import { getActiveUserSession } from '@/backend/auth/active-user'
import { db } from '@/backend/database'
import { AccountInformationCard } from '@/frontend/components/account/AccountInformationCard'
import { AccountOverviewNavigation } from '@/frontend/components/account/AccountOverviewNavigation'
import { RecentOrderCard } from '@/frontend/components/account/RecentOrderCard'
import { SavedAddressCard } from '@/frontend/components/account/SavedAddressCard'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Boilabin Account' }

export default async function AccountPage() {
  const session = await getActiveUserSession()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account')

  const [user, primaryAddress, recentOrder] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, image: true },
    }),
    db.address.findFirst({
      where: { userId: session.user.id, isSaved: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }),
    db.order.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: { take: 1, select: { productName: true, imageUrl: true } },
        _count: { select: { items: true } },
      },
    }),
  ])

  if (!user) redirect('/auth/login?callbackUrl=/account')

  return (
    <main className="container-site py-6 sm:py-8 lg:py-9">
      <div className="mx-auto w-full max-w-[96rem]">
        <header className="mb-5 sm:mb-6">
          <h1 className="font-display text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-3xl">My Account</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Manage your account and preferences</p>
        </header>

        <div className="grid gap-4 xl:grid-cols-[18.5rem_minmax(0,1fr)] xl:items-start xl:gap-6">
          <AccountOverviewNavigation />
          <div className="min-w-0 space-y-4 sm:space-y-5">
            <AccountInformationCard user={user} />
            <SavedAddressCard address={primaryAddress} />
            <RecentOrderCard order={recentOrder} />
          </div>
        </div>
      </div>
    </main>
  )
}
