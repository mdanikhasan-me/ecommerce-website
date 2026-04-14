'use client'

import { useWishlistStore } from '@/frontend/stores'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return }
    const fetchProducts = async () => {
      const res = await fetch(`/api/products?ids=${items.join(',')}`)
      const data = await res.json()
      setProducts(data.items ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [items])

  return (
    <div className="container-site py-8">
      <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" /> My Wishlist
        <span className="text-muted-foreground font-normal text-base">({items.length} items)</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="font-display text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground mt-2">Save products you love by clicking the heart icon.</p>
          <Link href="/" className="btn-primary mt-5 inline-flex">Discover Products</Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((_, i) => (
            <div key={i} className="aspect-square bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
