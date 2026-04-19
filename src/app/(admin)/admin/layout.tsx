import { redirect } from 'next/navigation'
import { auth } from '@/backend/auth'
import { AdminSidebar } from '@/frontend/components/admin/AdminSidebar'
import { AdminHeader } from '@/frontend/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/auth/login?callbackUrl=/admin')
  }

  return (
    <div className="flex h-screen bg-secondary overflow-hidden">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
