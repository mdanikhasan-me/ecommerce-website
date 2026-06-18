'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, ExternalLink, Menu } from 'lucide-react'
import Link from 'next/link'

export function AdminHeader({
  user,
  unreadCount = 0,
  onMenuClick,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string }
  unreadCount?: number
  onMenuClick?: () => void
}) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border/80 bg-card/95 px-3 shadow-[0_1px_0_rgba(23,18,15,0.03)] sm:px-6">
      <button
        type="button"
        aria-label="Open admin menu"
        title="Open admin menu"
        onClick={onMenuClick}
        className="rounded-md p-2 text-muted-foreground transition-colors md:hover:bg-secondary/70 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-1.5 sm:gap-3">
        <Link href="/" target="_blank" className="rounded-md p-2 text-muted-foreground transition-colors md:hover:bg-secondary/70" title="View Store">
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/notifications"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
          title={unreadCount > 0 ? `${unreadCount} unread` : 'Notifications'}
          className="relative rounded-md p-2 text-muted-foreground transition-colors md:hover:bg-secondary/70"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary ring-1 ring-black/5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xs font-bold text-foreground">{user.name?.[0]?.toUpperCase() ?? 'A'}</span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none">{user.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{user.role.replace('_', ' ')}</p>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="ml-1 rounded-md p-1.5 text-muted-foreground transition-colors md:hover:bg-secondary/70"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
