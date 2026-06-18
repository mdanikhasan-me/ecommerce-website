'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_URL } from '@/shared/contact'

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' }

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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-6">
        <div className="space-y-3.5 lg:space-y-4">
          <ContactMethod
            icon="whatsapp"
            title="Message us on WhatsApp"
            value="We typically reply within a few minutes."
            href={WHATSAPP_URL}
            actionLabel="Message now"
            featured
          />
          <ContactMethod
            icon="phone"
            title="Call us"
            value={CONTACT_PHONE}
            detail="Mon - Sat, 9am to 6pm"
            href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`}
            actionLabel="Call now"
          />
          <ContactMethod
            icon="mail"
            title="Email us"
            value={CONTACT_EMAIL}
            detail="Send your order details or question."
            href={`mailto:${CONTACT_EMAIL}`}
            actionLabel="Email us"
          />
        </div>

        <div className="space-y-5 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Store information</p>
          <ContactMethod icon="map-pin" title="Office" value={CONTACT_ADDRESS} />
          <ContactMethod
            icon="clock"
            title="Support Hours"
            value="Saturday to Thursday: 9am to 9pm"
            detail="Friday: 2pm to 9pm"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6 lg:min-h-[35.5rem] lg:p-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">Your Name</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Arif Rahman"
              required
              className="input-base h-12 rounded-md bg-background"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              required
              className="input-base h-12 rounded-md bg-background"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium">Subject</label>
          <select
            id="contact-subject"
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            required
            className="input-base h-12 rounded-md bg-background"
          >
            <option value="">Select a subject</option>
            <option>Order Issue</option>
            <option>Return Request</option>
            <option>Product Query</option>
            <option>Payment Issue</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            placeholder="Describe your issue or question..."
            rows={5}
            required
            className="input-base min-h-[12.5rem] resize-none rounded-md bg-background"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border border-transparent bg-[hsl(270_18%_8%)] px-5 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50 md:transition-colors md:hover:bg-[hsl(270_16%_12%)]"
        >
          <LocalIcon name="send" className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

function ContactMethod({
  icon,
  title,
  value,
  detail,
  href,
  actionLabel,
  featured = false,
}: {
  icon: StorefrontIconName
  title: string
  value: string
  detail?: string
  href?: string
  actionLabel?: string
  featured?: boolean
}) {
  const cardClassName = 'border-border bg-card'
  const textContent = (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-semibold text-foreground sm:text-base">{title}</p>
        {featured ? (
          <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium leading-4 text-muted-foreground sm:text-[11px]">
            Recommended
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{value}</p>
      {detail && <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">{detail}</p>}
    </div>
  )
  const iconContent = (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground sm:h-9 sm:w-9 sm:rounded-xl sm:bg-secondary/80 lg:h-14 lg:w-14">
      <LocalIcon name={icon} className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
    </div>
  )
  const actionContent = actionLabel ? (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-10 md:min-w-[9.25rem] md:justify-center md:rounded-[4px] md:border md:border-foreground/35 md:bg-transparent md:px-5 md:transition-colors md:hover:bg-secondary md:hover:text-foreground"
    >
      {actionLabel}
      <LocalIcon name="arrow-right" className="h-3.5 w-3.5" />
    </a>
  ) : null

  if (href && actionContent) {
    return (
      <div className={`flex gap-4 rounded-lg border px-5 py-5 sm:items-center sm:rounded-xl sm:p-5 lg:min-h-[7.75rem] lg:gap-6 ${cardClassName}`}>
        <div className="shrink-0">
          {iconContent}
        </div>
        <div className="min-w-0 flex-1">
          {textContent}
          <div className="mt-4 md:hidden">
            {actionContent}
          </div>
        </div>
        <div className="hidden shrink-0 md:block">
          {actionContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4">
      {iconContent}
      {textContent}
    </div>
  )
}
