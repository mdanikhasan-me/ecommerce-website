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
          'absolute left-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.625rem] overflow-hidden bg-white outline-none transition-transform duration-150 ease-out focus:outline-none motion-reduce:transition-none',
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
                  className="flex min-w-0 items-center gap-1.5 rounded-[0.58rem] border border-[#eeeeee] bg-white px-2.5 py-[0.7rem] text-left text-[12px] font-medium leading-[1.1rem] text-[#201e26]"
                  onClick={onClose}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <LocalIcon name={item.icon} className="h-4 w-4 shrink-0 text-[#292630]" />
                    <span className="min-w-0 whitespace-nowrap">{item.label}</span>
                  </span>
                  <LocalIcon name="chevron-right" className="ml-auto h-2.5 w-2.5 shrink-0 text-[#5f5a64]" />
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-label="Authenticity promise"
            className="relative mt-4 aspect-[2.86/1] overflow-hidden rounded-[0.72rem] bg-[radial-gradient(circle_at_78%_44%,rgba(72,92,126,0.26),transparent_34%),linear-gradient(135deg,#080b11_0%,#121722_56%,#07080c_100%)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_56%)]" />
            <div className="relative z-10 flex h-full items-center justify-between gap-3 px-4">
              <div className="min-w-0 text-white">
                <p className="text-[20px] font-semibold leading-[1.05] tracking-normal">
                  100% Authentic
                </p>
                <p className="mt-1.5 text-[10.5px] font-normal leading-[0.95rem] text-white/82">
                  Quality you can rely on.
                </p>
              </div>
              <div className="relative h-[4.85rem] w-[4.85rem] shrink-0">
                <Image
                  src="/assets/banners/mobile-menu-authentic-shield.webp"
                  alt=""
                  fill
                  sizes="5rem"
                  className="object-contain"
                />
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
