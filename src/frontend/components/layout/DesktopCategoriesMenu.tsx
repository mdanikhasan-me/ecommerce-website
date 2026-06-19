'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { ariaPressed } from '@/frontend/components/ui/aria'
import {
  DEFAULT_DESKTOP_CATEGORY_SLUG,
  NAV_CATEGORIES,
  getCategoryHref,
  getViewAllCategoryLabel,
} from './header-navigation-data'

export function DesktopCategoriesMenu({ onClose }: { onClose: () => void }) {
  const [selectedDesktopCategorySlug, setSelectedDesktopCategorySlug] = useState(DEFAULT_DESKTOP_CATEGORY_SLUG)
  const selectedDesktopCategory =
    NAV_CATEGORIES.find((category) => category.slug === selectedDesktopCategorySlug) ??
    NAV_CATEGORIES.find((category) => category.slug === DEFAULT_DESKTOP_CATEGORY_SLUG) ??
    NAV_CATEGORIES[0]

  return (
    <div
      id="desktop-categories-menu"
      data-testid="desktop-categories-menu"
      role="region"
      aria-label="Categories menu"
      className="absolute left-1/2 top-full z-50 mt-4 h-[25rem] max-h-[calc(100vh-7rem)] w-[min(60rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-black/10 bg-white"
    >
      <div className="grid h-full min-h-[18rem] grid-cols-[15.75rem_minmax(0,1fr)]">
        <nav
          aria-label="Category departments"
          data-testid="desktop-categories-rail"
          className="overflow-y-auto border-r border-black/10 bg-[#fffaf5] p-3"
        >
          <div className="space-y-0.5">
            {NAV_CATEGORIES.map((category) => {
              const isSelected = category.slug === selectedDesktopCategory.slug

              return (
                <div
                  key={category.slug}
                  className={cn(
                    'group flex min-h-[2.75rem] items-center rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors',
                    isSelected
                      ? 'bg-secondary/80 text-foreground shadow-[0_10px_24px_rgba(20,18,16,0.06)]'
                      : 'text-foreground/78 md:hover:bg-secondary/45 md:hover:text-foreground'
                  )}
                >
                  <button
                    type="button"
                    data-testid={`desktop-category-rail-${category.slug}`}
                    data-selected={isSelected ? 'true' : 'false'}
                    data-route={getCategoryHref(category.slug)}
                    {...ariaPressed(isSelected)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onFocus={() => setSelectedDesktopCategorySlug(category.slug)}
                    onClick={() => setSelectedDesktopCategorySlug(category.slug)}
                  >
                    <LocalIcon name={category.icon} className="h-[1.125rem] w-[1.125rem] shrink-0 text-foreground" />
                    <span className="min-w-0 flex-1 whitespace-nowrap">{category.name}</span>
                  </button>
                  <Link
                    href={getCategoryHref(category.slug)}
                    data-testid={`desktop-category-rail-link-${category.slug}`}
                    aria-label={`Open ${category.name} category`}
                    className="ml-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground/40 transition-colors md:hover:bg-[#fff] md:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    onClick={onClose}
                  >
                    <LocalIcon
                      name="chevron-right"
                      className={cn('h-3.5 w-3.5', isSelected && 'text-foreground/65')}
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        </nav>

        <section
          aria-labelledby={`desktop-category-panel-heading-${selectedDesktopCategory.slug}`}
          data-testid="desktop-category-selected-panel"
          className="min-h-0 overflow-hidden bg-white px-8 py-8"
        >
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/70 text-foreground">
              <LocalIcon name={selectedDesktopCategory.icon} className="h-6 w-6" />
            </span>
            <h2
              id={`desktop-category-panel-heading-${selectedDesktopCategory.slug}`}
              className="font-display text-xl font-semibold leading-tight text-foreground"
            >
              {selectedDesktopCategory.name}
            </h2>
          </div>

          <div data-testid="desktop-subcategory-tiles" className="mt-8 grid auto-rows-fr grid-cols-5 gap-4">
            {selectedDesktopCategory.sub.map((sub) => (
              <Link
                key={sub.slug}
                href={getCategoryHref(sub.slug)}
                data-testid={`desktop-subcategory-tile-${sub.slug}`}
                className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-lg border border-black/10 bg-[#fff] px-3 py-4 text-center text-foreground transition-colors md:hover:border-black/20 md:hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onClick={onClose}
              >
                <LocalIcon name={sub.icon} className="h-8 w-8 text-foreground" />
                <span className="text-[13px] font-medium leading-5">{sub.name}</span>
              </Link>
            ))}
            <Link
              href={getCategoryHref(selectedDesktopCategory.slug)}
              data-testid={`desktop-subcategory-tile-view-all-${selectedDesktopCategory.slug}`}
              data-tile-kind="view-all"
              aria-label={getViewAllCategoryLabel(selectedDesktopCategory)}
              className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-lg border border-black/10 bg-[#fff] px-3 py-4 text-center text-foreground transition-colors md:hover:border-black/20 md:hover:bg-secondary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={onClose}
            >
              <LocalIcon name="subcategory-grid" className="h-8 w-8 text-foreground" />
              <span className="text-[13px] font-medium leading-5">
                {getViewAllCategoryLabel(selectedDesktopCategory)}
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
