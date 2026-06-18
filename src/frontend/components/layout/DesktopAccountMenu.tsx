'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function DesktopAccountMenu({ session }: { session: Session }) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-50 mt-4 w-56 overflow-hidden rounded-lg border border-black/10 bg-[#fff] shadow-[0_24px_56px_rgba(20,18,16,0.16)]"
    >
      <div className="border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold text-foreground">
          {session.user.name ?? 'My Account'}
        </p>
        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
      </div>
      <div className="p-1.5">
        {session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? (
          <Link
            href="/admin"
            role="menuitem"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors md:hover:bg-secondary"
          >
            <LocalIcon name="layout-dashboard" className="h-4 w-4" />
            Admin Panel
          </Link>
        ) : null}
        <Link
          href="/account"
          role="menuitem"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:hover:bg-secondary"
        >
          <LocalIcon name="user" className="h-4 w-4" />
          My Account
        </Link>
        <Link
          href="/account/orders"
          role="menuitem"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:hover:bg-secondary"
        >
          <LocalIcon name="package" className="h-4 w-4" />
          My Orders
        </Link>
        <Link
          href="/wishlist"
          role="menuitem"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:hover:bg-secondary"
        >
          <LocalIcon name="heart" className="h-4 w-4" />
          Wishlist
        </Link>
        <Link
          href="/compare"
          role="menuitem"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:hover:bg-secondary"
        >
          <LocalIcon name="compare" className="h-4 w-4" />
          Compare
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors md:hover:bg-secondary"
        >
          <LocalIcon name="log-out" className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
