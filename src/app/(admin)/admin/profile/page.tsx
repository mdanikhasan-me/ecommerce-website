import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { db } from '@/backend/database'
import { AdminProfileForm } from '@/frontend/components/admin/AdminProfileForm'

export const metadata: Metadata = { title: 'Admin Profile' }

export default async function AdminProfilePage() {
  const session = await requireAdminSession()
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, role: true },
  })

  if (!user) redirect('/auth/login?callbackUrl=%2Fadmin%2Fprofile')

  return (
    <div className="space-y-6">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Profile</h1>
          <p className="admin-page-description">Manage the administrator identity used across the operations workspace.</p>
        </div>
      </header>
      <AdminProfileForm user={user} />
    </div>
  )
}
