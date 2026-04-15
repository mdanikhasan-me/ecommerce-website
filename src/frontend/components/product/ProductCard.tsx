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
      <Link href={`/products/${product.slug}`} className={cn('product-card flex gap-4 p-4', className)}>
        <div className="relative h-28 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
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
          <p className="text-[13px] font-medium tracking-[0.01em] text-foreground/70">{product.brand?.name}</p>
          <h3 className="mt-1 text-[15px] font-semibold leading-6 text-foreground line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 star-filled" />
            <span className="text-[12px] font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
            <span className="text-[12px] font-medium text-foreground/55">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-display font-bold">{formatPrice(price)}</span>
            {product.salePrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>}
            {discount > 0 && <span className="badge-sale">{discount}% off</span>}
          </div>
          <p className={cn('mt-2 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
        </div>
        <div className="flex flex-col items-end justify-between gap-2">
          <button onClick={handleWishlist} className={cn('p-1.5 rounded-lg hover:bg-secondary transition-colors', isWished && 'text-red-500')}>
            <Heart className={cn('h-4 w-4', isWished && 'fill-current')} />
          </button>
          <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary text-xs py-1.5 px-3">
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
      <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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

        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleWishlist}
            className={cn(
              'h-8 w-8 rounded-lg shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors',
              isWished ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-background'
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn('h-3.5 w-3.5', isWished && 'fill-current')} />
          </button>
          <button
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
              'h-8 w-8 rounded-lg bg-background shadow-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors',
              isCompared && 'bg-primary/10 text-primary'
            )}
            aria-label="Compare"
          >
            <BarChart2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        {product.brand && (
          <p className="mb-1 text-[13px] font-medium tracking-[0.01em] text-foreground/70">{product.brand.name}</p>
        )}
        <h3 className="text-[15px] font-semibold leading-6 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn('h-3 w-3', star <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
            />
          ))}
          <span className="text-[12px] font-medium text-foreground/55">{product.reviewCount} reviews</span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="price-current">{formatPrice(price)}</span>
          {product.salePrice && (
            <span className="price-original">{formatPrice(product.basePrice)}</span>
          )}
        </div>

        <p className={cn('mt-1.5 text-[13px] font-medium', stockColor)}>{stockLabel}</p>
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
