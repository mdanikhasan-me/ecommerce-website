'use client'

import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { MOBILE_SUPPORT_LINKS, NAV_CATEGORIES } from './header-navigation-data'

export function MobileNavigationDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
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
        aria-label="Close menu overlay"
        className={cn(
          'absolute inset-0 touch-none bg-[#111318]/35 transition-opacity duration-100 ease-out motion-reduce:transition-none',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'absolute left-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.5rem] -translate-x-full overflow-hidden bg-white outline-none transition-transform duration-100 ease-out focus:outline-none motion-reduce:transition-none',
          isOpen && 'translate-x-0'
        )}
      >
        <div className="h-full overflow-y-auto overscroll-contain px-[1.375rem] pb-5 pt-8">
          <section>
            <h2 className="mb-3.5 text-[14.5px] font-semibold leading-[1.2rem] text-[#111018]">
              Shop by Category
            </h2>
            <div className="overflow-hidden rounded-[0.72rem] border border-[#eeeeee] bg-white">
              {NAV_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex min-h-14 min-w-0 items-center justify-between gap-3 border-b border-[#f1f1f1] px-4 text-[13px] font-[450] leading-[1.2rem] text-[#242129] last:border-b-0"
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
            <Link
              href="/category"
              className="mt-3 flex min-h-14 items-center justify-between rounded-[0.65rem] bg-[#f5f6f8] px-4 text-[13px] font-semibold text-[#201e26]"
              onClick={onClose}
            >
              View all categories
              <LocalIcon name="arrow-right" className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="mt-4">
            <h2 className="mb-2.5 text-[13px] font-semibold leading-[1.1rem] text-[#111018]">
              Support
            </h2>
            <div className="grid grid-cols-1 gap-2 min-[320px]:grid-cols-2">
              {MOBILE_SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="grid min-h-14 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-[0.58rem] border border-[#eeeeee] bg-white px-2.5 text-left text-[10.75px] font-medium leading-[1rem] text-[#201e26] min-[320px]:px-3 min-[320px]:text-[11.5px] min-[360px]:gap-2 min-[360px]:text-[12px]"
                  onClick={onClose}
                >
                  <LocalIcon name={item.icon} className="h-[0.9rem] w-[0.9rem] shrink-0 text-[#292630] min-[320px]:h-4 min-[320px]:w-4" />
                  <span className="min-w-0 truncate whitespace-nowrap">{item.label}</span>
                  <LocalIcon name="chevron-right" className="h-2 w-2 shrink-0 text-[#5f5a64] min-[320px]:h-2.5 min-[320px]:w-2.5" />
                </Link>
              ))}
            </div>
          </section>

        </div>
      </aside>
    </div>
  )
}
