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

const DEFAULT_GRID_IMAGE_SIZES = '(max-width: 559px) 50vw, (max-width: 1023px) 33vw, 25vw'

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
        <Link href={`/products/${product.slug}`} aria-label={productLinkLabel} className="relative h-[5.5rem] w-[5.5rem] flex-shrink-0 overflow-hidden rounded-[1rem] bg-white sm:h-28 sm:w-28">
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
          <Link href={`/products/${product.slug}`} aria-label={productLinkLabel} className="sm:transition-colors md:hover:text-primary">
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
    <div className={cn('product-card group relative flex h-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-t-[1.05rem] bg-white sm:rounded-t-[1.35rem]">
        <Link href={`/products/${product.slug}`} aria-label={productLinkLabel} className="relative block aspect-square">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover"
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

      <Link href={`/products/${product.slug}`} aria-label={productLinkLabel} className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="min-h-[2.6rem] line-clamp-2 text-[14px] font-medium leading-[1.3rem] text-foreground sm:min-h-[3rem] sm:text-[15px] sm:leading-6 sm:transition-colors md:group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-2 flex min-h-[0.9rem] items-center gap-1 sm:mt-2.5 sm:gap-1.5" role="img" aria-label={ratingLabel}>
          <LocalIcon name="star-filled" className="h-2.5 w-2.5 star-filled sm:h-3 sm:w-3" />
          <span className="text-[12px] font-semibold text-foreground/75 sm:text-[12px]" aria-hidden="true">
            {product.rating.toFixed(1)}
          </span>
          <span className="truncate text-[12px] font-medium text-foreground/55 sm:text-[12px]" aria-hidden="true">
            {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
          </span>
        </div>

        <div className="mt-2.5 flex min-h-[2.15rem] flex-col items-start gap-0.5 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:gap-1.5 sm:mt-3 sm:min-h-[2.45rem] sm:gap-1">
          <span className="text-[1.14rem] font-semibold leading-tight tabular-nums text-foreground sm:text-[1.36rem] lg:text-[1.5rem]">
            {formatPrice(price)}
          </span>
          {product.salePrice && (
            <span className="price-original text-[13.5px] sm:text-sm">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('mt-auto pt-1.5 text-[13px] font-medium sm:pt-2 sm:text-[13px]', stockColor)}>{stockLabel}</p>
      </Link>
      <ProductCardActions
        product={actionProduct}
        inStock={inStock}
        layout="grid"
      />
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
 
