'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, LogOut, Settings, UserRound } from 'lucide-react'
import { cn } from '@/backend/utils'

type AdminProfileMenuProps = {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string }
}

export function AdminProfileMenu({ user }: AdminProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const displayName = user.name || user.email || 'Administrator'
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!isOpen) return

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnPointerDown)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Open administrator profile menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn('admin-profile-trigger', isOpen && 'admin-profile-trigger-open')}
      >
        <span className="admin-profile-avatar">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span>{initial}</span>
          )}
        </span>
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block max-w-36 truncate text-xs font-semibold leading-4">{displayName}</span>
          <span className="block text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {user.role.replace('_', ' ')}
          </span>
        </span>
      </button>

      {isOpen ? (
        <div role="menu" aria-label="Administrator profile" className="admin-profile-popover">
          <div className="admin-profile-summary">
            <span className="admin-profile-avatar h-11 w-11 text-sm">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{initial}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{displayName}</span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
          </div>

          <div className="grid gap-1 p-2">
            <ProfileMenuLink href="/admin/profile" icon={UserRound} label="Profile settings" onNavigate={() => setIsOpen(false)} />
            <ProfileMenuLink href="/admin/settings" icon={Settings} label="Store settings" onNavigate={() => setIsOpen(false)} />
            <ProfileMenuLink href="/" icon={ExternalLink} label="View storefront" onNavigate={() => setIsOpen(false)} external />
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                const { signOut } = await import('next-auth/react')
                signOut({ callbackUrl: '/auth/login' })
              }}
              className="admin-profile-menu-item text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
  external = false,
}: {
  href: string
  icon: typeof UserRound
  label: string
  onNavigate: () => void
  external?: boolean
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="admin-profile-menu-item"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
