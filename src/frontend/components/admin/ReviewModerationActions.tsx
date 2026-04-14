'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
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
      if (!res.ok) throw new Error()
      toast.success(action === 'approve' ? 'Review approved' : 'Review rejected')
      router.refresh()
    } catch {
      toast.error('Action failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => moderate('approve')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        {loading === 'approve' ? '...' : 'Approve'}
      </button>
      <button
        onClick={() => moderate('reject')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
        {loading === 'reject' ? '...' : 'Reject'}
      </button>
    </div>
  )
}
