import Image from 'next/image'
import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { getCategoryConfig } from '@/frontend/components/category/category-config'
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

      <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
        {visibleCategories.map((category) => (
          <MobileCategoryTile key={category.id} category={category} />
        ))}
      </div>

      <div className="mt-6 hidden justify-center gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(156px,188px))] sm:grid lg:gap-4">
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
      className="group relative isolate flex aspect-[1.05] min-h-[118px] min-w-0 overflow-hidden rounded-[18px] border border-black/6 bg-[#f5efe6] shadow-[0_16px_34px_-34px_rgba(15,23,42,0.16)]"
    >
      <div className="absolute inset-0">
        <Image
          src={getCategoryMediaPath(category)}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 46vw, 172px"
          quality={82}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_8%,rgba(15,23,42,0.14)_50%,rgba(15,23,42,0.78)_100%)]" />

      <div className="relative z-10 mt-auto flex items-end justify-between gap-2 p-2.5">
        <div className="max-w-[72%]">
          <p className="text-[0.86rem] font-semibold leading-4 text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.38)]">
            {category.name}
          </p>
          <p className="mt-0.5 text-[0.68rem] font-medium leading-4 text-white/85 drop-shadow-[0_2px_10px_rgba(15,23,42,0.38)]">
            {formatProductCount(category.productCount)}
          </p>
        </div>

        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--buttermilk))] text-[#161616] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.42)]">
          <LocalIcon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-black/5" />
    </Link>
  )
}

function CategoryTile({ category }: { category: Category }) {
  const config = getCategoryConfig(category.slug)
  const imageSrc = getCategoryMediaPath(category)

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative isolate flex aspect-square min-h-[172px] min-w-0 overflow-hidden rounded-[24px] border border-black/6 bg-[#f5efe6] shadow-[0_18px_42px_-38px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_-38px_rgba(15,23,42,0.22)]"
    >
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 40vw, (max-width: 1280px) 20vw, 16vw"
          quality={84}
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.16)_50%,rgba(15,23,42,0.8)_100%)]" />

      <div className={`absolute inset-x-0 top-0 h-24 opacity-60 ${config?.glowClass ?? ''}`} />

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 p-3.5">
        <div className="max-w-[72%]">
          <p className="text-[1.05rem] font-semibold leading-5 text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.42)]">
            {category.name}
          </p>
          <p className="mt-1 text-[0.78rem] font-medium leading-4 text-white/85 drop-shadow-[0_2px_12px_rgba(15,23,42,0.42)]">
            {formatProductCount(category.productCount)}
          </p>
        </div>

        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--buttermilk))] text-[#161616] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.42)] transition-transform duration-200 group-hover:translate-x-0.5">
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-black/5" />
    </Link>
  )
}
