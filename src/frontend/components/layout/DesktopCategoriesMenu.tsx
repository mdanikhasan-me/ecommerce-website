'use client'

import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { NAV_CATEGORIES, getCategoryHref } from './header-navigation-data'

const CATEGORY_MENU_DESCRIPTIONS: Record<string, string> = {
  electronics: 'Discover gadgets and smart devices',
  fashion: 'Trendy styles for every occasion',
  'home-appliances': 'Smarter essentials for the home',
  'beauty-health': 'Beauty, wellness and care essentials',
  'sports-fitness': 'Gear for a healthier lifestyle',
  'books-stationery': 'Books, pens and study essentials',
  gaming: 'Level up your gaming experience',
  'toys-collectibles': 'Fun and collectibles for all ages',
}

const DESKTOP_CATEGORY_LINKS = NAV_CATEGORIES.map((category) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  href: getCategoryHref(category.slug),
  description: CATEGORY_MENU_DESCRIPTIONS[category.slug],
}))

export function DesktopCategoriesMenu({
  onClose,
}: {
  onClose: () => void
}) {
  return (
    <div
      id="desktop-categories-menu"
      data-desktop-categories-menu="true"
      data-testid="desktop-categories-menu"
      role="region"
      aria-label="Categories menu"
      className="fixed left-1/2 top-[76px] z-50 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 rounded-b-lg border-x border-b border-border/80 bg-white p-3"
    >
      <nav
        aria-label="Main categories"
        data-testid="desktop-categories-rail"
        className="grid grid-cols-4 gap-2"
      >
        {DESKTOP_CATEGORY_LINKS.map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            data-testid={`desktop-category-link-${category.slug}`}
            aria-label={`Open ${category.name} category`}
            className="flex min-h-[5.5rem] min-w-0 flex-col items-start rounded-md bg-white px-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:min-h-[7rem]"
            onClick={onClose}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center text-foreground">
              <LocalIcon name={category.icon} className="h-5 w-5 shrink-0" />
            </span>

            <span className="mt-2.5 flex w-full min-w-0 items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-foreground">
                {category.name}
              </span>
              <LocalIcon name="arrow-right" className="h-3.5 w-3.5 shrink-0 text-foreground" />
            </span>

            <span className="mt-1.5 hidden max-w-[12rem] text-xs leading-5 text-muted-foreground xl:block">
              {category.description}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
