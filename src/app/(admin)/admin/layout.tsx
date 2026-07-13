import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { AdminShell } from '@/frontend/components/admin/AdminShell'
import { generateNoIndexPageMetadata } from '@/backend/seo'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
  const session = await requireAdminSession().catch(() =>
    redirect('/auth/login?callbackUrl=%2Fadmin%2Fdashboard')
  )
  const cookieStore = await cookies()
  const initialTheme = cookieStore.get('boilabin-admin-theme')?.value === 'dark' ? 'dark' : 'light'

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return (
    <AdminShell user={session.user} unreadCount={unreadCount} initialTheme={initialTheme}>
      {children}
    </AdminShell>
  )
}
