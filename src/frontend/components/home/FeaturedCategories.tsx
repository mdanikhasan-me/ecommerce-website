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
    <section className="w-full bg-white py-9 sm:py-11 lg:py-14">
      <div className="container-site">
        <div className="category-tile-scope mx-auto w-full max-w-[106rem]">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="section-kicker">Shop by</p>
              <h2 className="section-title mt-2">Category</h2>
              <p className="mt-4 max-w-[42rem] text-[0.98rem] leading-6 text-muted-foreground sm:text-base">
                Explore our wide range of products across all categories.
              </p>
            </div>

            <Link
              href="/category"
              prefetch={false}
              className="hidden shrink-0 items-center gap-5 border-b border-foreground/45 pb-2 text-sm font-semibold text-foreground sm:inline-flex lg:text-base"
            >
              View all categories
              <LocalIcon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>

          <div className="category-tile-grid mt-7">
            {visibleCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <Link
            href="/category"
            prefetch={false}
            className="mt-5 inline-flex items-center gap-4 border-b border-foreground/45 pb-2 text-sm font-semibold text-foreground sm:hidden"
          >
            View all categories
            <LocalIcon name="arrow-right" className="h-4 w-4" />
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
      title={category.name}
      className="group block overflow-hidden rounded-lg border border-border/70 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-white">
        <Image
          src={getCategoryMediaPath(category)}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(min-width: 1536px) 18.5rem, (min-width: 1024px) 18rem, (min-width: 768px) 15.5rem, (max-width: 559px) 44vw, 33vw"
          quality={90}
        />
      </div>

      <div className="flex min-h-[3.9rem] items-center justify-between gap-2 border-t border-border/65 bg-white px-3 py-3 sm:min-h-[4.15rem] sm:gap-3 sm:px-5 sm:py-3.5">
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
