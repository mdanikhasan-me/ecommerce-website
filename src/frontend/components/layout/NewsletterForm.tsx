'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'

type HomepageNewsletterFormProps = {
  variant?: 'dark' | 'light'
  source?: string
  layout?: 'stacked' | 'inline'
}

export function HomepageNewsletterForm({
  variant = 'dark',
  source = 'homepage',
  layout = 'stacked',
}: HomepageNewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isLight = variant === 'light'
  const isInline = layout === 'inline'

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
    <form onSubmit={onSubmit} className={isInline ? 'flex gap-2' : 'flex flex-col gap-3 sm:flex-row'}>
      <input
        type="email"
        required
        aria-label="Email address"
        placeholder={isInline ? 'Email address' : 'Enter your email address'}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
          isLight
            ? `${isInline ? 'h-10 rounded-md px-3 py-2 shadow-none' : 'rounded-lg px-4 py-3 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-xl sm:px-5'} min-w-0 flex-1 border border-black/10 bg-white text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/10`
            : 'min-w-0 flex-1 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/52 transition-all focus:border-white/38 focus:bg-white/14 focus:outline-none'
        }
      />
      <button
        type="submit"
        disabled={submitting}
        aria-label={isInline ? 'Subscribe to store updates' : undefined}
        title={isInline ? 'Subscribe to store updates' : undefined}
        className={
          isLight
            ? `${isInline ? 'h-10 w-10 px-0 sm:w-auto sm:px-4' : 'px-6 shadow-[0_14px_26px_rgba(45,27,61,0.14)]'} flex-shrink-0 rounded-md bg-primary py-2 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 disabled:opacity-60`
            : 'flex-shrink-0 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-sm font-bold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white disabled:opacity-60'
        }
      >
        {submitting ? (
          '...'
        ) : (
          <>
            <span className={isInline ? 'hidden sm:inline' : undefined}>Subscribe</span>
            {isInline ? <ArrowRight className="mx-auto h-4 w-4 sm:hidden" /> : null}
          </>
        )}
      </button>
    </form>
  )
}
