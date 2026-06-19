'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type Suggestion = {
  type: 'product'
  name: string
  slug: string
  href: string
}

export function HeaderSearchPanel({
  className,
  onClose,
}: {
  className?: string
  onClose?: () => void
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions([])
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [searchQuery])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowSuggestions(false)
    onClose?.()
  }

  return (
    <div data-search-root="true" className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative w-full">
          <LocalIcon
            name="search"
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
          />
          <input
            aria-label="Search products"
            title="Search products"
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="h-11 w-full rounded-full border border-black/10 bg-[#fff] pl-11 pr-4 text-sm text-foreground shadow-[0_12px_32px_rgba(20,18,16,0.08)] transition-colors placeholder:text-foreground/45 focus:border-foreground/35 focus:outline-none"
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-black/10 bg-[#fff] shadow-[0_18px_38px_rgba(20,18,16,0.14)]">
          {suggestions.map((suggestion) => (
            <Link
              key={`${suggestion.type}-${suggestion.slug}`}
              href={suggestion.href}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors min-[1025px]:hover:bg-secondary"
              onClick={() => {
                setShowSuggestions(false)
                onClose?.()
              }}
            >
              <LocalIcon name="search" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{suggestion.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
