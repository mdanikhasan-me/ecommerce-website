'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UserManagementFormProps {
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    role: string
    isActive: boolean
    createdAt: Date | string
    _count: {
      orders: number
      reviews: number
      addresses: number
      notifications: number
    }
  }
}

const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']

export function UserManagementForm({ user }: UserManagementFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: user.name ?? '',
    phone: user.phone ?? '',
    role: user.role,
    isActive: user.isActive,
  })
  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not update user')
      }

      toast.success('User updated')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Could not update user')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Account Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update profile, contact information, role access, and account status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <input aria-label="Form input" title="Form input"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="input-base"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input aria-label="Form input" title="Form input" value={user.email} disabled className="input-base opacity-70" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <input aria-label="Form input" title="Form input"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="input-base"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <select aria-label="Select option" title="Select option"
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="input-base"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
          <input aria-label="Form input" title="Form input"
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => updateField('isActive', event.target.checked)}
            className="size-4 rounded border-input"
          />
          Account is active
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link href="/admin/users" className="btn-outline">
            Back to Users
          </Link>
          <button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display font-semibold">Activity Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orders</span>
              <span className="font-medium">{user._count.orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reviews</span>
              <span className="font-medium">{user._count.reviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Addresses</span>
              <span className="font-medium">{user._count.addresses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notifications</span>
              <span className="font-medium">{user._count.notifications}</span>
            </div>
          </div>
        </section>

      </aside>
    </form>
  )
}
