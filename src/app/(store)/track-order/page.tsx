'use client'

import { useState } from 'react'
import { Search, Package } from 'lucide-react'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orderNumber.trim()
    if (trimmed) {
      window.location.href = `/account/orders?orderNumber=${encodeURIComponent(trimmed)}`
    }
  }

  return (
    <div className="container-site py-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">Enter your order number to see the latest status.</p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input aria-label="e.g. BB-20260413-XXXX" title="e.g. BB-20260413-XXXX"
              type="text"
              placeholder="e.g. BB-20260413-XXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-base pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>

        <p className="text-xs text-muted-foreground mt-4">
          You can find your order number in the confirmation email or in your account under My Orders.
        </p>
      </div>
    </div>
  )
}
