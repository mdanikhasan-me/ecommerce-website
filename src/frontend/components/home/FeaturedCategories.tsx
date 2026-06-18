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
  productCount: number
  children: { id: string; name: string; slug: string }[]
}

function formatProductCount(count: number) {
  return `${count} ${count === 1 ? 'product' : 'products'}`
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const visibleCategories = categories.slice(0, 8)

  if (visibleCategories.length === 0) return null

  return (
    <section className="w-full border-y border-border/55 bg-gradient-to-b from-card to-secondary/30 py-7 sm:py-9 lg:py-10">
      <div className="container-site">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title">Shop by category</h2>

          <Link href="/category" className="editorial-link group shrink-0">
            All categories
            <LocalIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:gap-3.5 min-[1120px]:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {visibleCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block aspect-square overflow-hidden rounded-2xl bg-secondary ring-1 ring-black/[0.06] sm:transition sm:duration-150 md:hover:ring-black/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Image
        src={getCategoryMediaPath(category)}
        alt={category.name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 46vw, (max-width: 767px) 31vw, (max-width: 1119px) 24vw, (max-width: 1279px) 20vw, (max-width: 1535px) 16vw, 13vw"
        quality={75}
      />

      {/* Soft bottom fade keeps the label readable without hiding the photo. */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,rgba(15,12,10,0)_0%,rgba(15,12,10,0.34)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-3.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[0.92rem] font-semibold leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.38)] sm:text-[1rem]">
            {category.name}
          </p>
          <p className="mt-1 text-[0.72rem] font-medium text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.34)] sm:text-xs">
            {formatProductCount(category.productCount)}
          </p>
        </div>

        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white ring-1 ring-black/[0.04] sm:transition-colors sm:duration-150 md:group-hover:bg-white/30">
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
