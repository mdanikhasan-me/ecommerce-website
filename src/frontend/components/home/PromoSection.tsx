import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Mail } from 'lucide-react'

import { ProductCardData } from '@/backend/types/product'
import { calculateDiscount, formatPrice } from '@/backend/utils'
import { CountdownTimer } from '@/frontend/components/ui/CountdownTimer'
import { HomepageNewsletterForm } from '@/frontend/components/layout/NewsletterForm'
import { FeaturedProductRotator } from '@/frontend/components/home/FeaturedProductRotator'

interface PromoSectionProps {
  flashDealProducts: ProductCardData[]
  newArrivalProducts: ProductCardData[]
  newArrivalRotatorProducts?: ProductCardData[]
  bestSellerRotatorProducts?: ProductCardData[]
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
  bandClassName: string
  previewCardClassName: string
  products: ProductCardData[]
  rotatorProducts: ProductCardData[]
}

export function PromoSection({
  flashDealProducts,
  newArrivalProducts,
  newArrivalRotatorProducts,
  bestSellerRotatorProducts,
  flashDealEndsAt,
  flashDealMaxDiscount = 0,
}: PromoSectionProps) {
  const collections: PromoCollection[] = [
    {
      kind: 'flash' as const,
      href: '/deals',
      label: 'Limited Offers',
      title: 'Flash Deals',
      copy: 'Sharp price drops, arranged into a cleaner full-width banner so the strongest offers are easy to notice at a glance.',
      cta: 'Shop deals',
      bandClassName: 'bg-[#261f31]',
      previewCardClassName: 'border-[#dfd1bc] bg-[#fffaf3]',
      products: flashDealProducts.slice(0, 3),
      rotatorProducts:
        bestSellerRotatorProducts && bestSellerRotatorProducts.length > 0
          ? bestSellerRotatorProducts
          : flashDealProducts,
    },
    {
      kind: 'arrival' as const,
      href: '/new-arrivals',
      label: 'New This Week',
      title: 'New Arrivals',
      copy: 'Fresh releases and recent drops, presented in a calmer layout so new pieces feel easier to scan and easier to browse.',
      cta: 'Explore all',
      bandClassName: 'bg-[#202938]',
      previewCardClassName: 'border-[#dfd1bc] bg-[#fffaf3]',
      products: newArrivalProducts.slice(0, 3),
      rotatorProducts:
        newArrivalRotatorProducts && newArrivalRotatorProducts.length > 0
          ? newArrivalRotatorProducts
          : newArrivalProducts,
    },
  ].filter((collection) => collection.products.length > 0)

  if (collections.length === 0) {
    return null
  }

  return (
    <section className="w-full border-y border-black/8">
      {collections.map((collection, index) => (
        <div
          key={collection.href}
          className={`${collection.bandClassName} ${index > 0 ? 'border-t border-white/8' : ''}`}
        >
          <div className="container-site">
            <Link
              href={collection.href}
              className="group grid min-h-[30rem] items-stretch lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] lg:gap-8"
            >
              <PromoTextPanel
                collection={collection}
                flashDealEndsAt={flashDealEndsAt}
                flashDealMaxDiscount={flashDealMaxDiscount}
              />
              <PromoProductsPanel collection={collection} />
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}

function PromoTextPanel({
  collection,
  flashDealEndsAt,
  flashDealMaxDiscount,
}: {
  collection: PromoCollection
  flashDealEndsAt?: Date | string | null
  flashDealMaxDiscount: number
}) {
  return (
    <div className="relative flex flex-col justify-center gap-8 py-10 sm:py-12 lg:flex-row lg:items-center lg:gap-10 lg:py-14">
      <div className="flex-1 px-4 sm:px-6 lg:px-0 lg:pr-6 xl:pr-12">
        <div className="max-w-[35rem]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--buttermilk))]">
            {collection.label}
          </span>

          <h3 className="mt-4 max-w-[10ch] font-display text-[2.65rem] font-bold leading-[0.92] text-[hsl(var(--buttermilk))] sm:text-[3.4rem] xl:text-[4.15rem]">
            {collection.title}
          </h3>

          <p className="mt-4 max-w-lg text-sm leading-7 text-[hsl(var(--buttermilk))]/90 sm:text-[15px]">
            {collection.copy}
          </p>

          {collection.kind === 'flash' ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {flashDealMaxDiscount > 0 ? (
                <span className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-[hsl(var(--buttermilk))]">
                  Up to {flashDealMaxDiscount}% off
                </span>
              ) : null}
              {flashDealEndsAt ? (
                <CountdownTimer
                  endsAt={flashDealEndsAt}
                  label="Ends in"
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[hsl(var(--buttermilk))]"
                  valueClassName="rounded-md bg-black/16 px-2 py-1"
                  separatorClassName="text-[hsl(var(--buttermilk))]/40"
                />
              ) : null}
            </div>
          ) : (
            <div className="mt-5 inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-[hsl(var(--buttermilk))]">
              New releases added regularly
            </div>
          )}

          <div className="mt-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#231629] transition-colors group-hover:bg-white">
              {collection.cta}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 sm:px-6 lg:justify-end lg:px-0 lg:pr-4">
        <FeaturedProductRotator products={collection.rotatorProducts} />
      </div>
    </div>
  )
}

function PromoProductsPanel({ collection }: { collection: PromoCollection }) {
  return (
    <div className="relative py-6 sm:py-8 lg:py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collection.products.map((product) => (
          <PromoProductPreview
            key={product.id}
            product={product}
            cardClassName={collection.previewCardClassName}
            badgeClassName={collection.kind === 'flash' ? 'bg-primary text-white' : 'bg-foreground text-white'}
          />
        ))}
      </div>
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
    <div className={`rounded-[1.45rem] border p-2.5 shadow-[0_18px_34px_rgba(15,23,42,0.08)] ${cardClassName}`}>
      <div className="relative aspect-[0.92] overflow-hidden rounded-[1.15rem] bg-[#efe8dc]">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 82vw, (max-width: 1024px) 36vw, 16vw"
            quality={82}
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
          {product.category.name}
        </p>
        <p className="mt-1 line-clamp-2 min-h-[2rem] text-[12px] font-semibold leading-4 text-slate-900">
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
