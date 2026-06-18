import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { AdminShell } from '@/frontend/components/admin/AdminShell'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Boilabin Admin',
  'Private Boilabin admin area.',
  '/admin',
)

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdminSession()

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return (
    <AdminShell user={session.user} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  )
}
