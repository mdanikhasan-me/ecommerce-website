import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { db } from '@/backend/database'
import { CATEGORY_CONFIG, getCategoryConfig } from '@/frontend/components/category/category-config'

export const metadata: Metadata = {
  title: 'Boilabin Categories',
  description: 'Browse every shopping category on Boilabin.',
}

export const revalidate = 300

async function getCategories() {
  return db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number]

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container-site py-10">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">All Categories</span>
      </nav>

      <section className="rounded-[30px] border border-black/6 bg-[#fbf8f2] px-6 py-7 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.12)] sm:px-8 sm:py-8">
        <h1 className="font-display text-[2.7rem] leading-[0.94] tracking-tight text-[#161616] sm:text-[3.5rem]">
          All Categories
        </h1>
      </section>

      <div className="mt-10 space-y-7">
        {categories.map((category) => (
          <CategorySectionCard
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

function CategorySectionCard({ category }: { category: CategoryItem }) {
  const config = getCategoryConfig(category.slug)
  const Icon = config.icon

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 border-b border-black/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/6"
            style={{ backgroundColor: config.surface }}
          >
            <Icon className="h-[18px] w-[18px]" style={{ color: config.accentDark }} />
          </div>

          <div>
            <h2 className="text-[1.55rem] font-semibold tracking-tight text-[#161616]">{category.name}</h2>
          </div>
        </div>

        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: config.accentDark }}
        >
          Open category
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(118px,134px))]">
        <CategorySquareTile
          href={`/category/${category.slug}`}
          title={category.name}
          tone={config.surface}
          textColor={config.accentDark}
          imageSrc={getCategoryImagePath(category.slug)}
        />

        {category.children.map((child) => (
          <CategorySquareTile
            key={child.id}
            href={`/category/${child.slug}`}
            title={child.name}
            tone="#ffffff"
            textColor="#161616"
            imageSrc={getCategoryImagePath(category.slug)}
          />
        ))}
      </div>
    </section>
  )
}

function CategorySquareTile({
  href,
  title,
  tone,
  textColor,
  imageSrc,
}: {
  href: string
  title: string
  tone: string
  textColor: string
  imageSrc: string
}) {
  return (
    <Link
      href={href}
      className="group relative isolate flex aspect-square min-h-[118px] overflow-hidden rounded-[20px] border border-black/8 p-3 shadow-[0_10px_22px_-22px_rgba(15,23,42,0.12)] transition-all hover:-translate-y-0.5"
      style={{ backgroundColor: tone }}
    >
      <div
        className="absolute inset-0 opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.08]"
        style={{
          background: `radial-gradient(circle at top right, ${textColor} 0%, transparent 58%)`,
        }}
      />

      <div className="absolute bottom-0 right-0 h-[58%] w-[58%] opacity-[0.18] transition-transform duration-300 group-hover:scale-[1.04]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-contain object-right-bottom p-2"
          sizes="134px"
        />
      </div>

      <div className="relative z-10 mt-auto max-w-[80%]">
        <p className="text-[13px] font-semibold leading-[18px]" style={{ color: textColor }}>
          {title}
        </p>
      </div>
    </Link>
  )
}

function getCategoryImagePath(slug: string) {
  return CATEGORY_CONFIG[slug] ? `/images/categories/${slug}.svg` : '/images/categories/default.svg'
}
