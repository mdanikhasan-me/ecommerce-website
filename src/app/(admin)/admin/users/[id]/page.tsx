import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { UserManagementForm } from '@/frontend/components/admin/UserManagementForm'

export const metadata = { title: 'Admin User Details' }

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          status: true,
        },
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
          addresses: true,
          notifications: true,
        },
      },
    },
  })

  if (!user) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name || user.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Joined {formatDate(user.createdAt)} and currently has {user.role} access.
          </p>
        </div>
        <Link href="/admin/users" className="btn-outline">
          Back to Users
        </Link>
      </div>

      <UserManagementForm user={user} />
    </div>
  )
}
