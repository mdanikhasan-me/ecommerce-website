'use client'

import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
      <div className="space-y-6">
        <ContactMethod icon={Mail} title="Email" value={CONTACT_EMAIL} />
        <ContactMethod
          icon={Phone}
          title="Phone"
          value={CONTACT_PHONE}
          detail="Monday to Saturday, 9am to 6pm"
        />
        <ContactMethod icon={MapPin} title="Office" value={CONTACT_ADDRESS} />
        <ContactMethod
          icon={Clock}
          title="Support Hours"
          value="Saturday to Thursday: 9am to 9pm"
          detail="Friday: 2pm to 9pm"
        />

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-1 text-sm font-semibold">Support notes</p>
          <p className="text-sm text-muted-foreground">
            For urgent order issues, call us directly during business hours or send the form with your order details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">Your Name</label>
            <input
              id="contact-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Arif Rahman"
              required
              className="input-base"
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
              className="input-base"
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
            className="input-base"
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
            className="input-base resize-none"
          />
        </div>
        <button type="submit" disabled={sending} className="btn-primary flex w-full items-center justify-center gap-2">
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}

function ContactMethod({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string
  detail?: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
        {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  )
}
