'use client'

import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { NAV_CATEGORIES, getCategoryHref } from './header-navigation-data'

const DESKTOP_CATEGORY_LINKS = NAV_CATEGORIES.map((category) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  href: getCategoryHref(category.slug),
}))

export function DesktopCategoriesMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      id="desktop-categories-menu"
      data-testid="desktop-categories-menu"
      role="region"
      aria-label="Categories menu"
      className="absolute left-1/2 top-full z-50 mt-3 w-[min(52rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-black/10 bg-white"
    >
      <nav
        aria-label="Main categories"
        data-testid="desktop-categories-rail"
        className="grid grid-cols-4 gap-px bg-black/10"
      >
        {DESKTOP_CATEGORY_LINKS.map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            data-testid={`desktop-category-link-${category.slug}`}
            aria-label={`Open ${category.name} category`}
            className="flex min-h-[4.75rem] min-w-0 items-center justify-between gap-3 bg-white px-4 text-[13px] font-semibold leading-5 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={onClose}
          >
            <span className="flex min-w-0 items-center gap-3">
              <LocalIcon name={category.icon} className="h-[1.15rem] w-[1.15rem] shrink-0" />
              <span className="truncate">{category.name}</span>
            </span>
            <LocalIcon name="chevron-right" className="h-3.5 w-3.5 shrink-0 text-foreground/55" />
          </Link>
        ))}
      </nav>
    </div>
  )
}
