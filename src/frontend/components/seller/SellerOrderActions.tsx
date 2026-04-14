'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PACKED',
  PACKED: 'SHIPPED',
}

const LABELS: Record<string, string> = {
  CONFIRMED: 'Confirm Order',
  PACKED: 'Mark as Packed',
  SHIPPED: 'Mark as Shipped',
}

export function SellerOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const next = NEXT_STATUS[currentStatus]

  if (!next) return null

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await fetch(`/api/seller/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleUpdate} disabled={loading} className="btn-primary gap-2">
      {loading && <Loader2 className="size-4 animate-spin" />}
      {LABELS[next]}
    </button>
  )
}
