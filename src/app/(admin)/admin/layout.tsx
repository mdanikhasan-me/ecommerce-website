import { redirect } from 'next/navigation'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { AdminShell } from '@/frontend/components/admin/AdminShell'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateNoIndexPageMetadata(
  'Boilabin Admin',
  'Private Boilabin admin area.',
  '/admin',
)

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/auth/login?callbackUrl=/admin')
  }

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return (
    <AdminShell user={session.user} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  )
}
