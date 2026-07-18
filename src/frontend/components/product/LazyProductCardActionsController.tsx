'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const ProductCardActionsController = dynamic(
  () =>
    import('@/frontend/components/product/ProductCardActionsController').then(
      (mod) => mod.ProductCardActionsController
    ),
  { loading: () => null, ssr: false },
)

export function LazyProductCardActionsController() {
  const [shouldLoadController, setShouldLoadController] = useState(false)

  useEffect(() => {
    if (shouldLoadController) return

    const load = () => setShouldLoadController(true)

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 2500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timer = setTimeout(load, 900)
    return () => clearTimeout(timer)
  }, [shouldLoadController])

  if (!shouldLoadController) return null

  return <ProductCardActionsController />
}
