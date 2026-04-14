import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_CONFIG, getCategoryConfig } from '@/frontend/components/category/category-config'

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
    <section className="rounded-[34px] border border-black/6 bg-[#fbf8f2] px-5 py-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.18)] sm:px-8 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-[2.3rem] leading-[0.95] tracking-tight text-[#161616] sm:text-[3rem]">
          Shop by Category
        </h2>

        <Link
          href="/category"
          className="group inline-flex items-center gap-2 self-start rounded-full border border-black/8 bg-[#faf8f4] px-5 py-3 text-sm font-semibold text-[#161616] transition-colors hover:bg-white"
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
  const config = getCategoryConfig(category.slug)
  const imageSrc = getCategoryImagePath(category.slug)

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative isolate flex aspect-square min-h-[196px] overflow-hidden rounded-[28px] border border-black/6 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.14)] transition-all hover:-translate-y-1"
      style={{ background: `linear-gradient(180deg, #ffffff 0%, ${config.surface} 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(circle at top right, ${config.accent}12 0%, transparent 48%)` }}
      />

      <div className="relative z-10 mt-auto max-w-[64%]">
        <p className="text-[1.28rem] font-semibold leading-6 text-[#161616]">{category.name}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/92 via-white/36 to-transparent" />

      <div className="absolute bottom-0 right-0 h-[84%] w-[84%] transition-transform duration-300 group-hover:scale-105">
        <Image
          src={imageSrc}
          alt={category.name}
          fill
          className="object-contain object-right-bottom p-1"
          sizes="(max-width: 640px) 40vw, (max-width: 1280px) 20vw, 16vw"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/5" />
    </Link>
  )
}

function getCategoryImagePath(slug: string) {
  return CATEGORY_CONFIG[slug] ? `/images/categories/${slug}.svg` : '/images/categories/default.svg'
}
