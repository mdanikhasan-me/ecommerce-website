'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type HomepageNewsletterFormProps = {
  variant?: 'dark' | 'light'
  source?: string
  layout?: 'stacked' | 'inline'
  density?: 'compact' | 'spacious'
  submitDisplay?: 'responsive' | 'icon'
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function HomepageNewsletterForm({
  variant = 'dark',
  source = 'homepage',
  layout = 'stacked',
  density = 'compact',
  submitDisplay = 'responsive',
}: HomepageNewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isLight = variant === 'light'
  const isInline = layout === 'inline'
  const isSpacious = density === 'spacious'
  const isIconSubmit = submitDisplay === 'icon'

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
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not subscribe'))
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
            ? `${isInline ? (isSpacious ? 'h-12 rounded-lg px-4 py-3 text-sm shadow-none md:h-[3.25rem] md:px-5 md:text-base' : 'h-9 rounded-md px-3 py-2 text-xs shadow-none min-[600px]:h-10 min-[600px]:text-sm') : 'rounded-lg px-4 py-3 text-sm shadow-[0_6px_16px_rgba(23,18,15,0.035)] sm:rounded-xl sm:px-5'} min-w-0 flex-1 border border-black/10 bg-white text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/10`
            : 'min-w-0 flex-1 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/52 transition-colors focus:border-white/38 focus:bg-white/14 focus:outline-none'
        }
      />
      <button
        type="submit"
        disabled={submitting}
        aria-label={isInline ? 'Subscribe to store updates' : undefined}
        title={isInline ? 'Subscribe to store updates' : undefined}
        className={
          isLight
            ? `${isInline ? (isSpacious ? 'h-12 w-14 px-0 md:h-[3.25rem] md:w-[4.4rem]' : isIconSubmit ? 'h-9 w-9 px-0 min-[600px]:h-10 min-[600px]:w-10' : 'h-9 w-9 px-0 min-[600px]:h-10 min-[600px]:w-auto min-[600px]:px-4') : 'px-6 shadow-[0_8px_18px_rgba(45,27,61,0.1)]'} flex-shrink-0 rounded-md bg-primary py-2 text-sm font-bold text-primary-foreground transition-colors md:hover:bg-primary/90 disabled:opacity-60`
            : 'flex-shrink-0 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-sm font-bold text-[#2d1b3d] transition-colors md:hover:bg-white disabled:opacity-60'
        }
      >
        {submitting ? (
          '...'
        ) : isInline && isIconSubmit ? (
          <LocalIcon name="arrow-right" className="mx-auto h-5 w-5" />
        ) : (
          <>
            <span className={isInline ? 'hidden sm:inline' : undefined}>Subscribe</span>
            {isInline ? <LocalIcon name="arrow-right" className="mx-auto h-4 w-4 sm:hidden" /> : null}
          </>
        )}
      </button>
    </form>
  )
}
