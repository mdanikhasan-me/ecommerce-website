'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/backend/utils'

interface Props {
  categories: { name: string; slug: string }[]
  searchParams: Record<string, string | undefined>
  onNavigate?: () => void
}

export function SearchFiltersPanel({ categories, searchParams, onNavigate }: Props) {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? '')

  const applyFilter = (key: string, value: string | undefined) => {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    if (value) sp.set(key, value)
    else sp.delete(key)
    sp.delete('page')
    router.push(`/search?${sp.toString()}`)
    onNavigate?.()
  }

  const applyPriceRange = (nextMin: string, nextMax: string) => {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    if (nextMin) sp.set('minPrice', nextMin)
    else sp.delete('minPrice')
    if (nextMax) sp.set('maxPrice', nextMax)
    else sp.delete('maxPrice')
    sp.delete('page')
    router.push(`/search?${sp.toString()}`)
    onNavigate?.()
  }

  const clearAll = () => {
    const sp = new URLSearchParams()
    if (searchParams.q) sp.set('q', searchParams.q)
    router.push(`/search?${sp.toString()}`)
    onNavigate?.()
  }

  const hasFilters = !!(
    searchParams.category ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.rating ||
    searchParams.inStock
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        {hasFilters && (
          <button type="button" onClick={clearAll} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Category</h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label key={cat.slug} className="group flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={searchParams.category === cat.slug}
                onChange={() => applyFilter('category', cat.slug)}
                aria-label={`Filter by category ${cat.name}`}
                className="accent-primary"
              />
              <span className={cn('text-sm transition-colors group-hover:text-primary', searchParams.category === cat.slug && 'font-medium text-primary')}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Price Range (Tk)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
            className="input-base w-full"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
            className="input-base w-full"
          />
        </div>
        <button
          type="button"
          onClick={() => applyPriceRange(minPrice, maxPrice)}
          className="btn-outline mt-2 w-full py-1.5 text-xs"
        >
          Apply Price
        </button>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[['0', '5000'], ['5000', '20000'], ['20000', '50000'], ['50000', '']].map(([min, max]) => (
            <button
              type="button"
              key={`${min}-${max}`}
              onClick={() => {
                setMinPrice(min)
                setMaxPrice(max)
                applyPriceRange(min, max)
              }}
              className="rounded-lg border border-border px-2 py-1 text-xs transition-colors hover:bg-secondary"
            >
              Tk {min ? Number(min).toLocaleString() : '0'}
              {max ? ` to Tk ${Number(max).toLocaleString()}` : '+'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((rating) => {
            const selected = searchParams.rating === String(rating)

            return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={selected ? `Clear minimum rating ${rating} stars` : `Minimum rating ${rating} stars`}
              onClick={() => applyFilter('rating', selected ? undefined : String(rating))}
              className="group flex w-full cursor-pointer items-center gap-2 text-left"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-primary' : 'border-muted-foreground/60 group-hover:border-primary'
                )}
              >
                {selected ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
              </span>
              <div className="flex items-center gap-1">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 star-filled" />
                ))}
                <span className="text-sm text-muted-foreground">and up</span>
              </div>
            </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Availability</h4>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={searchParams.inStock === 'true'}
            onChange={(e) => applyFilter('inStock', e.target.checked ? 'true' : undefined)}
            aria-label="Show in-stock products only"
            className="accent-primary"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  )
}
