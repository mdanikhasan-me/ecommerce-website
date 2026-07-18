import Image from 'next/image'
import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { getCategoryMediaPath } from '@/shared/category-media'
import type { StorefrontIconName } from '@/shared/storefront-icons'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  description?: string | null
  children: { id: string; name: string; slug: string }[]
}

const CATEGORY_ICON_NAMES: Record<string, StorefrontIconName> = {
  electronics: 'category-electronics',
  fashion: 'category-fashion',
  'home-appliances': 'category-home-appliances',
  'beauty-health': 'category-beauty-health',
  'sports-fitness': 'category-sports-fitness',
  'books-stationery': 'category-books-stationery',
  gaming: 'category-gaming',
  'toys-collectibles': 'category-toys-collectibles',
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const visibleCategories = categories.slice(0, 8)

  if (visibleCategories.length === 0) return null

  return (
    <section className="w-full bg-white">
      <div className="storefront-frame home-category-frame">
        <div className="category-tile-scope product-section-rhythm w-full">
          <div className="product-section-header">
            <div className="min-w-0">
              <h2 className="section-title">Category</h2>
              <p className="mt-2 max-w-[42rem] text-sm leading-6 text-muted-foreground sm:text-base">
                Explore our wide range of products across all categories.
              </p>
            </div>

            <Link
              href="/category"
              prefetch={false}
              className="editorial-link hidden w-fit shrink-0 sm:inline-flex"
            >
              View all categories
              <LocalIcon name="chevron-right" className="h-4 w-4" />
            </Link>
          </div>

          <div className="category-tile-grid">
            {visibleCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <Link
            href="/category"
            prefetch={false}
            className="editorial-link inline-flex w-fit sm:hidden"
          >
            View all categories
            <LocalIcon name="chevron-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const displayName = category.name.replace(/\s+/g, ' ').trim()

  return (
    <Link
      href={`/category/${category.slug}`}
      prefetch={false}
      aria-label={`Shop ${category.name}`}
      className="group block overflow-hidden rounded-xl border border-border/60 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-white">
        <Image
          src={getCategoryMediaPath(category)}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(max-width: 767px) 44vw, (max-width: 1023px) 31vw, 25vw"
          quality={75}
        />
      </div>

      <div className="flex h-16 items-center justify-between gap-2 border-t border-border/55 bg-white px-3 sm:h-[4.5rem] sm:gap-3 sm:px-5">
        <span className="flex min-w-0 items-center gap-3">
          <LocalIcon
            name={CATEGORY_ICON_NAMES[category.slug] ?? 'category-view-all'}
            className="h-5 w-5 text-foreground sm:h-6 sm:w-6"
          />
          <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-tight text-foreground sm:text-base">
            {displayName}
          </span>
        </span>

        <LocalIcon
          name="arrow-right"
          className="h-4 w-4 text-foreground sm:h-5 sm:w-5"
        />
      </div>
    </Link>
  )
}
