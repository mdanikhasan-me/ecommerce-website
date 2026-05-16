'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AdminHeader } from '@/frontend/components/admin/AdminHeader'
import { AdminSidebar } from '@/frontend/components/admin/AdminSidebar'

type AdminShellProps = {
  user: { name?: string | null; email?: string | null; role: string }
  unreadCount: number
  children: React.ReactNode
}

export function AdminShell({ user, unreadCount, children }: AdminShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar className="hidden md:flex" />

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[18rem] max-w-[82vw] flex-col shadow-[24px_0_60px_rgba(0,0,0,0.28)]">
            <button
              type="button"
              aria-label="Close admin menu"
              title="Close admin menu"
              onClick={() => setIsMenuOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <AdminSidebar className="w-full" onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={user}
          unreadCount={unreadCount}
          onMenuClick={() => setIsMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
