'use client'

import Image from 'next/image'
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
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'absolute left-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.625rem] transform-gpu overflow-hidden bg-white outline-none transition-transform duration-150 ease-out will-change-transform focus:outline-none motion-reduce:transition-none',
          isVisible ? 'translate-x-0' : '-translate-x-full'
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
                  className="flex min-w-0 items-center justify-between gap-3 border-b border-[#f1f1f1] px-3.5 py-[0.96rem] text-[13px] font-[450] leading-[1.2rem] text-[#242129] last:border-b-0"
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
            <h2 className="mb-2.5 text-[13px] font-semibold leading-[1.1rem] text-[#111018]">
              Support
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-[0.58rem] border border-[#eeeeee] bg-white px-3 py-[0.74rem] text-[11.5px] font-[450] leading-[1.05rem] text-[#242129]"
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
            className="relative mt-4 aspect-[2.86/1] overflow-hidden rounded-[0.72rem] bg-black"
          >
            <Image
              src="/assets/banners/mobile-menu-authentic.webp"
              alt="100% Authentic. Original products. Quality you can rely on."
              fill
              sizes="(max-width: 640px) 18rem, 20rem"
              className="object-cover"
            />
          </section>
        </div>
      </aside>
    </div>
  )
}
