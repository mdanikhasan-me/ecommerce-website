'use client'

import { useWishlistStore } from '@/frontend/stores/wishlist'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const visibleItems = isHydrated ? items : []

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (items.length === 0) { setLoading(false); return }
    const fetchProducts = async () => {
      const res = await fetch(`/api/products?ids=${items.join(',')}`)
      const data = await res.json()
      setProducts(data.items ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [isHydrated, items])

  return (
    <div className="container-site py-8">
      <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <LocalIcon name="heart" className="h-6 w-6 text-primary" /> My Wishlist
        <span className="text-muted-foreground font-normal text-base">({visibleItems.length} items)</span>
      </h1>

      {visibleItems.length === 0 ? (
        <div className="text-center py-20">
          <LocalIcon name="heart" className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-30" />
          <h2 className="font-display text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground mt-2">Save products you love by clicking the heart icon.</p>
          <Link href="/" className="btn-primary mt-5 inline-flex">Discover Products</Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 min-[560px]:grid-cols-3 min-[560px]:gap-x-3.5 min-[560px]:gap-y-5 md:grid-cols-4 md:gap-x-4 md:gap-y-5 lg:gap-x-5 lg:gap-y-6 min-[1120px]:grid-cols-5 2xl:grid-cols-6">
          {visibleItems.map((_, i) => (
            <div key={i} className="aspect-square bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-4 min-[560px]:grid-cols-3 min-[560px]:gap-x-3.5 min-[560px]:gap-y-5 md:grid-cols-4 md:gap-x-4 md:gap-y-5 lg:gap-x-5 lg:gap-y-6 min-[1120px]:grid-cols-5 2xl:grid-cols-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
