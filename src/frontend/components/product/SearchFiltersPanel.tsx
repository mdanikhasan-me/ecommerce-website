'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/backend/utils'

interface Props {
  brands: { name: string; slug: string }[]
  categories: { name: string; slug: string }[]
  searchParams: Record<string, string | undefined>
}

export function SearchFiltersPanel({ brands, categories, searchParams }: Props) {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? '')

  const applyFilter = (key: string, value: string | undefined) => {
    const sp = new URLSearchParams(searchParams as Record<string, string>)
    if (value) sp.set(key, value)
    else sp.delete(key)
    sp.delete('page')
    router.push(`/search?${sp.toString()}`)
  }

  const clearAll = () => {
    const sp = new URLSearchParams()
    if (searchParams.q) sp.set('q', searchParams.q)
    router.push(`/search?${sp.toString()}`)
  }

  const hasFilters = !!(searchParams.category || searchParams.brand || searchParams.minPrice || searchParams.maxPrice || searchParams.rating || searchParams.inStock)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-primary hover:underline flex items-center gap-1">
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Category</h4>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={searchParams.category === cat.slug}
                onChange={() => applyFilter('category', cat.slug)}
                className="accent-primary"
              />
              <span className={cn('text-sm group-hover:text-primary transition-colors', searchParams.category === cat.slug && 'text-primary font-medium')}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Price Range (৳)</h4>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min" value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-base w-full"
          />
          <input
            type="number" placeholder="Max" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-base w-full"
          />
        </div>
        <button
          onClick={() => {
            const sp = new URLSearchParams(searchParams as Record<string, string>)
            if (minPrice) sp.set('minPrice', minPrice); else sp.delete('minPrice')
            if (maxPrice) sp.set('maxPrice', maxPrice); else sp.delete('maxPrice')
            sp.delete('page')
            router.push(`/search?${sp.toString()}`)
          }}
          className="mt-2 w-full btn-outline text-xs py-1.5"
        >
          Apply Price
        </button>

        {/* Quick ranges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[['0', '5000'], ['5000', '20000'], ['20000', '50000'], ['50000', '']].map(([min, max]) => (
            <button
              key={`${min}-${max}`}
              onClick={() => {
                setMinPrice(min); setMaxPrice(max)
                applyFilter('minPrice', min || undefined)
                applyFilter('maxPrice', max || undefined)
              }}
              className="text-xs border border-border rounded-lg px-2 py-1 hover:bg-secondary transition-colors"
            >
              ৳{min ? Number(min).toLocaleString() : '0'}
              {max ? `–৳${Number(max).toLocaleString()}` : '+'}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Brand</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={searchParams.brand === brand.slug}
                onChange={(e) => applyFilter('brand', e.target.checked ? brand.slug : undefined)}
                className="accent-primary"
              />
              <span className={cn('text-sm group-hover:text-primary transition-colors', searchParams.brand === brand.slug && 'text-primary font-medium')}>
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={searchParams.rating === String(rating)}
                onChange={() => applyFilter('rating', String(rating))}
                className="accent-primary"
              />
              <div className="flex items-center gap-1">
                {Array(rating).fill(0).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 star-filled" />
                ))}
                <span className="text-sm text-muted-foreground">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.inStock === 'true'}
            onChange={(e) => applyFilter('inStock', e.target.checked ? 'true' : undefined)}
            className="accent-primary"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>
    </div>
  )
}
