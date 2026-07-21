'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

const ORDER_ID_PATTERN = /^BLB-\d{6}$/

const questions = [
  ['Where can I find my Order ID?', 'Your Order ID is in your order confirmation email and in My Account after you sign in.'],
  ["What should I do if my order shows delivered but I haven't received it?", 'Contact support with your Order ID so we can review the delivery update with you.'],
  ['How often is the order status updated?', 'Your order status updates whenever the order moves through the next delivery stage.'],
] as const satisfies ReadonlyArray<readonly [string, string]>

export function TrackOrderLookup({ initialError = null }: { initialError?: string | null }) {
  const [orderNumber, setOrderNumber] = useState('')
  const [lookupError, setLookupError] = useState(initialError)
  const router = useRouter()
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const normalized = orderNumber.trim().toUpperCase()
    if (!ORDER_ID_PATTERN.test(normalized)) {
      setLookupError('Enter a valid Order ID in the format BLB-123456.')
      return
    }
    setLookupError(null)
    router.push(`/account/orders/${encodeURIComponent(normalized)}`)
  }

  return (
    <section aria-labelledby="track-order-heading" className="w-full">
      <header className="mx-auto max-w-2xl text-center">
        <h1 id="track-order-heading" className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Track your order</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">Enter your Order ID to see the latest status and delivery progress.</p>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl pb-8">
        <label htmlFor="track-order-id" className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold"><LocalIcon name="package" className="h-4 w-4 text-primary" /> Order ID</label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]"><input id="track-order-id" aria-label="Order number" type="text" placeholder="e.g. BLB-482913" value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); if (lookupError) setLookupError(null) }} required maxLength={80} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="h-12 min-w-0 rounded-lg border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground" /><button type="submit" className="h-12 rounded-lg bg-[#121212] px-5 text-sm font-semibold text-white">Track order</button></div>
        <p className="mt-2 text-center text-sm text-muted-foreground">You can find your Order ID in the confirmation email we sent you.</p>{lookupError ? <p role="alert" className="mt-3 text-center text-sm text-red-600">{lookupError}</p> : null}
      </form>

      <div className="pt-8"><SupportFaqList questions={questions} /></div>
      <div className="mt-7"><SupportContactBar title="Need help tracking an order?" description="Contact us with your Order ID and we will help check the latest update." /></div>
    </section>
  )
}
