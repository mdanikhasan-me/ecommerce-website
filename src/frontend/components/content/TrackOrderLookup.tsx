'use client'

import { useState } from 'react'
import { Package, Search } from 'lucide-react'

export function TrackOrderLookup() {
  const [orderNumber, setOrderNumber] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = orderNumber.trim()
    if (trimmed) {
      window.location.href = `/account/orders?orderNumber=${encodeURIComponent(trimmed)}`
    }
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-4 w-fit rounded-2xl bg-primary/10 p-3">
        <Package className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 font-display text-3xl font-bold">Track Your Order</h1>
      <p className="mb-8 text-muted-foreground">Enter your order number to see the latest status.</p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Order number"
            type="text"
            placeholder="e.g. BB-20260413-XXXX"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="input-base pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Track</button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        You can find your order number on the order confirmation page or in your account under My Orders.
      </p>
    </div>
  )
}
