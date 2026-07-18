'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL } from '@/shared/contact'

const ORDER_ID_PATTERN = /^BLB-\d{6}$/

export function TrackOrderLookup({ initialError = null }: { initialError?: string | null }) {
  const [orderNumber, setOrderNumber] = useState('')
  const [lookupError, setLookupError] = useState(initialError)
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = orderNumber.trim()
    if (trimmed) {
      const normalizedOrderNumber = trimmed.toUpperCase()
      if (!ORDER_ID_PATTERN.test(normalizedOrderNumber)) {
        setLookupError('Enter a valid Order ID in the format BLB-123456.')
        return
      }
      setLookupError(null)
      router.push(`/account/orders/${encodeURIComponent(normalizedOrderNumber)}`)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[42rem] text-center" aria-labelledby="track-order-heading">
      <header>
        <h1
          id="track-order-heading"
          className="font-display text-[1.95rem] font-semibold leading-tight tracking-[-0.025em] text-[#111318] sm:text-[2.2rem] lg:text-[2.35rem]"
        >
          Track Your Order
        </h1>
        <p className="mx-auto mt-3 max-w-[37rem] text-sm leading-6 text-[#68707d] sm:text-[15px]">
          Enter your Order ID to check your latest order status and delivery progress.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-10 rounded-[0.6rem] border border-[#e4e7eb] bg-white p-5 text-left shadow-[0_2px_7px_rgba(15,23,42,0.07)] sm:mt-14 sm:p-7 lg:mt-[3.625rem]"
      >
        <label htmlFor="track-order-id" className="mb-3 block text-sm font-semibold text-[#17191f] sm:text-[15px]">
          Order ID
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem] sm:gap-2">
          <input
            id="track-order-id"
            aria-label="Order number"
            type="text"
            placeholder="e.g. BLB-482913"
            value={orderNumber}
            onChange={(event) => {
              setOrderNumber(event.target.value)
              if (lookupError) setLookupError(null)
            }}
            required
            maxLength={80}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="h-12 min-w-0 rounded-[0.35rem] border border-[#e1e4e8] bg-white px-4 text-[15px] text-[#111318] outline-none placeholder:text-[#9299a5] focus:border-[#aeb4bd]"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-[0.35rem] bg-[#111318] px-5 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#111318] focus-visible:ring-offset-2"
          >
            Track Order
          </button>
        </div>
        {lookupError ? (
          <p role="alert" className="mt-3 text-sm leading-5 text-red-600">
            {lookupError}
          </p>
        ) : null}
      </form>

      <section className="mx-auto mt-12 max-w-[31rem] sm:mt-16 lg:mt-[4.5rem]" aria-labelledby="track-order-support-heading">
        <h2 id="track-order-support-heading" className="text-base font-medium text-[#17191f]">
          Need help with your order?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#737b87]">
          Our support team can help with tracking and delivery questions.
        </p>
        <div className="mx-auto mt-5 grid max-w-[22rem] grid-cols-1 gap-3 min-[380px]:grid-cols-2">
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.35rem] border border-[#aeb4bd] bg-white px-4 text-sm font-medium text-[#17191f] outline-none focus-visible:ring-2 focus-visible:ring-[#111318] focus-visible:ring-offset-2"
          >
            <LocalIcon name="message-circle" className="h-[1.05rem] w-[1.05rem]" />
            Contact Support
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.35rem] border border-[#aeb4bd] bg-white px-4 text-sm font-medium text-[#17191f] outline-none focus-visible:ring-2 focus-visible:ring-[#111318] focus-visible:ring-offset-2"
          >
            <LocalIcon name="mail" className="h-[1.05rem] w-[1.05rem]" />
            Email Us
          </a>
        </div>
      </section>
    </section>
  )
}
