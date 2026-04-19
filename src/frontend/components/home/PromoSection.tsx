import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { ProductCardData } from '@/backend/types/product'
import { calculateDiscount, formatPrice } from '@/backend/utils'
import { CountdownTimer } from '@/frontend/components/ui/CountdownTimer'
import { HomepageNewsletterForm } from '@/frontend/components/layout/NewsletterForm'

interface PromoSectionProps {
  flashDealProducts: ProductCardData[]
  newArrivalProducts: ProductCardData[]
  flashDealEndsAt?: Date | string | null
  flashDealMaxDiscount?: number
}

type PromoCollection = {
  kind: 'flash' | 'arrival'
  href: string
  label: string
  title: string
  copy: string
  cta: string
  gradient: string
  previewRailClass: string
  previewCardClass: string
  products: ProductCardData[]
}

export function PromoSection({
  flashDealProducts,
  newArrivalProducts,
  flashDealEndsAt,
  flashDealMaxDiscount = 0,
}: PromoSectionProps) {
  const collections: PromoCollection[] = ([
    {
      kind: 'flash' as const,
      href: '/deals',
      label: 'Limited Offers',
      title: 'Flash Deals',
      copy: 'Strong price drops, brought together in one clean place so the best offers are easy to scan.',
      cta: 'Shop deals',
      gradient: 'from-[#2f1e43] via-[#4a2d66] to-[#7d5a5f]',
      previewRailClass: 'bg-[#f5efe6]',
      previewCardClass: 'border-black/[0.06] bg-[#fffaf4]',
      products: flashDealProducts.slice(0, 3),
    },
    {
      kind: 'arrival' as const,
      href: '/new-arrivals',
      label: 'New This Week',
      title: 'New Arrivals',
      copy: 'Fresh releases and recent drops, arranged with more breathing room so new products are easier to browse.',
      cta: 'Explore all',
      gradient: 'from-[#2f3649] via-[#1d2433] to-[#5e5449]',
      previewRailClass: 'bg-[#f5efe6]',
      previewCardClass: 'border-black/[0.06] bg-[#fffaf4]',
      products: newArrivalProducts.slice(0, 3),
    },
  ] as PromoCollection[]).filter((collection) => collection.products.length > 0)

  if (collections.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-1 gap-6 ${collections.length > 1 ? 'md:grid-cols-2' : ''}`}>
      {collections.map((collection) => (
        <Link
          key={collection.href}
          href={collection.href}
          className={`group relative min-h-[388px] overflow-hidden rounded-[30px] border border-black/[0.06] bg-gradient-to-br p-6 shadow-[0_28px_74px_rgba(17,24,39,0.16)] sm:min-h-[412px] ${collection.gradient}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
          <div className="absolute inset-y-0 left-0 w-[46%] bg-[linear-gradient(90deg,rgba(15,23,42,0.34),rgba(15,23,42,0.12),transparent)]" />
          <div className="relative grid h-full gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div className="flex flex-col justify-between gap-5 p-2 sm:p-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--buttermilk))]">
                  {collection.label}
                </span>
                <h3 className="mt-3 font-display text-[2rem] font-bold leading-[0.94] text-white [text-shadow:0_8px_24px_rgba(15,23,42,0.28)]">
                  {collection.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/86">{collection.copy}</p>
                {collection.kind === 'flash' ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {flashDealMaxDiscount > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-white/18 bg-black/12 px-3 py-1 text-xs font-semibold text-white">
                        Up to {flashDealMaxDiscount}% off
                      </span>
                    ) : null}
                    {flashDealEndsAt ? (
                      <CountdownTimer
                        endsAt={flashDealEndsAt}
                        label="Ends in"
                        className="flex items-center gap-2 rounded-full border border-white/18 bg-black/12 px-3 py-1.5 text-white"
                        valueClassName="rounded-md bg-black/[0.22] px-2 py-1"
                        separatorClassName="text-white/[0.42]"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center rounded-full border border-white/14 bg-black/12 px-3 py-1 text-xs font-semibold text-white/95">
                    New releases added regularly
                  </div>
                )}
              </div>

              <span className="inline-flex w-fit rounded-full bg-[hsl(var(--buttermilk))] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#231629] transition-colors group-hover:bg-white">
                {collection.cta}
              </span>
            </div>

            <div className={`rounded-[26px] p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] ${collection.previewRailClass}`}>
              <div className="grid grid-cols-3 gap-3">
                {collection.products.length > 0 ? (
                  collection.products.map((product) => (
                    <PromoProductPreview
                      key={product.id}
                      product={product}
                      cardClassName={collection.previewCardClass}
                      badgeClassName={collection.kind === 'flash' ? 'bg-primary text-white' : 'bg-foreground text-white'}
                    />
                  ))
                ) : (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`${collection.href}-${index}`}
                      className="aspect-[0.78] rounded-[22px] bg-[#fffaf4]"
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function PromoProductPreview({
  product,
  cardClassName,
  badgeClassName,
}: {
  product: ProductCardData
  cardClassName: string
  badgeClassName: string
}) {
  const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url
  const price = product.salePrice ?? product.basePrice
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

  return (
    <div className={`rounded-[22px] border p-2.5 shadow-[0_18px_34px_rgba(15,23,42,0.12)] ${cardClassName}`}>
      <div className="relative aspect-[0.92] overflow-hidden rounded-[18px] bg-[#efe8dc]">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 28vw, 14vw"
            quality={80}
          />
        ) : null}
        {discount > 0 ? (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClassName}`}>
            {discount}% off
          </span>
        ) : null}
      </div>

      <div className="mt-2.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          {product.brand?.name ?? product.category.name}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-4 text-slate-900">
          {product.name}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-1">
          <span className="text-[13px] font-bold text-slate-950">{formatPrice(price)}</span>
          {product.salePrice ? (
            <span className="text-[10px] text-slate-400 line-through">
              {formatPrice(product.basePrice)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string | null
}

export function BrandHighlights({ brands }: { brands: Brand[] }) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="section-title">Featured Brands</h2>
        <p className="mt-1 text-sm text-muted-foreground">Shop authentic products from world-class brands</p>
      </div>

      <div className="grid grid-cols-4 gap-5 sm:grid-cols-4 md:grid-cols-8">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="aspect-square rounded-xl bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-full items-center justify-center">
              {brand.logo ? (
                <div className="relative h-10 w-full">
                  <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="100px" />
                </div>
              ) : (
                <span className="font-display text-sm font-bold">{brand.name}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function NewsletterSection() {
  return (
    <section>
      <div className="container-site py-8 sm:py-10">
        <div className="overflow-hidden rounded-[2.2rem] border border-black/6 bg-[linear-gradient(135deg,#2f1f42_0%,#5b3c7a_48%,#cbb7a3_168%)] px-6 py-10 text-center shadow-[0_32px_80px_rgba(27,20,18,0.12)] sm:px-10 sm:py-14">
          <div className="mx-auto max-w-xl">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-[hsl(var(--buttermilk))]" />
              <span className="text-[hsl(var(--buttermilk))] text-sm font-semibold uppercase tracking-[0.28em]">Newsletter</span>
            </div>
            <h2 className="font-display text-[2.1rem] font-bold leading-[0.94] text-white md:text-[2.9rem]">
              Get new arrivals and limited deals first.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/76">
              Receive launch alerts, selected offers, and useful updates without the clutter.
            </p>
            <HomepageNewsletterForm />
            <p className="mt-3 text-xs text-white/46">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
