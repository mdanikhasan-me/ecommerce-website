import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { AddressManager } from '@/frontend/components/account/AddressManager'
import { ProfileForm } from '@/frontend/components/account/ProfileForm'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Boilabin Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account')

  const [user, addresses] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, image: true },
    }),
    db.address.findMany({
      where: { userId: session.user.id, isSaved: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    }),
  ])

  if (!user) redirect('/auth/login?callbackUrl=/account')

  return (
    <main className="container-site py-5 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 sm:mb-7">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Account
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep your personal details and saved delivery addresses up to date.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-6">
          <section aria-labelledby="account-profile-heading">
            <div className="mb-3">
              <h2 id="account-profile-heading" className="text-sm font-semibold text-foreground">
                Profile information
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Update your name and phone number.
              </p>
            </div>
            <ProfileForm user={user} />
          </section>

          <section aria-labelledby="account-addresses-heading">
            <div className="mb-3">
              <h2 id="account-addresses-heading" className="text-sm font-semibold text-foreground">
                Saved addresses
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Add home, office, or default delivery addresses for checkout.
              </p>
            </div>
            <AddressManager addresses={addresses} />
          </section>
        </div>
      </div>
    </main>
  )
}
