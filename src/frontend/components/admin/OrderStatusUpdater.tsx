'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_REQUESTED',
  'REFUNDED',
] as const

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async () => {
    if (status === currentStatus) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not update order status')
      }
      toast.success('Order status updated')
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not update order status'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`order-status-${orderId}`} className="sr-only">
        Order status
      </label>
      <select
        id={`order-status-${orderId}`}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input-base w-44 text-sm"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
      <label htmlFor={`order-status-note-${orderId}`} className="sr-only">
        Order status note
      </label>
      <input
        id={`order-status-note-${orderId}`}
        aria-label="Order status note"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="input-base w-40 text-sm hidden sm:block"
      />
      <button type="button"
        onClick={updateStatus}
        disabled={loading || status === currentStatus}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update'}
      </button>
    </div>
  )
}
