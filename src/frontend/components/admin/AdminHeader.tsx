'use client'

import { Bell, Menu, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getActiveAdminNavItem } from '@/frontend/components/admin/admin-navigation'
import { AdminProfileMenu } from '@/frontend/components/admin/AdminProfileMenu'

export type AdminTheme = 'light' | 'dark'

export function AdminHeader({
  user,
  unreadCount = 0,
  theme,
  onMenuClick,
  onThemeToggle,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string }
  unreadCount?: number
  theme: AdminTheme
  onMenuClick?: () => void
  onThemeToggle: () => void
}) {
  const pathname = usePathname()
  const activeItem = getActiveAdminNavItem(pathname)
  const isDark = theme === 'dark'

  return (
    <header className="admin-header flex h-[4.25rem] flex-shrink-0 items-center bg-card">
      <div className="admin-header-content flex w-full items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            aria-label="Open admin menu"
            title="Open admin menu"
            onClick={onMenuClick}
            className="admin-icon-button xl:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[0.9rem] font-semibold text-foreground">
              {activeItem?.label ?? 'Admin Workspace'}
            </p>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Operations workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isDark ? 'Use light admin theme' : 'Use dark admin theme'}
            title={isDark ? 'Light theme' : 'Dark theme'}
            aria-pressed={isDark}
            onClick={onThemeToggle}
            className="admin-icon-button"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            href="/admin/notifications"
            aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
            title={unreadCount > 0 ? `${unreadCount} unread` : 'Notifications'}
            className="admin-icon-button relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>
          <AdminProfileMenu user={user} />
        </div>
      </div>
    </header>
  )
}
