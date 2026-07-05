import Image from 'next/image'
import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/backend/utils'
import { ProductCardData } from '@/backend/types'
import { ProductCardActions } from '@/frontend/components/product/ProductCardActions'

interface ProductCardProps {
  product: ProductCardData
  className?: string
  layout?: 'grid' | 'list'
  priority?: boolean
  imageSizes?: string
}

const DEFAULT_GRID_IMAGE_SIZES = '(max-width: 339px) 100vw, (max-width: 559px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw'

export function ProductCard({
  product,
  className,
  layout = 'grid',
  priority = false,
  imageSizes = DEFAULT_GRID_IMAGE_SIZES,
}: ProductCardProps) {
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)
  const isPreOrder = product.isPreOrder ?? false
  const { label: stockLabel, color: stockColor, inStock } = getStockStatus(product.stockQuantity, isPreOrder)
  const price = product.salePrice ?? product.basePrice
  const productLinkLabel = `View ${product.name} details`
  const ratingLabel = product.reviewCount > 0
    ? `${product.rating.toFixed(1)} out of 5 stars from ${product.reviewCount} reviews`
    : `${product.rating.toFixed(1)} out of 5 stars, no reviews yet`
  const actionProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    stockQuantity: product.stockQuantity,
    isPreOrder,
    primaryImage,
  }

  if (layout === 'list') {
    return (
      <div className={cn('product-card flex gap-2.5 p-2.5 sm:gap-4 sm:p-4 md:p-5', className)}>
        <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="relative h-[5.5rem] w-[5.5rem] flex-shrink-0 overflow-hidden rounded-[1rem] bg-white sm:h-28 sm:w-28">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover"
              quality={75}
              sizes="112px"
            />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="sm:transition-colors min-[1025px]:hover:text-primary">
            <h3 className="mt-0.5 min-h-[2.55rem] line-clamp-2 text-[14.5px] font-medium leading-[1.32rem] text-foreground sm:mt-1 sm:text-[15px] sm:leading-6">{product.name}</h3>
          </Link>
          <div className="mt-1 flex min-h-[1rem] items-center gap-1" role="img" aria-label={ratingLabel}>
            <LocalIcon name="star-filled" className="h-3 w-3 star-filled" />
            <span className="text-[13.5px] font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
            <span className="text-[13.5px] font-medium text-foreground/55">
              {product.reviewCount > 0 ? `(${product.reviewCount})` : '(No reviews yet)'}
            </span>
          </div>
          <div className="mt-2 flex min-h-[1.65rem] flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
            <span className="text-[1.14rem] font-semibold tabular-nums text-foreground sm:text-[1.2rem]">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-[12.5px] text-muted-foreground line-through sm:text-xs">{formatPrice(product.basePrice)}</span>}
            {discount > 0 && <span className="badge-sale px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]">{discount}% off</span>}
          </div>
          <p className={cn('mt-auto pt-2 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
        </div>
        <ProductCardActions
          product={actionProduct}
          inStock={inStock}
          layout="list"
        />
      </div>
    )
  }

  return (
    <div className={cn('product-card group relative flex h-full min-w-0 max-w-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-t-[0.85rem] bg-white">
        <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="relative block aspect-[4/3] min-w-0">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-contain p-2.5 sm:p-3"
              quality={75}
              sizes={imageSizes}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <LocalIcon name="eye" className="h-8 w-8" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.25rem)] flex-col gap-1 sm:left-3 sm:top-3 sm:max-w-[calc(100%-4rem)] sm:gap-1.5">
            {discount > 0 && <span className="badge-sale max-w-full truncate px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]" aria-label={`${discount}% discount`}>{discount}% off</span>}
            {isPreOrder && <span className="badge-preorder max-w-full truncate px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]">Pre-order</span>}
            {product.isNew && <span className="badge-new max-w-full truncate px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]">New</span>}
            {product.isBestSeller && <span className="badge-bestseller max-w-full truncate px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]">Best Seller</span>}
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.01)_30%,rgba(15,23,42,0.06)_100%)] opacity-0" />
        </Link>
      </div>

      <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="flex min-w-0 flex-col px-3.5 pb-2.5 pt-3 sm:px-4 sm:pb-3 sm:pt-3.5">
        <h3 className="min-h-[2.55rem] line-clamp-2 text-[14px] font-medium leading-[1.28rem] text-foreground sm:min-h-[2.75rem] sm:text-[14.5px] sm:leading-[1.38rem] sm:transition-colors min-[1025px]:group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-2.5 flex min-h-[0.95rem] items-center gap-1 sm:gap-1.5" role="img" aria-label={ratingLabel}>
          <LocalIcon name="star-filled" className="h-2.5 w-2.5 star-filled sm:h-3 sm:w-3" />
          <span className="text-[12px] font-semibold text-foreground/75 sm:text-[12px]" aria-hidden="true">
            {product.rating.toFixed(1)}
          </span>
          <span className="truncate text-[12px] font-medium text-foreground/55 sm:text-[12px]" aria-hidden="true">
            {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
          </span>
        </div>

        <div className="mt-3 h-px w-full bg-border/55" aria-hidden="true" />

        <div className="mt-2.5 flex min-h-[1.8rem] flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:min-h-[2rem]">
          <span className="text-[1.2rem] font-semibold leading-tight tabular-nums text-foreground sm:text-[1.35rem] lg:text-[1.45rem]">
            {formatPrice(price)}
          </span>
          {product.salePrice && (
            <span className="price-original text-[13.5px] sm:text-sm">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('mt-2 flex items-center gap-1.5 text-[13px] font-medium sm:text-[13px]', stockColor)}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {stockLabel}
        </p>
      </Link>
      <div className="mt-auto min-w-0">
        <ProductCardActions
          product={actionProduct}
          inStock={inStock}
          layout="grid"
        />
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <div className="aspect-square skeleton rounded-t-xl" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-5/6" />
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-5 skeleton rounded w-1/2 mt-3" />
      </div>
    </div>
  )
}
 
