import Image from 'next/image'
import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { getCategoryMediaPath } from '@/shared/category-media'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  description?: string | null
  children: { id: string; name: string; slug: string }[]
}

const COMPACT_CATEGORY_LABELS: Record<string, string> = {
  'home-appliances': 'Home',
  'beauty-health': 'Beauty',
  'sports-fitness': 'Fitness',
  'books-stationery': 'Books',
  'toys-collectibles': 'Toys',
}

function getCategoryCardLabel(category: Category) {
  return COMPACT_CATEGORY_LABELS[category.slug] ?? category.name.replace(/\s+/g, ' ').trim()
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const visibleCategories = categories.slice(0, 8)

  if (visibleCategories.length === 0) return null

  return (
    <section className="w-full bg-white py-7 sm:py-9 lg:py-10">
      <div className="container-site">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="section-title">Category</h2>
            <p className="mt-2 max-w-[40rem] text-sm leading-6 text-muted-foreground">Browse departments and collections</p>
          </div>

          <Link href="/category" prefetch={false} className="editorial-link group shrink-0">
            All categories
            <LocalIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <div className="category-tile-grid mt-4 sm:mt-5">
          {visibleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const displayName = getCategoryCardLabel(category)

  return (
    <Link
      href={`/category/${category.slug}`}
      prefetch={false}
      aria-label={`Shop ${category.name}`}
      title={category.name}
      className="group relative block aspect-square overflow-hidden rounded-2xl bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Image
        src={getCategoryMediaPath(category)}
        alt={category.name}
        fill
        className="object-cover"
        sizes="(max-width: 559px) 50vw, (max-width: 819px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 16vw"
        quality={75}
      />

      {/* Soft bottom fade keeps the label readable without hiding the photo. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,rgba(15,12,10,0)_0%,rgba(15,12,10,0.48)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 flex min-h-[3.4rem] items-end justify-between gap-2 p-2.5 sm:min-h-[3.75rem] sm:p-3 md:min-h-[4.2rem] md:p-3.5">
        <span className="min-w-0 flex-1 pb-0.5">
          <span className="block line-clamp-2 text-balance text-[0.82rem] font-semibold leading-[1.08] text-white [overflow-wrap:anywhere] [text-shadow:0_1px_5px_rgba(0,0,0,0.52)] sm:text-[0.9rem] lg:text-[0.96rem]">
            {displayName}
          </span>
        </span>

        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8">
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
