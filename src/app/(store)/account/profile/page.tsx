import { getActiveUserSession } from '@/backend/auth/active-user'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { ProfileForm } from '@/frontend/components/account/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin My Account' }

export default async function ProfilePage() {
  const session = await getActiveUserSession()
  if (!session?.user) redirect('/auth/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true },
  })

  if (!user) redirect('/auth/login')

  return (
    <div className="container-site py-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-2">My Account</h1>
        <p className="mb-6 text-sm text-muted-foreground">Update your name and delivery phone number.</p>
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
