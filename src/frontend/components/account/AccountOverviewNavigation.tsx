'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const accountLinks: Array<{
  label: string
  href: string
  icon: StorefrontIconName
  active?: boolean
}> = [
  { label: 'Account Overview', href: '/account', icon: 'user', active: true },
  { label: 'Orders', href: '/account/orders', icon: 'shopping-bag' },
  { label: 'Addresses', href: '/account/addresses', icon: 'map-pin' },
  { label: 'Password & Security', href: '/account/profile', icon: 'shield' },
]

export function AccountOverviewNavigation() {
  return (
    <nav aria-label="Account navigation" className="overflow-hidden rounded-lg border border-border bg-card p-2 sm:p-2.5 xl:p-3">
      <div className="divide-y divide-border/80 xl:divide-y-0">
        {accountLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`group relative flex min-h-14 items-center gap-3.5 px-3.5 py-2.5 text-sm font-medium transition-colors sm:min-h-16 sm:px-4 xl:min-h-[3.25rem] xl:rounded-md xl:px-3.5 xl:py-2 ${
              item.active
                ? 'bg-black/[0.035] text-foreground before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary'
                : 'text-foreground hover:bg-black/[0.025]'
            }`}
          >
            <LocalIcon name={item.icon} className="h-5 w-5" />
            <span className="min-w-0 flex-1">{item.label}</span>
            <LocalIcon name="chevron-right" className="h-4 w-4 text-muted-foreground xl:hidden" />
          </Link>
        ))}
      </div>

      <div className="mt-1 border-t border-border px-1 pt-2 xl:mt-3 xl:px-0 xl:pt-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex min-h-14 w-full items-center gap-3.5 rounded-md px-3.5 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50/60 sm:min-h-16 sm:px-4 xl:min-h-[3.25rem] xl:px-3.5 xl:py-2"
        >
          <LocalIcon name="log-out" className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
