'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import toast from '@/frontend/lib/toast'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function ReviewModerationActions({
  reviewId,
  currentStatus,
}: {
  reviewId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const moderate = async (action: 'approve' | 'reject') => {
    setLoading(action)
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not moderate review')
      }
      toast.success(action === 'approve' ? 'Review approved' : 'Review rejected')
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not moderate review'))
    } finally {
      setLoading(null)
    }
  }

  const showApprove = currentStatus !== 'APPROVED'
  const showReject = currentStatus !== 'REJECTED'

  return (
    <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto">
      {showApprove && (
        <button type="button"
          onClick={() => moderate('approve')}
          disabled={!!loading}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 disabled:opacity-50 sm:flex-none"
        >
          <Check className="h-3.5 w-3.5" />
          {loading === 'approve' ? '...' : 'Approve'}
        </button>
      )}
      {showReject && (
        <button type="button"
          onClick={() => moderate('reject')}
          disabled={!!loading}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50 sm:flex-none"
        >
          <X className="h-3.5 w-3.5" />
          {loading === 'reject' ? '...' : 'Reject'}
        </button>
      )}
    </div>
  )
}
