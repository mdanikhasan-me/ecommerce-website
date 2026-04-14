import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
  children: { id: string; name: string; slug: string }[]
}

const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000&q=80&auto=format',
  fashion:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80&auto=format',
  'home-appliances':
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=80&auto=format',
  'beauty-health':
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&q=80&auto=format',
  'sports-fitness':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=80&auto=format',
  gaming:
    'https://images.unsplash.com/photo-1603481546238-487240415921?w=1000&q=80&auto=format',
}

const CATEGORY_OVERLAYS: Record<string, string> = {
  electronics: 'from-slate-950/86 via-slate-900/36 to-transparent',
  fashion: 'from-stone-950/84 via-orange-950/36 to-transparent',
  'home-appliances': 'from-emerald-950/84 via-emerald-900/24 to-transparent',
  'beauty-health': 'from-rose-950/84 via-rose-900/24 to-transparent',
  'sports-fitness': 'from-sky-950/84 via-cyan-900/26 to-transparent',
  gaming: 'from-indigo-950/84 via-violet-900/28 to-transparent',
}

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const leadCategory = categories[0]
  const supportingCategories = categories.slice(1, 4)
  const moreCategories = categories.slice(4, 10)

  return (
    <section className="container-site py-16">
      <div className="surface-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Shop by category</p>
            <h2 className="section-title mt-3">A cleaner way to discover the departments that matter most.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Instead of pushing everything at once, the storefront now introduces your strongest categories
              like a curated retail floor: one hero department, a few confident supporting collections, and
              then the rest in a lighter grid.
            </p>
          </div>
          <Link href="/search" className="inline-link">
            Browse all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
          {leadCategory && <LeadCategoryCard category={leadCategory} />}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            {supportingCategories.map((category) => (
              <SupportingCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {moreCategories.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {moreCategories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function LeadCategoryCard({ category }: { category: Category }) {
  const image = CATEGORY_IMAGES[category.slug] || category.image
  const overlay = CATEGORY_OVERLAYS[category.slug] || 'from-slate-950/86 via-slate-900/36 to-transparent'

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-[30px] bg-foreground min-h-[400px] lg:min-h-[480px]"
    >
      {image && (
        <Image
          src={image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1280px) 100vw, 56vw"
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} />
      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
            Signature department
          </span>
          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
            {category.children.length} subcollections
          </span>
        </div>

        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.26em] text-white/58">Featured category</p>
          <h3 className="mt-3 font-display text-4xl text-white sm:text-5xl">{category.name}</h3>
          {category.children.length > 0 && (
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
              {category.children
                .slice(0, 4)
                .map((child) => child.name)
                .join(', ')}
              {category.children.length > 4 && ', and more.'}
            </p>
          )}
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition-all group-hover:gap-3">
            Explore {category.name}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function SupportingCategoryCard({ category }: { category: Category }) {
  const image = CATEGORY_IMAGES[category.slug] || category.image
  const overlay = CATEGORY_OVERLAYS[category.slug] || 'from-slate-950/82 via-slate-900/28 to-transparent'

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-[28px] border border-border/80 bg-card min-h-[220px]"
    >
      {image && (
        <Image
          src={image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1280px) 100vw, 32vw"
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/58">Curated selection</p>
        <h3 className="mt-2 font-display text-3xl text-white">{category.name}</h3>
        <p className="mt-3 text-sm leading-6 text-white/72">
          {category.children.slice(0, 3).map((child) => child.name).join(', ') || 'Browse this collection'}.
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition-all group-hover:gap-3">
          Shop now
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function CategoryTile({ category }: { category: Category }) {
  const image = CATEGORY_IMAGES[category.slug] || category.image

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group rounded-[24px] border border-border/80 bg-background/65 p-3 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_rgba(34,27,21,0.08)]"
    >
      <div className="relative aspect-[0.95] overflow-hidden rounded-[20px] bg-secondary">
        {image ? (
          <Image
            src={image}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 16vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
        )}
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</p>
        <h3 className="mt-2 text-base font-semibold text-foreground">{category.name}</h3>
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
