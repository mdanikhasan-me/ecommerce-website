'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, LogOut, Moon, ShieldCheck, Sun, X } from 'lucide-react'
import { cn } from '@/backend/utils'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import type { AdminTheme } from '@/frontend/components/admin/AdminHeader'
import {
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from '@/frontend/components/admin/admin-navigation'

export function AdminSidebar({
  className,
  onNavigate,
  onClose,
  onThemeToggle,
  theme,
  variant = 'desktop',
}: {
  className?: string
  onNavigate?: () => void
  onClose?: () => void
  onThemeToggle?: () => void
  theme: AdminTheme
  variant?: 'desktop' | 'drawer'
}) {
  const pathname = usePathname()
  const isDrawer = variant === 'drawer'

  return (
    <aside className={cn('admin-sidebar flex w-[14.5rem] flex-shrink-0 flex-col', className)}>
      <div className={cn('admin-sidebar-brand', isDrawer ? 'flex items-center justify-between gap-3 px-4 py-4' : 'px-5 py-5')}>
        <Link href="/admin/dashboard" onClick={onNavigate} className="flex flex-col items-start gap-1">
          <BoilabinLogo
            variant={theme === 'dark' ? 'wordmark-light' : 'wordmark'}
            size={isDrawer ? 31 : 34}
            priority
            className={cn('w-auto max-w-full', isDrawer ? 'h-8' : 'h-[2.125rem]')}
          />
          <span className="admin-sidebar-caption block text-xs">Operations console</span>
        </Link>
        {isDrawer ? (
          <button type="button" aria-label="Close admin menu" title="Close admin menu" onClick={onClose} className="admin-icon-button shrink-0">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className={cn('admin-sidebar-nav flex-1 overflow-y-auto overscroll-contain', isDrawer ? 'px-3 py-3' : 'px-3 py-4')} aria-label="Admin navigation">
        {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && 'mt-4')}>
            <p className="admin-sidebar-group mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isAdminNavItemActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    data-active={isActive ? 'true' : 'false'}
                    className={cn(
                      'admin-sidebar-link flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-[0.84rem] font-medium',
                      isDrawer && 'min-h-11 text-[0.875rem]',
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer space-y-2 p-3">
        {!isDrawer ? (
          <div className="admin-security-note flex items-center gap-2 px-3 py-2 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" /> Protected admin workspace
          </div>
        ) : null}
        <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar-link flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium">
          <ExternalLink className="h-3.5 w-3.5" /> View Store
        </Link>
        {isDrawer ? (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onThemeToggle} className="admin-sidebar-link flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium">
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button type="button" onClick={async () => {
              const { signOut } = await import('next-auth/react')
              signOut({ callbackUrl: '/auth/login' })
            }} className="admin-sidebar-link flex min-h-10 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs font-medium">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
