'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from '@/frontend/lib/toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not update notification'))
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not delete notification'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-start gap-2 md:justify-end">
      <button
        type="button"
        onClick={toggleRead}
        disabled={loading !== null}
        className="admin-table-action px-3 disabled:opacity-50"
        aria-label={isRead ? 'Mark notification unread' : 'Mark notification read'}
        title={isRead ? 'Mark unread' : 'Mark read'}
      >
        <LocalIcon name="mail" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={loading !== null}
        className="admin-table-action px-3 text-red-600 disabled:opacity-50"
        aria-label="Delete notification"
        title="Delete"
      >
        <LocalIcon name="trash-2" className="h-4 w-4" />
      </button>
    </div>
  )
}
