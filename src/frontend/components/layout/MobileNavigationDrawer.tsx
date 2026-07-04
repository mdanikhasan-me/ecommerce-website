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
          'absolute left-0 top-0 h-full w-[calc(100vw-0.5rem)] max-w-[20.625rem] overflow-hidden bg-white outline-none transition-transform duration-150 ease-out focus:outline-none motion-reduce:transition-none',
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
            <div className="grid grid-cols-1 gap-2 min-[320px]:grid-cols-2">
              {MOBILE_SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 rounded-[0.58rem] border border-[#eeeeee] bg-white px-2 py-[0.7rem] text-left text-[10.75px] font-medium leading-[1rem] text-[#201e26] min-[320px]:px-2.5 min-[320px]:text-[11.5px] min-[360px]:gap-2 min-[360px]:text-[12px]"
                  onClick={onClose}
                >
                  <LocalIcon name={item.icon} className="h-[0.9rem] w-[0.9rem] shrink-0 text-[#292630] min-[320px]:h-4 min-[320px]:w-4" />
                  <span className="min-w-0 truncate whitespace-nowrap">{item.label}</span>
                  <LocalIcon name="chevron-right" className="h-2 w-2 shrink-0 text-[#5f5a64] min-[320px]:h-2.5 min-[320px]:w-2.5" />
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-label="Authenticity promise"
            className="relative mt-4 h-[7.05rem] overflow-hidden rounded-[0.72rem] bg-[radial-gradient(circle_at_78%_45%,rgba(82,106,145,0.28),transparent_34%),linear-gradient(135deg,#070a10_0%,#111824_58%,#06070b_100%)] min-[360px]:h-[6.35rem]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.045),transparent_58%)]" />
            <div className="relative z-10 flex h-full items-center px-4 pr-[4.65rem] text-white min-[360px]:pr-[4.85rem] min-[390px]:pr-[5.45rem]">
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[16px] font-semibold leading-[1.05] tracking-normal min-[390px]:text-[20px]">
                  100% Authentic
                </p>
                <p className="mt-1.5 max-w-[6.5rem] text-[10.5px] font-normal leading-[0.95rem] text-white/82 min-[360px]:max-w-none">
                  Quality you can rely on.
                </p>
              </div>
            </div>
            <div className="absolute right-3 top-1/2 h-[3.65rem] w-[3.65rem] -translate-y-1/2 min-[360px]:h-[3.85rem] min-[360px]:w-[3.85rem] min-[390px]:h-[4.65rem] min-[390px]:w-[4.65rem]">
              <Image
                src="/assets/banners/mobile-menu-authentic-shield.webp"
                alt=""
                fill
                sizes="5rem"
                className="object-contain"
              />
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
