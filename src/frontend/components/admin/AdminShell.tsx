'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/backend/utils'
import { AdminHeader } from '@/frontend/components/admin/AdminHeader'
import { AdminSidebar } from '@/frontend/components/admin/AdminSidebar'

type AdminShellProps = {
  user: { name?: string | null; email?: string | null; role: string }
  unreadCount: number
  children: React.ReactNode
}

export function AdminShell({ user, unreadCount, children }: AdminShellProps) {
  const [isMenuPresent, setIsMenuPresent] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false)

  const openMenu = () => {
    setIsMenuPresent(true)
    requestAnimationFrame(() => setIsMenuVisible(true))
  }

  const closeMenu = () => {
    setIsMenuVisible(false)
  }

  useEffect(() => {
    if (!isMenuPresent) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuPresent])

  useEffect(() => {
    if (!isMenuPresent || isMenuVisible) return

    const timeout = window.setTimeout(() => setIsMenuPresent(false), 190)
    return () => window.clearTimeout(timeout)
  }, [isMenuPresent, isMenuVisible])

  useEffect(() => {
    if (!isMenuVisible) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuVisible])

  return (
    <div className="admin-ui flex h-screen overflow-hidden bg-[hsl(38_18%_94%)]">
      <AdminSidebar className="hidden md:flex" />

      {isMenuPresent ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className={cn(
              'absolute inset-0 bg-[rgba(18,15,20,0.45)] transition-opacity [transition-duration:180ms] ease-out',
              isMenuVisible ? 'opacity-100' : 'opacity-0',
            )}
            onClick={closeMenu}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 flex w-[18rem] max-w-[84vw] flex-col shadow-[24px_0_56px_rgba(18,15,20,0.30)] transition-transform [transition-duration:190ms] ease-out will-change-transform',
              isMenuVisible ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <button
              type="button"
              aria-label="Close admin menu"
              title="Close admin menu"
              onClick={closeMenu}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-[hsl(42_32%_94%)] transition-colors min-[1025px]:hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
            <AdminSidebar className="w-full" onNavigate={closeMenu} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={user}
          unreadCount={unreadCount}
          onMenuClick={openMenu}
        />
        <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,hsl(39_20%_95%),hsl(38_16%_92%))] p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
