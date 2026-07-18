'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import toast from '@/frontend/lib/toast'
import { useCartStore, type CartItem } from '@/frontend/stores/cart'
import { useCompareStore } from '@/frontend/stores/compare'
import { useWishlistStore } from '@/frontend/stores/wishlist'
import { getClientSession } from '@/frontend/hooks/useClientSession'

type ProductAction = 'cart' | 'wishlist' | 'compare'
type ActionButton = HTMLButtonElement & { dataset: { productAction?: ProductAction } }

function getCurrentCallbackUrl() {
  return `${window.location.pathname}${window.location.search}`
}

function getActionProduct(button: ActionButton) {
  const root = button.closest<HTMLElement>('[data-product-actions]')
  const rawProduct = root?.dataset.product
  if (!rawProduct) return null

  try {
    return JSON.parse(rawProduct) as Omit<CartItem, 'quantity'>
  } catch {
    return null
  }
}

function syncActionState(root: ParentNode) {
  const wishlist = new Set(useWishlistStore.getState().items)
  const compare = new Set(useCompareStore.getState().items)

  root.querySelectorAll<ActionButton>('[data-product-action="wishlist"]').forEach((button) => {
    const productId = button.dataset.productId ?? ''
    const productName = button.dataset.productName ?? 'product'
    const isActive = wishlist.has(productId)
    button.dataset.active = isActive ? 'true' : ''
    button.setAttribute('aria-label', `${isActive ? 'In Wishlist' : 'Add to Wishlist'} ${productName}`)
    button.title = button.getAttribute('aria-label') ?? ''
  })

  root.querySelectorAll<ActionButton>('[data-product-action="compare"]').forEach((button) => {
    const productId = button.dataset.productId ?? ''
    const productName = button.dataset.productName ?? 'product'
    const isActive = compare.has(productId)
    button.dataset.active = isActive ? 'true' : ''
    button.setAttribute('aria-label', isActive ? `Open compare for ${productName}` : `Compare ${productName}`)
    button.removeAttribute('title')
  })
}

export function ProductCardActionsController() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeSignature = `${pathname}?${searchParams.toString()}`

  useEffect(() => {
    const storefrontMain = document.querySelector('main')
    if (!storefrontMain) return

    let syncFrame: number | null = null
    const scheduleSync = () => {
      if (syncFrame !== null) return
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = null
        syncActionState(storefrontMain)
      })
    }

    const unsubscribeWishlist = useWishlistStore.subscribe(scheduleSync)
    const unsubscribeCompare = useCompareStore.subscribe(scheduleSync)
    scheduleSync()

    const handleClick = async (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest<ActionButton>('[data-product-action]')
      if (!button || button.disabled) return

      const action = button.dataset.productAction
      const product = getActionProduct(button)
      if (!action || !product) return

      event.preventDefault()
      event.stopPropagation()

      if (action === 'cart') {
        useCartStore.getState().addItem(product)
        toast.success('Added to cart')
        return
      }

      if (action === 'wishlist') {
        const wasWished = useWishlistStore.getState().items.includes(product.productId)
        useWishlistStore.getState().toggle(product.productId)
        toast.success(wasWished ? 'Removed from wishlist' : 'Added to wishlist')
        return
      }

      if (button.dataset.checking === 'true') return
      button.dataset.checking = 'true'
      button.disabled = true
      const signedIn = Boolean(await getClientSession().catch(() => null))
      delete button.dataset.checking
      button.disabled = false

      if (!signedIn) {
        toast.error('Please sign in before comparing products')
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(getCurrentCallbackUrl())}`)
        return
      }

      if (useCompareStore.getState().items.includes(product.productId)) {
        router.push('/compare')
        return
      }

      const success = useCompareStore.getState().add(product.productId)
      if (!success) toast.error('Max 4 products for comparison')
      else toast.success('Added to compare')
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      unsubscribeWishlist()
      unsubscribeCompare()
      if (syncFrame !== null) window.cancelAnimationFrame(syncFrame)
    }
  }, [routeSignature, router])

  return null
}
