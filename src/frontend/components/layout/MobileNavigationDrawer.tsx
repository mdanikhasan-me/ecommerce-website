'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { AriaExpandedButton } from '@/frontend/components/ui/AriaExpandedButton'
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
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isVisible) {
      panelRef.current?.focus()
    }
  }, [isVisible])

  useEffect(() => {
    if (!isOpen) {
      setExpandedMobileCategory(null)
    }
  }, [isOpen])

  return (
    <div
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
          'absolute left-0 top-0 h-full w-[calc(100vw-4rem)] max-w-[20.5rem] transform-gpu overflow-hidden border-r border-black/10 bg-white transition-transform duration-150 ease-out will-change-transform motion-reduce:transition-none',
          isVisible ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full overflow-y-auto overscroll-contain px-3.5 py-4">
          <section>
            <p className="mb-2.5 px-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Categories
            </p>
            <div className="overflow-hidden rounded-lg border border-black/10 bg-card">
              {NAV_CATEGORIES.map((category) => {
                const isExpanded = expandedMobileCategory === `category-${category.slug}`

                return (
                  <div key={category.slug} className="border-b border-border/70 last:border-b-0">
                    <div className="flex items-center">
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-[14px] font-normal leading-none text-foreground"
                        onClick={onClose}
                      >
                        <LocalIcon name={category.icon} className="h-[1.125rem] w-[1.125rem] shrink-0" />
                        <span className="truncate">{category.name}</span>
                      </Link>
                      {category.sub.length > 0 ? (
                        <AriaExpandedButton
                          type="button"
                          aria-label={`Expand ${category.name}`}
                          title={`Expand ${category.name}`}
                          expanded={isExpanded}
                          className="mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground"
                          onClick={() =>
                            setExpandedMobileCategory(isExpanded ? null : `category-${category.slug}`)
                          }
                        >
                          <LocalIcon
                            name="chevron-down"
                            className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-180')}
                          />
                        </AriaExpandedButton>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <div className="border-t border-border/60 bg-secondary/35 py-1">
                        {category.sub.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${sub.slug}`}
                            className="flex items-center gap-2.5 py-2 pl-12 pr-3 text-[12px] font-normal text-muted-foreground"
                            onClick={onClose}
                          >
                            <LocalIcon name={sub.icon} className="h-3.5 w-3.5 shrink-0" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2.5 px-1.5 text-[10px] font-normal uppercase tracking-[0.22em] text-muted-foreground">
              Support
            </p>
            <div className="overflow-hidden rounded-lg border border-black/10 bg-card">
              {MOBILE_SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 border-b border-border/70 px-3.5 py-3 text-[13.5px] font-light leading-none text-foreground/90 last:border-b-0"
                  onClick={onClose}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <LocalIcon name={item.icon} className="h-4 w-4 shrink-0 text-foreground/75" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <LocalIcon name="arrow-right" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
