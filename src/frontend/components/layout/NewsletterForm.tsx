'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function HomepageNewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not subscribe')
      toast.success('Subscribed! Thanks for joining the list.')
      setEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Could not subscribe')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        aria-label="Email address"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-white/16 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/48 transition-all focus:border-white/34 focus:bg-white/14 focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex-shrink-0 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3.5 text-sm font-bold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white disabled:opacity-60"
      >
        {submitting ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}

export function NewsletterForm({ source }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not subscribe')
      toast.success('Subscribed! Thanks for joining the list.')
      setEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Could not subscribe')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex gap-2">
      <input aria-label="Email address" title="Email address"
        type="email"
        required
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-white/20"
      />
      <button type="submit" disabled={submitting} className="btn-primary shrink-0 disabled:opacity-60">
        {submitting ? '...' : 'Join'}
      </button>
    </form>
  )
}
