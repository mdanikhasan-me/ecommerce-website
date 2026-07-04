import Link from 'next/link'
import Image from 'next/image'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

import { ProductCardData } from '@/backend/types/product'
import { calculateDiscount, formatPrice } from '@/backend/utils'
import { FeaturedProductRotator } from '@/frontend/components/home/FeaturedProductRotator'

interface PromoSectionProps {
  newArrivalProducts: ProductCardData[]
  newArrivalRotatorProducts?: ProductCardData[]
}
type PromoCollection = {
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
  newArrivalProducts,
  newArrivalRotatorProducts,
}: PromoSectionProps) {
  const collections: PromoCollection[] = [
    {
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
              className="group grid items-stretch lg:min-h-[25rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(24rem,1.08fr)] lg:gap-8 xl:min-h-[27rem]"
            >
              <PromoTextPanel
                collection={collection}
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
}: {
  collection: PromoCollection
}) {
  return (
    <div className="relative flex flex-col justify-center gap-6 py-7 sm:py-9 lg:flex-row lg:items-center lg:gap-10 lg:py-14">
      <div className="flex-1 px-1 sm:px-3 lg:px-0 lg:pr-6 xl:pr-12">
        <div className="max-w-[35rem]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--buttermilk))]">
            {collection.label}
          </span>

          <h3 className="mt-4 max-w-full font-display text-[2.05rem] font-bold leading-[0.94] text-[hsl(var(--buttermilk))] sm:max-w-[10ch] sm:text-[3.1rem] xl:text-[3.75rem]">
            {collection.title}
          </h3>

          <p className="mt-4 max-w-full text-sm leading-6 text-[hsl(var(--buttermilk))]/90 sm:max-w-lg sm:text-[15px] sm:leading-7">
            {collection.copy}
          </p>

          <div className="mt-5 inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-semibold text-[hsl(var(--buttermilk))]">
            New releases added regularly
          </div>

          <div className="mt-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#231629] transition-colors min-[1025px]:group-hover:bg-white">
              {collection.cta}
              <LocalIcon name="arrow-right" className="h-4 w-4" />
            </span>
          </div>
        </div>

        <MobilePromoProductStrip collection={collection} />
      </div>

      <div className="hidden justify-center px-4 sm:px-6 lg:flex lg:justify-end lg:px-0 lg:pr-4">
        <FeaturedProductRotator products={collection.rotatorProducts} />
      </div>
    </div>
  )
}

function MobilePromoProductStrip({ collection }: { collection: PromoCollection }) {
  return (
    <div className="mt-7 lg:hidden">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {collection.products.slice(0, 3).map((product) => (
          <div key={product.id} className="min-w-0">
            <PromoProductPreview
              product={product}
              cardClassName={collection.previewCardClassName}
              badgeClassName="bg-foreground text-white"
              compact
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function PromoProductsPanel({ collection }: { collection: PromoCollection }) {
  return (
    <div className="relative hidden py-6 sm:py-8 lg:block lg:py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collection.products.map((product) => (
          <PromoProductPreview
            key={product.id}
            product={product}
            cardClassName={collection.previewCardClassName}
            badgeClassName="bg-foreground text-white"
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
  compact = false,
}: {
  product: ProductCardData
  cardClassName: string
  badgeClassName: string
  compact?: boolean
}) {
  const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url
  const price = product.salePrice ?? product.basePrice
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

  return (
    <div className={`${compact ? 'rounded-[1.1rem] p-2' : 'rounded-[1.45rem] p-2.5'} border shadow-[0_18px_34px_rgba(15,23,42,0.08)] ${cardClassName}`}>
      <div className={`${compact ? 'aspect-[1.08] rounded-[0.85rem]' : 'aspect-[0.92] rounded-[1.15rem]'} relative overflow-hidden bg-[#efe8dc]`}>
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes={compact ? '168px' : '(max-width: 1024px) 36vw, 16vw'}
            quality={75}
          />
        ) : null}
        {discount > 0 ? (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClassName}`}>
            {discount}% off
          </span>
        ) : null}
      </div>

      <div className={compact ? 'mt-2' : 'mt-2.5'}>
        <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-medium uppercase tracking-[0.18em] text-slate-500`}>
          {product.category.name}
        </p>
        <p className={`${compact ? 'min-h-[2.25rem] text-[11px] leading-[1.15rem]' : 'min-h-[2rem] text-[12px] leading-4'} mt-1 line-clamp-2 font-semibold text-slate-900`}>
          {product.name}
        </p>
        <div className={`${compact ? 'mt-1.5' : 'mt-2'} flex flex-wrap items-baseline gap-1`}>
          <span className={`${compact ? 'text-[12px]' : 'text-[13px]'} font-bold text-slate-950`}>{formatPrice(price)}</span>
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
