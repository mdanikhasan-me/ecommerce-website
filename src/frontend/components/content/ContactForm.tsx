'use client'

import { useState } from 'react'
import toast from '@/frontend/lib/toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_URL } from '@/shared/contact'

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' }
const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`

const CONTACT_ACTIONS = [
  {
    icon: 'whatsapp',
    title: 'Message us',
    value: 'WhatsApp support',
    detail: 'Fast help for orders, products, and returns.',
    href: WHATSAPP_URL,
    actionLabel: 'Message now',
  },
  {
    icon: 'phone',
    title: CONTACT_PHONE,
    value: 'Call support',
    detail: 'Saturday to Thursday, 9am to 9pm.',
    href: CONTACT_PHONE_HREF,
    actionLabel: 'Call now',
  },
  {
    icon: 'mail',
    title: CONTACT_EMAIL,
    value: 'Email support',
    detail: 'Send your order details or question.',
    href: `mailto:${CONTACT_EMAIL}`,
    actionLabel: 'Email us',
  },
] as const satisfies ReadonlyArray<{
  icon: StorefrontIconName
  title: string
  value: string
  detail: string
  href: string
  actionLabel: string
}>

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not send message'
}

export function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(data.error || 'Could not send message')

      toast.success("Message sent! We'll review it and follow up.")
      setForm(INITIAL_FORM)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-10 space-y-12 sm:mt-12 lg:mt-14 lg:space-y-16">
      <section aria-label="Contact options" className="grid gap-6 sm:grid-cols-3">
        {CONTACT_ACTIONS.map((item) => (
          <ContactActionCard key={item.actionLabel} {...item} />
        ))}
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[0.45rem] border border-[#e5e7eb] bg-white px-6 py-12 sm:px-10 lg:px-16 lg:py-20"
      >
        <div className="mx-auto max-w-[49rem] text-center">
          <h2 className="font-display text-[2rem] font-medium leading-tight text-[#20232d] sm:text-[2.4rem]">
            Send Us
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#4b5563] sm:text-[15px]">
            Have a question or need help? We are just a message away.
          </p>
          <div className="mx-auto mt-10 h-px max-w-[42rem] bg-[#e5e7eb]" />
        </div>

        <div className="mx-auto mt-10 grid max-w-[49rem] gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2.5 block text-sm font-medium text-[#374151]">Your name *</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
              className="h-12 w-full rounded-[0.18rem] border border-transparent bg-[#f4f5f8] px-4 text-[15px] text-[#111827] outline-none focus:border-[#cfd4dc]"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2.5 block text-sm font-medium text-[#374151]">Your email *</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
              className="h-12 w-full rounded-[0.18rem] border border-transparent bg-[#f4f5f8] px-4 text-[15px] text-[#111827] outline-none focus:border-[#cfd4dc]"
            />
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-[49rem]">
          <label htmlFor="contact-subject" className="mb-2.5 block text-sm font-medium text-[#374151]">Subject *</label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            required
            className="h-12 w-full rounded-[0.18rem] border border-transparent bg-[#f4f5f8] px-4 text-[15px] text-[#111827] outline-none focus:border-[#cfd4dc]"
          >
            <option value="">Select a subject</option>
            <option>Order Issue</option>
            <option>Return Request</option>
            <option>Product Query</option>
            <option>Payment Issue</option>
            <option>Other</option>
          </select>
        </div>

        <div className="mx-auto mt-5 max-w-[49rem]">
          <label htmlFor="contact-message" className="mb-2.5 block text-sm font-medium text-[#374151]">Your message</label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            rows={5}
            required
            className="min-h-[10.5rem] w-full resize-none rounded-[0.18rem] border border-transparent bg-[#f4f5f8] px-4 py-3.5 text-[15px] text-[#111827] outline-none focus:border-[#cfd4dc]"
          />
        </div>

        <div className="mx-auto max-w-[49rem]">
          <button
            type="submit"
            disabled={sending}
            className="mt-6 inline-flex h-12 min-w-[10.5rem] items-center justify-center gap-2 rounded-[0.18rem] bg-[#064e3b] px-6 text-[15px] font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
          >
            <LocalIcon name="send" className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>

      <section aria-label="Support information" className="grid gap-6 sm:grid-cols-2">
        <ContactInfoBlock
          icon="clock"
          title="Support Hours"
          primary="Saturday to Thursday: 9am to 9pm"
          secondary="Friday: 2pm to 9pm"
        />
        <ContactInfoBlock
          icon="map-pin"
          title="Our Location"
          primary={CONTACT_ADDRESS}
          secondary="Visit or contact us for order and product support."
        />
      </section>
    </div>
  )
}

function ContactActionCard({
  icon,
  title,
  value,
  detail,
  href,
  actionLabel,
}: {
  icon: StorefrontIconName
  title: string
  value: string
  detail: string
  href: string
  actionLabel: string
}) {
  return (
    <article className="grid min-h-[17.5rem] grid-rows-[auto_auto_auto_auto_1fr_auto] justify-items-center rounded-[0.35rem] border border-[#e5e7eb] bg-[#f4f5f8] px-6 py-8 text-center">
      <LocalIcon name={icon} className="h-9 w-9 text-[#111827]" />
      <h2 className="mt-6 text-base font-semibold leading-6 text-[#111827]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#111827]">{value}</p>
      <p className="mt-1 max-w-[14.5rem] text-sm leading-6 text-[#4b5563]">{detail}</p>
      <span aria-hidden="true" />
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="mt-6 inline-flex h-10 min-w-[9.5rem] items-center justify-center rounded-[0.18rem] border border-[#064e3b] px-5 text-sm font-semibold text-[#064e3b] outline-none"
      >
        {actionLabel}
      </a>
    </article>
  )
}

function ContactInfoBlock({
  icon,
  title,
  primary,
  secondary,
}: {
  icon: StorefrontIconName
  title: string
  primary: string
  secondary: string
}) {
  return (
    <article className="flex items-start gap-5 bg-white py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4f5f8] text-[#111827]">
        <LocalIcon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
        <p className="mt-1.5 text-[15px] leading-6 text-[#374151]">{primary}</p>
        <p className="text-sm leading-6 text-[#6b7280]">{secondary}</p>
      </div>
    </article>
  )
}
