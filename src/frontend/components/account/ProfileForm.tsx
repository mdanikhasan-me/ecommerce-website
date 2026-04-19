'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'

interface ProfileFormProps {
  user: { id: string; name: string | null; email: string; phone: string | null; image: string | null }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: user.name ?? '',
    phone: user.phone ?? '',
  })

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to update profile')
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
      {saved && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg border border-green-200">Profile updated successfully</div>}

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-2xl">
              {(user.name?.[0] ?? 'U').toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-semibold text-lg">{user.name ?? 'User'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              title="Full name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-base"
              required
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              title="Email address (read-only)"
              value={user.email}
              disabled
              readOnly
              className="input-base opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label htmlFor="profile-phone" className="text-sm font-medium mb-1.5 block">Phone</label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              title="Phone number"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input-base"
              placeholder="+880..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Profile
        </button>
      </div>
    </form>
  )
}
