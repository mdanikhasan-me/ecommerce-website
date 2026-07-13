'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from '@/frontend/lib/toast'

const NOTIFICATION_TYPES = ['ORDER', 'REVIEW', 'PROMOTION', 'SYSTEM', 'SELLER'] as const
const RECIPIENT_TYPES = ['ALL', 'CUSTOMERS', 'USER'] as const

interface NotificationComposerFormState {
  recipientType: string
  userId: string
  type: string
  title: string
  message: string
  link: string
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function NotificationComposer({
  users,
}: {
  users: Array<{ id: string; name: string | null; email: string }>
}) {
  const router = useRouter()
  const fieldIdPrefix = 'admin-notification'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<NotificationComposerFormState>({
    recipientType: 'ALL',
    userId: '',
    type: 'SYSTEM',
    title: '',
    message: '',
    link: '',
  })

  const updateField = <Field extends keyof NotificationComposerFormState>(
    field: Field,
    value: NotificationComposerFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not send notification')
      }

      toast.success(`Notification sent to ${data.count} recipient${data.count === 1 ? '' : 's'}`)
      setForm({
        recipientType: 'ALL',
        userId: '',
        type: 'SYSTEM',
        title: '',
        message: '',
        link: '',
      })
      router.refresh()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not send notification'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor={`${fieldIdPrefix}-audience`} className="mb-1.5 block text-sm font-medium">
            Audience
          </label>
          <select
            id={`${fieldIdPrefix}-audience`}
            value={form.recipientType}
            onChange={(event) => updateField('recipientType', event.target.value)}
            className="input-base"
          >
            {RECIPIENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${fieldIdPrefix}-type`} className="mb-1.5 block text-sm font-medium">
            Type
          </label>
          <select
            id={`${fieldIdPrefix}-type`}
            value={form.type}
            onChange={(event) => updateField('type', event.target.value)}
            className="input-base"
          >
            {NOTIFICATION_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {form.recipientType === 'USER' && (
        <div className="mt-4">
          <label htmlFor={`${fieldIdPrefix}-recipient`} className="mb-1.5 block text-sm font-medium">
            Recipient
          </label>
          <select
            id={`${fieldIdPrefix}-recipient`}
            value={form.userId}
            onChange={(event) => updateField('userId', event.target.value)}
            className="input-base"
            required
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor={`${fieldIdPrefix}-title`} className="mb-1.5 block text-sm font-medium">
            Title
          </label>
          <input
            id={`${fieldIdPrefix}-title`}
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="input-base"
            required
          />
        </div>
        <div>
          <label htmlFor={`${fieldIdPrefix}-message`} className="mb-1.5 block text-sm font-medium">
            Message
          </label>
          <textarea
            id={`${fieldIdPrefix}-message`}
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
            className="input-base min-h-[120px] resize-y"
            required
          />
        </div>
        <div>
          <label htmlFor={`${fieldIdPrefix}-link`} className="mb-1.5 block text-sm font-medium">
            Link
          </label>
          <input
            id={`${fieldIdPrefix}-link`}
            value={form.link}
            onChange={(event) => updateField('link', event.target.value)}
            className="input-base"
            placeholder="/account/orders/..."
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'Sending...' : 'Send notification'}
        </button>
      </div>
    </form>
  )
}
