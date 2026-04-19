'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const NOTIFICATION_TYPES = ['SYSTEM', 'ORDER', 'REVIEW', 'PROMOTION', 'SELLER']
const RECIPIENT_TYPES = ['ALL', 'CUSTOMERS', 'SELLERS', 'USER']

export function NotificationComposer({
  users,
}: {
  users: Array<{ id: string; name: string | null; email: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    recipientType: 'ALL',
    userId: '',
    type: 'SYSTEM',
    title: '',
    message: '',
    link: '',
  })

  const updateField = (field: string, value: string) => {
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
    } catch (error: any) {
      toast.error(error.message || 'Could not send notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">Compose Notification</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send in-app notifications to one user or a whole audience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Audience</label>
          <select aria-label="Select option" title="Select option"
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
          <label className="mb-1.5 block text-sm font-medium">Type</label>
          <select aria-label="Select option" title="Select option"
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
          <label className="mb-1.5 block text-sm font-medium">Recipient</label>
          <select aria-label="Select option" title="Select option"
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
          <label className="mb-1.5 block text-sm font-medium">Title</label>
          <input aria-label="Form input" title="Form input"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="input-base"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea aria-label="Text area" title="Text area"
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
            className="input-base min-h-[120px] resize-y"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Link</label>
          <input aria-label="Form input" title="Form input"
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
