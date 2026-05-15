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
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        aria-label="Email address"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/52 transition-all focus:border-white/38 focus:bg-white/14 focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex-shrink-0 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-sm font-bold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white disabled:opacity-60"
      >
        {submitting ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
