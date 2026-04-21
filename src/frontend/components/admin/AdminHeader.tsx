'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function AdminHeader({
  user,
  unreadCount = 0,
}: {
  user: { name?: string | null; email?: string | null; role: string }
  unreadCount?: number
}) {
  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <Link href="/" target="_blank" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground" title="View Store">
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/notifications"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
          title={unreadCount > 0 ? `${unreadCount} unread` : 'Notifications'}
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? 'A'}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.role.replace('_', ' ')}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
