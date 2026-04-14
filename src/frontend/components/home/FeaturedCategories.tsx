'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

/**
 * Curated hero images per category slug.
 * These are high-quality Unsplash photos that represent each category well.
 * If a category doesn't have a match here, we fall back to the DB image
 * or a gradient placeholder.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80&auto=format',
  fashion:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80&auto=format',
  'home-appliances':
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&q=80&auto=format',
  'beauty-health':
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format',
  'sports-fitness':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80&auto=format',
  'books-stationery':
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&q=80&auto=format',
  gaming:
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80&auto=format',
  'baby-kids':
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80&auto=format',
}

const CATEGORY_COLORS: Record<string, string> = {
  electronics: 'from-blue-900/80 to-blue-600/40',
  fashion: 'from-rose-900/80 to-rose-600/40',
  'home-appliances': 'from-amber-900/80 to-amber-600/40',
  'beauty-health': 'from-pink-900/80 to-pink-600/40',
  'sports-fitness': 'from-emerald-900/80 to-emerald-600/40',
  'books-stationery': 'from-violet-900/80 to-violet-600/40',
  gaming: 'from-indigo-900/80 to-indigo-600/40',
  'baby-kids': 'from-sky-900/80 to-sky-600/40',
}

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  children: { id: string; name: string; slug: string }[]
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  // First 2 categories get the large hero treatment, rest get cards
  const heroCategories = categories.slice(0, 2)
  const gridCategories = categories.slice(2)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Explore our curated collections
          </p>
        </div>
        <Link
          href="/category"
          className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
        >
          All Categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Hero row: 2 large cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {heroCategories.map((cat) => (
          <CategoryHeroCard key={cat.id} category={cat} />
        ))}
      </div>

      {/* Grid row: remaining categories */}
      {gridCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {gridCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryHeroCard({ category }: { category: Category }) {
  const img = CATEGORY_IMAGES[category.slug] || category.image
  const gradient =
    CATEGORY_COLORS[category.slug] || 'from-slate-900/80 to-slate-600/40'

  return (
    <Link
      href={`/category/${category.slug}`}
      className="relative rounded-2xl overflow-hidden group aspect-[2.2/1] bg-secondary"
    >
      {img && (
        <Image
          src={img}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="font-display text-xl md:text-2xl font-bold text-white">
          {category.name}
        </h3>
        {category.children.length > 0 && (
          <p className="text-white/70 text-sm mt-1">
            {category.children
              .slice(0, 3)
              .map((c) => c.name)
              .join(', ')}
            {category.children.length > 3 && ' & more'}
          </p>
        )}
        <span className="mt-3 inline-flex items-center gap-1 text-white text-sm font-semibold group-hover:gap-2 transition-all">
          Shop Now <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const img = CATEGORY_IMAGES[category.slug] || category.image
  const gradient =
    CATEGORY_COLORS[category.slug] || 'from-slate-900/70 to-slate-600/30'

  return (
    <Link
      href={`/category/${category.slug}`}
      className="relative rounded-xl overflow-hidden group aspect-[3/4] bg-secondary"
    >
      {img && (
        <Image
          src={img}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${gradient}`}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h3 className="font-display text-sm md:text-base font-bold text-white leading-tight">
          {category.name}
        </h3>
        <span className="text-white/70 text-xs mt-1 group-hover:text-white transition-colors">
          Shop Now
        </span>
      </div>
    </Link>
  )
}
