'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { AdminUserDetail } from '@/backend/admin/user-editor'

interface UserManagementFormProps {
  user: AdminUserDetail
}

const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']

interface UserManagementFormState {
  name: string
  phone: string
  role: string
  isActive: boolean
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function UserManagementForm({ user }: UserManagementFormProps) {
  const router = useRouter()
  const fieldIdPrefix = `admin-user-${user.id}`
  const [form, setForm] = useState<UserManagementFormState>({
    name: user.name ?? '',
    phone: user.phone ?? '',
    role: user.role,
    isActive: user.isActive,
  })
  const [isSaving, setIsSaving] = useState(false)

  const updateField = <Field extends keyof UserManagementFormState>(
    field: Field,
    value: UserManagementFormState[Field],
  ) => {
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not update user'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6 rounded-md border border-border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Account Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update profile, contact information, role access, and account status.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor={`${fieldIdPrefix}-name`} className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id={`${fieldIdPrefix}-name`}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="input-base"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label htmlFor={`${fieldIdPrefix}-email`} className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input id={`${fieldIdPrefix}-email`} value={user.email} disabled className="input-base opacity-70" />
          </div>
          <div>
            <label htmlFor={`${fieldIdPrefix}-phone`} className="mb-1.5 block text-sm font-medium">
              Phone
            </label>
            <input
              id={`${fieldIdPrefix}-phone`}
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className="input-base"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label htmlFor={`${fieldIdPrefix}-role`} className="mb-1.5 block text-sm font-medium">
              Role
            </label>
            <select
              id={`${fieldIdPrefix}-role`}
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

        <label
          htmlFor={`${fieldIdPrefix}-is-active`}
          className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm"
        >
          <input
            id={`${fieldIdPrefix}-is-active`}
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
        <section className="rounded-md border border-border bg-card p-5">
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
