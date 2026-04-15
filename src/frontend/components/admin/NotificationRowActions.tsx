'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function NotificationRowActions({
  notificationId,
  isRead,
}: {
  notificationId: string
  isRead: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'toggle' | 'delete' | null>(null)

  const toggleRead = async () => {
    setLoading('toggle')
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update notification')
      }

      toast.success(isRead ? 'Marked as unread' : 'Marked as read')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Could not update notification')
    } finally {
      setLoading(null)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this notification?')) return

    setLoading('delete')
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not delete notification')
      }

      toast.success('Notification deleted')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Could not delete notification')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={toggleRead} disabled={loading !== null} className="text-xs text-primary hover:underline disabled:opacity-50">
        {isRead ? 'Mark unread' : 'Mark read'}
      </button>
      <button type="button" onClick={remove} disabled={loading !== null} className="text-xs text-red-600 hover:underline disabled:opacity-50">
        Delete
      </button>
    </div>
  )
}
