import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { ADMIN_USER_DETAIL_SELECT } from '@/backend/admin/user-editor'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { UserManagementForm } from '@/frontend/components/admin/UserManagementForm'

export const metadata = { title: 'Admin User Details' }

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAdminSession()
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: ADMIN_USER_DETAIL_SELECT,
  })

  if (!user) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title">{user.name || user.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Joined {formatDate(user.createdAt)} and currently has {user.role} access.
          </p>
        </div>
        <Link href="/admin/users" className="btn-outline">
          Back to Users
        </Link>
      </div>

      <UserManagementForm
        user={user}
        actor={{ id: session.user.id, role: session.user.role }}
      />
    </div>
  )
}
