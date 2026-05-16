'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
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

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-[0_10px_24px_rgba(23,18,15,0.05)]"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/36"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[1.5rem] bg-background shadow-[0_-24px_54px_rgba(23,18,15,0.22)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="section-kicker text-[10px]">{label}</p>
                <h2 className="font-display text-lg font-semibold">Filters</h2>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-card p-2"
              >
                <X className="h-4 w-4" />
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
