import Image from 'next/image'
import Link from 'next/link'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, getStockStatus, cn } from '@/backend/utils'
import { ProductCardData } from '@/backend/types'
import { ProductCardActions } from '@/frontend/components/product/ProductCardActions'

interface ProductCardProps {
  product: ProductCardData
  className?: string
  layout?: 'grid' | 'list'
  priority?: boolean
  imageSizes?: string
  titleHeadingLevel?: 2 | 3
}

const DEFAULT_GRID_IMAGE_SIZES = '(max-width: 339px) 100vw, (max-width: 559px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw'

export function ProductCard({
  product,
  className,
  layout = 'grid',
  priority = false,
  imageSizes = DEFAULT_GRID_IMAGE_SIZES,
  titleHeadingLevel = 2,
}: ProductCardProps) {
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
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
  const ProductTitle = titleHeadingLevel === 2 ? 'h2' : 'h3'

  if (layout === 'list') {
    return (
      <div className={cn('product-card flex gap-2.5 p-2.5 sm:gap-4 sm:p-4 md:p-5', className)}>
        <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="product-media-frame relative w-[5.5rem] flex-shrink-0 overflow-hidden rounded-[0.4rem] bg-white sm:w-28">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-contain p-1.5"
              quality={75}
              sizes="112px"
            />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/products/${product.slug}`} prefetch={false}>
            <ProductTitle className="mt-0.5 min-h-[2.55rem] line-clamp-2 text-[14.5px] font-medium leading-[1.32rem] text-foreground sm:mt-1 sm:text-[15px] sm:leading-6">{product.name}</ProductTitle>
          </Link>
          <div className="mt-1 flex min-h-[1rem] items-center gap-1" role="img" aria-label={ratingLabel}>
            <LocalIcon name="star-filled" className="h-3 w-3 star-filled" />
            <span className="text-[13.5px] font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
            <span className="text-[13.5px] font-medium text-muted-foreground">
              {product.reviewCount > 0 ? `(${product.reviewCount})` : '(No reviews yet)'}
            </span>
          </div>
          <div className="mt-2 flex min-h-[1.65rem] flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
            <span className="text-[1.14rem] font-semibold tabular-nums text-foreground sm:text-[1.2rem]">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-[12.5px] text-muted-foreground line-through sm:text-xs">{formatPrice(product.basePrice)}</span>}
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
      {product.isNew ? (
        <span className="product-card-new-ribbon" aria-label="New product">
          New
        </span>
      ) : null}
      <div className="product-card-media-shell relative overflow-hidden rounded-t-[0.4rem] bg-white">
        <Link href={`/products/${product.slug}`} prefetch={false} aria-label={productLinkLabel} className="product-card-media-link product-media-frame relative block min-w-0">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="product-card-media-image object-contain"
              quality={75}
              sizes={imageSizes}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <LocalIcon name="eye" className="h-8 w-8" />
            </div>
          )}

        </Link>
      </div>

      <Link href={`/products/${product.slug}`} prefetch={false} className="product-card-copy flex min-w-0 flex-col px-3 pb-2 pt-2.5 sm:px-3.5 sm:pb-2 sm:pt-2.5">
        <ProductTitle className="product-card-title min-h-[2.35rem] line-clamp-2 text-[13.5px] font-semibold leading-[1.18rem] text-foreground sm:min-h-[2.5rem] sm:text-[14px] sm:leading-5">
          {product.name}
        </ProductTitle>

        <div className="product-card-rating mt-2 flex min-h-[0.9rem] items-center gap-1 sm:gap-1.5" role="img" aria-label={ratingLabel}>
          <LocalIcon name="star-filled" className="h-2.5 w-2.5 star-filled sm:h-3 sm:w-3" />
          <span className="text-[12px] font-semibold text-foreground/75 sm:text-[12px]" aria-hidden="true">
            {product.rating.toFixed(1)}
          </span>
          <span className="truncate text-[12px] font-medium text-muted-foreground sm:text-[12px]" aria-hidden="true">
            {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
          </span>
        </div>

        <div className="mt-2 h-px w-full bg-border/55" aria-hidden="true" />

        <div className="product-card-price mt-2 flex min-h-[1.65rem] flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[1.15rem] font-semibold leading-tight tabular-nums text-foreground sm:text-[1.25rem] lg:text-[1.34rem]">
            {formatPrice(price)}
          </span>
          {product.salePrice && (
            <span className="price-original text-[13.5px] sm:text-sm">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('product-card-stock mt-1.5 text-[12.5px] font-medium sm:text-[13px]', stockColor)}>
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
      <div className="product-media-frame skeleton rounded-t-xl" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-5/6" />
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-5 skeleton rounded w-1/2 mt-3" />
      </div>
    </div>
  )
}
 
