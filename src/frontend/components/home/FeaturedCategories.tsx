import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_CONFIG } from '@/frontend/components/category/category-config'
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

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  const visibleCategories = categories.slice(0, 8)

  if (visibleCategories.length === 0) return null

  return (
    <section className="section-shell px-5 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Browse Categories</p>
          <h2 className="mt-3 section-title max-w-[12ch]">
            Shop by category
          </h2>
        </div>

        <Link
          href="/category"
          className="editorial-link group self-start"
        >
          All categories
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-8 grid justify-center gap-4 [grid-template-columns:repeat(auto-fit,minmax(172px,204px))]">
        {visibleCategories.map((category) => (
          <CategoryTile key={category.id} category={category} />
        ))}
      </div>
    </section>
  )
}

function CategoryTile({ category }: { category: Category }) {
  const config = CATEGORY_CONFIG[category.slug]
  const imageSrc = getCategoryMediaPath(category)

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative isolate flex aspect-square min-h-[196px] overflow-hidden rounded-[28px] border border-black/6 bg-[#f5efe6] shadow-[0_20px_48px_-38px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-38px_rgba(15,23,42,0.22)]"
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

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 p-4">
        <p className="max-w-[72%] text-[1.22rem] font-semibold leading-6 text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.42)]">
          {category.name}
        </p>

        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--buttermilk))] text-[#161616] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.42)] transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/5" />
    </Link>
  )
}
