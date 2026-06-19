'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AriaExpandedButton } from '@/frontend/components/ui/AriaExpandedButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { cn } from '@/backend/utils'

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
  preserveOnClear = ['q', 'featured', 'bestSeller'],
  label = 'Search',
}: MobileSearchFiltersProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(searchParams.category)
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? '')
  const [stockMode, setStockMode] = useState<'all' | 'inStock'>(searchParams.inStock === 'true' ? 'inStock' : 'all')
  const panelId = 'mobile-search-filters-panel'
  const titleId = 'mobile-search-filters-title'
  const resolvedBasePath = basePath ?? '/search'
  const selectedCategoryName = categories.find((category) => category.slug === selectedCategory)?.name

  useEffect(() => {
    if (!open) return

    setSelectedCategory(searchParams.category)
    setMinPrice(searchParams.minPrice ?? '')
    setMaxPrice(searchParams.maxPrice ?? '')
    setStockMode(searchParams.inStock === 'true' ? 'inStock' : 'all')
  }, [open, searchParams.category, searchParams.inStock, searchParams.maxPrice, searchParams.minPrice])

  const navigateWithParams = (sp: URLSearchParams) => {
    const query = sp.toString()
    router.push(query ? `${resolvedBasePath}?${query}` : resolvedBasePath)
    setOpen(false)
  }

  const createCurrentParams = () => {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) sp.set(key, value)
    }
    return sp
  }

  const applyFilters = () => {
    const sp = createCurrentParams()

    if (selectedCategory) sp.set('category', selectedCategory)
    else sp.delete('category')

    const cleanMinPrice = minPrice.trim()
    const cleanMaxPrice = maxPrice.trim()
    if (cleanMinPrice) sp.set('minPrice', cleanMinPrice)
    else sp.delete('minPrice')
    if (cleanMaxPrice) sp.set('maxPrice', cleanMaxPrice)
    else sp.delete('maxPrice')

    if (stockMode === 'inStock') sp.set('inStock', 'true')
    else sp.delete('inStock')

    sp.delete('page')
    navigateWithParams(sp)
  }

  const resetFilters = () => {
    const sp = new URLSearchParams()
    for (const key of preserveOnClear) {
      const value = searchParams[key]
      if (value) sp.set(key, value)
    }
    navigateWithParams(sp)
  }

  return (
    <div className="lg:hidden">
      <AriaExpandedButton
        type="button"
        onClick={() => setOpen(true)}
        expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={`Open ${label.toLowerCase()} filters`}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[13px] font-semibold sm:gap-2 sm:px-4 sm:text-sm"
      >
        <LocalIcon name="sliders-horizontal" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            className="absolute inset-x-2 bottom-2 max-h-[90dvh] overflow-hidden rounded-[1.45rem] bg-white shadow-[0_-14px_34px_rgba(23,18,15,0.18)]"
          >
            <div className="mx-auto mt-2 h-1 w-11 rounded-full bg-black/12" aria-hidden="true" />

            <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold leading-6">Filters</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Refine products quickly</p>
              </div>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground"
              >
                <LocalIcon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(90dvh-10.25rem)] overflow-y-auto px-5 pb-4">
              {categories.length > 0 && (
                <section className="border-t border-border/70 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Category</h3>
                      {selectedCategoryName ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{selectedCategoryName}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const selected = selectedCategory === category.slug

                      return (
                        <button
                          key={category.slug}
                          type="button"
                          onClick={() => setSelectedCategory(selected ? undefined : category.slug)}
                          className={cn(
                            'inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                            selected
                              ? 'border-foreground bg-white text-foreground'
                              : 'border-border bg-white text-foreground/75'
                          )}
                        >
                          <span>{category.name}</span>
                          {selected ? <LocalIcon name="check" className="h-3.5 w-3.5" /> : null}
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              <section className="border-t border-border/70 py-4">
                <h3 className="text-sm font-semibold text-foreground">Price Range</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="min-w-0">
                    <span className="sr-only">Minimum price</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      aria-label="Minimum price"
                      className="input-base h-10 w-full rounded-lg text-sm"
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="sr-only">Maximum price</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      aria-label="Maximum price"
                      className="input-base h-10 w-full rounded-lg text-sm"
                    />
                  </label>
                </div>
              </section>

              <section className="border-t border-border/70 py-4">
                <h3 className="text-sm font-semibold text-foreground">Availability</h3>
                <div className="mt-3 flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setStockMode('inStock')}
                    className="inline-flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', stockMode === 'inStock' ? 'border-foreground' : 'border-muted-foreground/50')}>
                      {stockMode === 'inStock' ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
                    </span>
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockMode('all')}
                    className="inline-flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', stockMode === 'all' ? 'border-foreground' : 'border-muted-foreground/50')}>
                      {stockMode === 'all' ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
                    </span>
                    All Items
                  </button>
                </div>
              </section>

            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border/70 bg-white px-5 py-4">
              <button
                type="button"
                onClick={resetFilters}
                className="flex h-11 items-center justify-center rounded-lg border border-foreground/18 bg-white text-sm font-semibold text-foreground"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex h-11 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
