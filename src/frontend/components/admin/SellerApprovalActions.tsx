'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Ban, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  sellerId: string
  currentStatus: string
}

export function SellerApprovalActions({ sellerId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (status: string) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this seller?`)) return
    setLoading(status)
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not update seller status')
      }
      toast.success(`Seller marked as ${status.toLowerCase()}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Could not update seller status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'APPROVED' && (
        <button
          onClick={() => handleAction('APPROVED')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading === 'APPROVED' ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          Approve
        </button>
      )}
      {currentStatus !== 'REJECTED' && currentStatus !== 'APPROVED' && (
        <button
          onClick={() => handleAction('REJECTED')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading === 'REJECTED' ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
          Reject
        </button>
      )}
      {currentStatus === 'APPROVED' && (
        <button
          onClick={() => handleAction('SUSPENDED')}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {loading === 'SUSPENDED' ? <Loader2 className="size-3.5 animate-spin" /> : <Ban className="size-3.5" />}
          Suspend
        </button>
      )}
    </div>
  )
}
