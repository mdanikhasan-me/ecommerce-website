'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Session } from 'next-auth'
import { cn } from '@/backend/utils'
import { AccountAvatar } from '@/frontend/components/account/AccountAvatar'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { MOBILE_ACCOUNT_LINKS } from './header-navigation-data'

export function MobileAccountDrawer({
  isOpen,
  session,
  onClose,
}: {
  isOpen: boolean
  session: Session
  onClose: () => void
}) {
  const panelRef = useRef<HTMLElement>(null)
  const mobileAccountName = session.user.name?.trim() || 'My Account'
  const mobileAccountEmail = session.user.email?.trim() || 'Signed-in customer'
  const isAdminAccount = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen])

  return (
    <div
      aria-hidden={!isOpen}
      inert={isOpen ? undefined : true}
      className={cn(
        'fixed inset-x-0 bottom-0 top-16 z-50 overflow-hidden overscroll-none transition-[visibility] duration-0 lg:hidden motion-reduce:transition-none',
        isOpen
          ? 'visible pointer-events-auto delay-0'
          : 'invisible pointer-events-none delay-100'
      )}
    >
      <button
        type="button"
        aria-label="Close account overlay"
        className={cn(
          'absolute inset-0 touch-none bg-foreground/20 transition-opacity duration-100 ease-out motion-reduce:transition-none',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        id="mobile-account-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Account menu"
        tabIndex={-1}
        className={cn(
          'absolute right-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.5rem] translate-x-full overflow-hidden border-l border-black/10 bg-white transition-transform duration-100 ease-out motion-reduce:transition-none',
          isOpen && 'translate-x-0'
        )}
      >
        <div className="h-full overflow-y-auto overscroll-contain px-3.5 py-4">
          <div className="flex items-center gap-3 border border-black/10 bg-card px-3.5 py-3.5">
            <AccountAvatar
              imageUrl={session.user.image}
              name={mobileAccountName}
              className="h-14 w-14 border border-black/10 bg-secondary/50"
              fallbackClassName="text-[1rem]"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.95rem] font-normal leading-tight text-foreground">
                Hi, {mobileAccountName}
              </span>
              <span className="mt-1 block truncate text-[0.78rem] text-muted-foreground">
                {mobileAccountEmail}
              </span>
              {isAdminAccount ? (
                <span className="mt-2 inline-flex rounded-md border border-black/10 bg-background px-2 py-0.5 text-[11px] font-normal text-foreground">
                  Admin
                </span>
              ) : null}
            </span>
          </div>

          <section className="mt-3 border border-black/10 bg-card">
            <p className="border-b border-border/70 px-3.5 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Your Account
            </p>
            <div className="divide-y divide-border/70">
              {MOBILE_ACCOUNT_LINKS.filter((item) => !item.adminOnly || isAdminAccount).map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className="flex min-h-[4.75rem] items-center gap-3 px-3.5 py-3"
                  onClick={onClose}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-foreground">
                    <LocalIcon name={item.icon} className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.88rem] font-normal leading-tight text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.74rem] text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <LocalIcon name="chevron-right" className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-destructive/35 bg-transparent px-4 text-[0.88rem] font-normal text-destructive"
            onClick={async () => {
              onClose()
              const { signOut } = await import('next-auth/react')
              signOut({ callbackUrl: '/' })
            }}
          >
            <LocalIcon name="log-out" className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  )
}
