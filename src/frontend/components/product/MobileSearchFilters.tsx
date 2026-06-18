'use client'

import { useState } from 'react'
import { AriaExpandedButton } from '@/frontend/components/ui/AriaExpandedButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'

type MobileSearchFiltersProps = {
  categories: { name: string; slug: string }[]
  searchParams: Record<string, string | undefined>
  basePath?: string
  preserveOnClear?: string[]
  label?: string
}

export function MobileSearchFilters({
  categories,
  searchParams,
  basePath,
  preserveOnClear,
  label = 'Search',
}: MobileSearchFiltersProps) {
  const [open, setOpen] = useState(false)
  const panelId = 'mobile-search-filters-panel'
  const titleId = 'mobile-search-filters-title'

  return (
    <div className="lg:hidden">
      <AriaExpandedButton
        type="button"
        onClick={() => setOpen(true)}
        expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={`Open ${label.toLowerCase()} filters`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold shadow-[0_4px_12px_rgba(23,18,15,0.04)] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      >
        <LocalIcon name="filter" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Filters
      </AriaExpandedButton>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/28"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[1.5rem] bg-background shadow-[0_-12px_28px_rgba(23,18,15,0.16)]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="section-kicker text-[10px]">{label}</p>
                <h2 id={titleId} className="font-display text-lg font-semibold">Filters</h2>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-card p-2"
              >
                <LocalIcon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(86vh-4.5rem)] overflow-y-auto px-5 py-5">
              <SearchFiltersPanel
                categories={categories}
                searchParams={searchParams}
                basePath={basePath}
                preserveOnClear={preserveOnClear}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
