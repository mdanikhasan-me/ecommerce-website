'use client'

import { signOut } from 'next-auth/react'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function AccountSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors md:hover:bg-destructive/5 sm:px-5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-destructive transition-colors md:group-hover:bg-destructive/10 sm:h-11 sm:w-11">
        <LocalIcon name="log-out" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-destructive">Sign Out</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">End your session on this device</span>
      </span>
    </button>
  )
}
