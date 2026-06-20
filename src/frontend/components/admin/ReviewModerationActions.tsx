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
    <div className="flex gap-2 flex-shrink-0">
      {showApprove && (
        <button type="button"
          onClick={() => moderate('approve')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 text-xs font-semibold min-[1025px]:hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {loading === 'approve' ? '...' : 'Approve'}
        </button>
      )}
      {showReject && (
        <button type="button"
          onClick={() => moderate('reject')}
          disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold min-[1025px]:hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          {loading === 'reject' ? '...' : 'Reject'}
        </button>
      )}
    </div>
  )
}
