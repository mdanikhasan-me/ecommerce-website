'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/frontend/stores/cart'

const CartDrawer = dynamic(
  () => import('@/frontend/components/cart/CartDrawer').then((mod) => mod.CartDrawer),
  { loading: () => null, ssr: false },
)

export function LazyCartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen)
  const itemCount = useCartStore((state) => state.items.length)
  const [shouldLoadDrawer, setShouldLoadDrawer] = useState(false)

  useEffect(() => {
    if (isOpen || itemCount > 0) {
      setShouldLoadDrawer(true)
    }
  }, [isOpen, itemCount])

  if (!shouldLoadDrawer) return null

  return <CartDrawer />
}
