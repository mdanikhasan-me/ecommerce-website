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
    <section className="section-shell px-3.5 py-4 sm:px-6 sm:py-7 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Browse Categories</p>
          <h2 className="mt-2 section-title max-w-[12ch] sm:max-w-none">
            Shop by category
          </h2>
        </div>

        <Link
          href="/category"
          className="editorial-link group self-start"
        >
          All categories
          <LocalIcon name="arrow-right" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:hidden">
        {visibleCategories.map((category) => (
          <MobileCategoryTile key={category.id} category={category} />
        ))}
      </div>

      <div className="mt-6 hidden grid-cols-3 gap-3.5 sm:grid lg:grid-cols-4 lg:gap-4 min-[1120px]:grid-cols-6 2xl:grid-cols-8">
        {visibleCategories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}

function MobileCategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.05rem] border border-border/75 bg-card shadow-[0_14px_30px_rgba(23,18,15,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/16 hover:shadow-[0_18px_36px_rgba(23,18,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[1.18] overflow-hidden bg-secondary/55">
        <Image
          src={getCategoryMediaPath(category)}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          sizes="(max-width: 640px) 46vw, 172px"
          quality={82}
        />
      </div>

      <div className="flex min-h-[4.7rem] items-center justify-between gap-2 border-t border-border/65 bg-card px-3 py-2.5">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[0.86rem] font-semibold leading-4 text-foreground">
            {category.name}
          </p>
          <p className="mt-0.5 text-[0.68rem] font-medium leading-4 text-muted-foreground">
            {formatProductCount(category.productCount)}
          </p>
        </div>

        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
          <LocalIcon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

function CategoryTile({ category }: { category: Category }) {
  const imageSrc = getCategoryMediaPath(category)

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-[1.15rem] border border-border/75 bg-card shadow-[0_16px_34px_rgba(23,18,15,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/16 hover:shadow-[0_22px_44px_rgba(23,18,15,0.085)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[1.16] overflow-hidden bg-secondary/55">
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 40vw, (max-width: 1280px) 20vw, 16vw"
          quality={84}
        />
      </div>

      <div className="flex min-h-[5.25rem] items-center justify-between gap-3 border-t border-border/65 bg-card px-3.5 py-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[0.98rem] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
            {category.name}
          </p>
          <p className="mt-1 text-[0.75rem] font-medium leading-4 text-muted-foreground">
            {formatProductCount(category.productCount)}
          </p>
        </div>

        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
