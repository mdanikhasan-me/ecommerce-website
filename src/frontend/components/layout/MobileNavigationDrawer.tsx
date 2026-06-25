'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { MOBILE_SUPPORT_LINKS, NAV_CATEGORIES } from './header-navigation-data'

export function MobileNavigationDrawer({
  isOpen,
  isVisible,
  onClose,
}: {
  isOpen: boolean
  isVisible: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isVisible) {
      panelRef.current?.focus()
    }
  }, [isVisible])

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-x-0 bottom-0 top-16 z-50 lg:hidden',
        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <button
        type="button"
        aria-label="Close menu overlay"
        className={cn(
          'absolute inset-0 bg-foreground/20 transition-opacity duration-150 ease-out motion-reduce:transition-none',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        id="mobile-navigation-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        tabIndex={-1}
        className={cn(
          'absolute left-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.625rem] transform-gpu overflow-hidden border-r border-[#e5dfd6] bg-white outline-none transition-transform duration-150 ease-out will-change-transform focus:outline-none motion-reduce:transition-none',
          isVisible ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full overflow-y-auto overscroll-contain px-[1.375rem] py-[1.35rem]">
          <section>
            <h2 className="mb-3.5 text-[14.5px] font-semibold leading-none text-[#111018]">
              Shop by Category
            </h2>
            <div className="overflow-hidden rounded-[0.72rem] border border-[#e8e2da] bg-white">
              {NAV_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex min-w-0 items-center justify-between gap-3 border-b border-[#eee8df] px-3.5 py-[0.92rem] text-[13px] font-[450] leading-none text-[#242129] last:border-b-0"
                  onClick={onClose}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <LocalIcon name={category.icon} className="h-[1.18rem] w-[1.18rem] shrink-0 text-[#292630]" />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <LocalIcon name="chevron-right" className="h-3.5 w-3.5 shrink-0 text-[#5f5a64]" />
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <h2 className="mb-2.5 text-[13px] font-semibold leading-none text-[#111018]">
              Support
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-[0.58rem] border border-[#ebe5dc] bg-white px-3 py-[0.82rem] text-[11.5px] font-[450] leading-none text-[#242129]"
                  onClick={onClose}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <LocalIcon name={item.icon} className="h-[1.05rem] w-[1.05rem] shrink-0 text-[#292630]" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <LocalIcon name="chevron-right" className="h-3 w-3 shrink-0 text-[#5f5a64]" />
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-label="Authenticity promise"
            className="relative mt-4 h-[6.45rem] overflow-hidden rounded-[0.72rem] bg-[radial-gradient(ellipse_at_82%_42%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_20%,transparent_42%),linear-gradient(135deg,#0a0a0d_0%,#15151a_48%,#050506_100%)] px-4 py-4 text-white"
          >
            <div className="absolute inset-y-0 right-0 w-28 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08))]" />
            <div className="relative z-10 max-w-[9.5rem] pt-0.5">
              <p className="text-[15px] font-semibold leading-none tracking-[-0.01em]">100% Authentic</p>
              <p className="mt-2 text-[10.8px] font-normal leading-[1.05rem] text-white/82">
                Original products. Quality you can rely on.
              </p>
            </div>
            <div className="absolute bottom-2.5 right-4 flex h-[4.55rem] w-[4.55rem] items-center justify-center rounded-full bg-white/[0.07] text-white/95 ring-1 ring-white/10">
              <LocalIcon name="shield" className="h-[3.35rem] w-[3.35rem]" />
              <LocalIcon name="check" className="absolute h-5 w-5" />
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
