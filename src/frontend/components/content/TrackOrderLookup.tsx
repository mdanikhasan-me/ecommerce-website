'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL } from '@/shared/contact'

const ORDER_ID_PATTERN = /^BLB-\d{6}$/

const questions = [
  ['Where can I find my Order ID?', 'Your Order ID is in your order confirmation email and in My Account after you sign in.'],
  ["What should I do if my order shows delivered but I haven't received it?", 'Contact support with your Order ID so we can review the delivery update with you.'],
  ['How often is the order status updated?', 'Your order status updates whenever the order moves through the next delivery stage.'],
]

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
      <p className="text-sm text-muted-foreground">Help Center <span className="mx-2">/</span> <span className="font-medium text-foreground">Track order</span></p>
      <h1 id="track-order-heading" className="mt-4 font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Track your order</h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">Enter your Order ID to see the latest status and delivery progress.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5 border-b border-border pb-8 lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:items-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-primary"><LocalIcon name="package" className="h-12 w-12" /></span>
        <div><label htmlFor="track-order-id" className="mb-2 block text-sm font-semibold">Order ID</label><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]"><input id="track-order-id" aria-label="Order number" type="text" placeholder="e.g. BLB-482913" value={orderNumber} onChange={(event) => { setOrderNumber(event.target.value); if (lookupError) setLookupError(null) }} required maxLength={80} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="h-12 min-w-0 rounded-lg border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground" /><button type="submit" className="h-12 rounded-lg bg-[#121212] px-5 text-sm font-semibold text-white">Track order</button></div><p className="mt-2 text-sm text-muted-foreground">You can find your Order ID in the confirmation email we sent you.</p>{lookupError ? <p role="alert" className="mt-3 text-sm text-red-600">{lookupError}</p> : null}</div>
      </form>

      <section className="grid gap-5 border-b border-border py-6 sm:grid-cols-2 sm:divide-x sm:divide-border"><Link href="/contact" className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50"><LocalIcon name="message-circle" className="h-6 w-6" /></span><span><strong className="block text-sm">Contact support</strong><span className="mt-1 block text-sm text-muted-foreground">Chat with our team for quick help</span></span><LocalIcon name="arrow-right" className="ml-auto h-4 w-4" /></Link><a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 sm:pl-6"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50"><LocalIcon name="mail" className="h-6 w-6" /></span><span><strong className="block text-sm">Email us</strong><span className="mt-1 block text-sm text-muted-foreground">Send us an email and we&apos;ll get back to you</span></span><LocalIcon name="arrow-right" className="ml-auto h-4 w-4" /></a></section>

      <section className="pt-8"><h2 className="text-xl font-semibold">FAQ</h2><div className="mt-4 overflow-hidden rounded-xl border border-border">{questions.map(([question, answer]) => <details key={question} className="group border-b border-border last:border-b-0"><summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span>{question}</span><LocalIcon name="chevron-down" className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div></section>
    </section>
  )
}
