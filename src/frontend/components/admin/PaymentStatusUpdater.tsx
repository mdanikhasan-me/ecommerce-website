'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from '@/frontend/lib/toast'

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'] as const

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function PaymentStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (status === currentStatus) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update payment status')
      }

      toast.success('Payment status updated')
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not update payment status'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-secondary/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Update payment status
      </p>
      <div className="flex flex-col gap-2">
        <label htmlFor={`payment-status-${orderId}`} className="sr-only">
          Payment status
        </label>
        <select
          id={`payment-status-${orderId}`}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="input-base text-sm"
        >
          {PAYMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.replace('_', ' ')}
            </option>
          ))}
        </select>
        <label htmlFor={`payment-status-note-${orderId}`} className="sr-only">
          Payment note
        </label>
        <input
          id={`payment-status-note-${orderId}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Payment note"
          className="input-base text-sm"
        />
        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading || status === currentStatus}
          className="btn-outline justify-center text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save payment status'}
        </button>
      </div>
    </div>
  )
}
