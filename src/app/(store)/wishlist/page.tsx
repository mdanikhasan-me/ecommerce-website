'use client'

import { useWishlistStore } from '@/frontend/stores/wishlist'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import type { ProductCardData } from '@/backend/types'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items)
  const reconcileAvailable = useWishlistStore((state) => state.reconcileAvailable)
  const [isHydrated, setIsHydrated] = useState(false)
  const [products, setProducts] = useState<ProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const visibleItems = isHydrated ? items : []

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (items.length === 0) { setProducts([]); setLoading(false); return }
    const requestedIds = [...items]
    let cancelled = false
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?ids=${requestedIds.join(',')}`)
        if (!res.ok) throw new Error('Failed to load wishlist products')
        const data = await res.json()
        const nextProducts = data.items ?? []
        if (cancelled) return
        setProducts(nextProducts)
        reconcileAvailable(requestedIds, nextProducts.map((product: ProductCardData) => product.id))
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [isHydrated, items, reconcileAvailable])

  const productCount = loading ? null : products.length

  return (
    <div className="product-list-scope container-site py-8">
      <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <LocalIcon name="bookmark-plus" className="h-6 w-6 text-primary" /> My Wishlist
        <span className="text-base font-normal text-muted-foreground">({productCount ?? '…'} {productCount === 1 ? 'item' : 'items'})</span>
      </h1>

      {visibleItems.length === 0 ? (
        <div className="text-center py-20">
          <LocalIcon name="bookmark-plus" className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-30" />
          <h2 className="font-display text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground mt-2">Save products by using the wishlist button.</p>
          <Link href="/" className="btn-primary mt-5 inline-flex">Discover Products</Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {visibleItems.map((_, i) => (
            <div key={i} className="product-media-frame animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
