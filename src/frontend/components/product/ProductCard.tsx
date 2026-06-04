'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Star, Eye, BarChart2 } from 'lucide-react'
import { useCartStore, useWishlistStore, useCompareStore } from '@/frontend/stores'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/backend/utils'
import { ProductCardData } from '@/backend/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: ProductCardData
  className?: string
  layout?: 'grid' | 'list'
  priority?: boolean
  imageSizes?: string
}

const DEFAULT_GRID_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

export function ProductCard({
  product,
  className,
  layout = 'grid',
  priority = false,
  imageSizes = DEFAULT_GRID_IMAGE_SIZES,
}: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWished = useWishlistStore((state) => state.items.includes(product.id))
  const addCompare = useCompareStore((state) => state.add)
  const isCompared = useCompareStore((state) => state.items.includes(product.id))

  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)
  const { label: stockLabel, color: stockColor, inStock } = getStockStatus(product.stockQuantity)
  const price = product.salePrice ?? product.basePrice
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    addItem({
      id: `${product.id}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice: product.basePrice,
      image: primaryImage ?? '',
      stockQuantity: product.stockQuantity,
      sku: product.sku,
    })
    toast.success('Added to cart')
    openCart()
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  if (layout === 'list') {
    return (
      <div className={cn('product-card flex gap-3 p-3 sm:gap-4 sm:p-4 md:p-5', className)}>
        <Link href={`/products/${product.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.1rem] bg-[#eee6db] sm:h-28 sm:w-28">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover"
              quality={82}
              sizes="112px"
            />
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/products/${product.slug}`} className="transition-colors hover:text-primary">
            <h3 className="mt-1 min-h-[2.5rem] line-clamp-2 text-[14px] font-semibold leading-5 text-foreground sm:text-[15px] sm:leading-6">{product.name}</h3>
          </Link>
          <div className="mt-1 flex min-h-[1rem] items-center gap-1">
            <Star className="h-3 w-3 star-filled" />
            <span className="text-[12px] font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
            <span className="text-[12px] font-medium text-foreground/55">
              {product.reviewCount > 0 ? `(${product.reviewCount})` : '(No reviews yet)'}
            </span>
          </div>
          <div className="mt-3 flex min-h-[1.85rem] flex-wrap items-center gap-2">
            <span className="font-display text-[1.1rem] font-bold sm:text-[1.2rem]">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>}
            {discount > 0 && <span className="badge-sale">{discount}% off</span>}
          </div>
          <p className={cn('mt-auto pt-2 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
        </div>
        <div className="flex flex-col items-end justify-between gap-2">
          <button type="button" aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'} title={isWished ? 'Remove from wishlist' : 'Add to wishlist'} onClick={handleWishlist} className={cn('p-1.5 rounded-lg hover:bg-secondary transition-colors', isWished && 'text-red-500')}>
            <Heart className={cn('h-4 w-4', isWished && 'fill-current')} />
          </button>
          <button type="button" onClick={handleAddToCart} disabled={!inStock} className="btn-primary px-3 py-1.5 text-xs">
            Add to Cart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('product-card group flex h-full flex-col', className)}>
      <div className="relative overflow-hidden rounded-t-[1.35rem] bg-[#eee6db]">
        <Link href={`/products/${product.slug}`} className="relative block aspect-square">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
              quality={84}
              sizes={imageSizes}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <Eye className="h-8 w-8" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="badge-sale">{discount}% off</span>}
            {product.isNew && <span className="badge-new">New</span>}
            {product.isBestSeller && <span className="badge-bestseller">Best Seller</span>}
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.01)_30%,rgba(15,23,42,0.08)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-100 transition-all duration-300 sm:translate-x-10 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
          <button title="Add to wishlist" type="button"
            onClick={handleWishlist}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-black/6 shadow-[0_12px_24px_rgba(23,18,15,0.08)] transition-colors hover:bg-primary hover:text-white',
              isWished ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-[hsl(var(--card)/0.94)]'
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn('h-3.5 w-3.5', isWished && 'fill-current')} />
          </button>
          <button type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              if (isCompared) {
                router.push('/compare')
                return
              }

              const success = addCompare(product.id)
              if (!success) toast.error('Max 4 products for comparison')
              else toast.success('Added to compare')
            }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border border-black/6 bg-[hsl(var(--card)/0.94)] shadow-[0_12px_24px_rgba(23,18,15,0.08)] transition-colors hover:bg-primary hover:text-white',
              isCompared && 'bg-primary/10 text-primary'
            )}
            aria-label="Compare"
            title="Compare"
          >
            <BarChart2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-0 transition-transform duration-300 sm:translate-y-full sm:group-hover:translate-y-0">
            <button type="button"
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:py-3"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="min-h-[2.5rem] line-clamp-2 text-[13px] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary sm:min-h-[3rem] sm:text-[15px] sm:leading-6">
          {product.name}
        </h3>

        <div className="mt-2.5 flex min-h-[1rem] items-center gap-1 sm:gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn('h-3 w-3', star <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
            />
          ))}
          <span className="truncate text-[11px] font-medium text-foreground/55 sm:text-[12px]">
            {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
          </span>
        </div>

        <div className="mt-3 flex min-h-[2.45rem] flex-col items-start gap-1 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:gap-2">
          <span className="font-display text-[1.12rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.36rem] lg:text-[1.5rem]">
            {formatPrice(price)}
          </span>
          {product.salePrice && (
            <span className="price-original">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('mt-auto pt-2 text-[12px] font-medium sm:text-[13px]', stockColor)}>{stockLabel}</p>
      </Link>
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
 
