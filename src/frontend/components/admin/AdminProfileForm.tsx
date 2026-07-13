'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Loader2, Mail, Phone, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react'

type AdminProfileUser = {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  role: string
}

export function AdminProfileForm({ user }: { user: AdminProfileUser }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: user.name ?? '', phone: user.phone ?? '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not update profile')
      setMessage({ tone: 'success', text: 'Profile updated successfully.' })
      router.refresh()
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Could not update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.55fr)]">
      <section className="admin-card p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="admin-profile-avatar h-16 w-16 text-xl sm:h-[4.5rem] sm:w-[4.5rem]">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{(user.name || user.email).charAt(0).toUpperCase()}</span>
            )}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{user.name || 'Administrator'}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {message ? (
          <p role="status" className={`mt-5 rounded-md px-3.5 py-3 text-sm ${message.tone === 'success' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
            {message.text}
          </p>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-profile-name" className="mb-1.5 block text-sm font-medium">Full name</label>
            <input
              id="admin-profile-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoComplete="name"
              required
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="admin-profile-phone" className="mb-1.5 block text-sm font-medium">Phone</label>
            <input
              id="admin-profile-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              autoComplete="tel"
              placeholder="+880..."
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="admin-profile-email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="admin-profile-email" value={user.email} readOnly disabled className="input-base" />
            <p className="mt-1.5 text-xs text-muted-foreground">Email remains read-only for account security.</p>
          </div>
        </div>

        <div className="admin-form-actions mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="admin-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="admin-section-title">Access summary</h2>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="min-w-0"><dt className="text-xs text-muted-foreground">Signed-in email</dt><dd className="truncate font-medium">{user.email}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div><dt className="text-xs text-muted-foreground">Contact number</dt><dd className="font-medium">{user.phone || 'Not provided'}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div><dt className="text-xs text-muted-foreground">Permission level</dt><dd className="font-medium capitalize">{user.role.toLowerCase().replace('_', ' ')}</dd></div>
            </div>
          </dl>
        </section>

        <section className="admin-card grid gap-2 p-3">
          <Link href="/admin/settings" className="admin-profile-menu-item">
            <SlidersHorizontal className="h-4 w-4" /> Store settings
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer" className="admin-profile-menu-item">
            <ExternalLink className="h-4 w-4" /> Open storefront
          </Link>
        </section>
      </aside>
    </form>
  )
}
