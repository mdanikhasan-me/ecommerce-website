'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const RETURN_STATUSES = ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'INSPECTED', 'REFUNDED']

export function ReturnRequestManager({
  requestId,
  currentStatus,
  refundAmount,
  notes,
}: {
  requestId: string
  currentStatus: string
  refundAmount: number | null
  notes: string | null
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [amount, setAmount] = useState(refundAmount?.toString() ?? '')
  const [adminNotes, setAdminNotes] = useState(notes ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/returns/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          refundAmount: amount,
          notes: adminNotes,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update return request')
      }

      toast.success('Return request updated')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Could not update return request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h3 className="font-display text-lg font-semibold">Manage Return</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update fulfillment state, refund amount, and internal notes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Return status</label>
          <select aria-label="Select option" title="Select option" value={status} onChange={(event) => setStatus(event.target.value)} className="input-base">
            {RETURN_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Refund amount</label>
          <input aria-label="Form input" title="Form input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="input-base"
            placeholder="Optional refund amount"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Admin notes</label>
        <textarea aria-label="Text area" title="Text area"
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          className="input-base min-h-[130px] resize-y"
          placeholder="Add internal notes or customer-facing explanation"
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Saving...' : 'Save return update'}
        </button>
      </div>
    </form>
  )
}
