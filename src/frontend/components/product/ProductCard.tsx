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
}

export function ProductCard({ product, className, layout = 'grid' }: ProductCardProps) {
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
      sku: `SKU-${product.id.slice(0, 6)}`,
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
      <Link href={`/products/${product.slug}`} className={cn('product-card flex gap-4 p-4 md:p-5', className)}>
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-[1.1rem] bg-[#eee6db]">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
              quality={82}
              sizes="112px"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-6 text-foreground">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 star-filled" />
            <span className="text-[12px] font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
            <span className="text-[12px] font-medium text-foreground/55">
              {product.reviewCount > 0 ? `(${product.reviewCount})` : '(No reviews yet)'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-display text-[1.2rem] font-bold">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>}
            {discount > 0 && <span className="badge-sale">{discount}% off</span>}
          </div>
          <p className={cn('mt-2 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
        </div>
        <div className="flex flex-col items-end justify-between gap-2">
          <button type="button" aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'} title={isWished ? 'Remove from wishlist' : 'Add to wishlist'} onClick={handleWishlist} className={cn('p-1.5 rounded-lg hover:bg-secondary transition-colors', isWished && 'text-red-500')}>
            <Heart className={cn('h-4 w-4', isWished && 'fill-current')} />
          </button>
          <button type="button" onClick={handleAddToCart} disabled={!inStock} className="btn-primary text-xs py-1.5 px-3">
            Add to Cart
          </button>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn('product-card group block', className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-[1.35rem] bg-[#eee6db]">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
            quality={84}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
        <div className="absolute right-2 top-2 flex translate-x-10 flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
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
          <div className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <button type="button"
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn('h-3 w-3', star <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
            />
          ))}
          <span className="text-[12px] font-medium text-foreground/55">
            {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
          </span>
        </div>

        <div className="mt-3.5 flex flex-col items-start gap-1 min-[420px]:flex-row min-[420px]:items-baseline min-[420px]:gap-2">
          <span className="font-display text-[1.28rem] font-bold leading-tight tracking-tight text-foreground sm:text-[1.48rem] lg:text-[1.62rem]">
            {formatPrice(price)}
          </span>
          {product.salePrice && (
            <span className="price-original">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('mt-2 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
      </div>
    </Link>
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
 
