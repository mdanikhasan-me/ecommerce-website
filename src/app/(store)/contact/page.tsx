'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not send message')
      toast.success("Message sent! We'll reply within 24 hours.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      toast.error(err.message || 'Could not send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Contact Us</h1>
          <p className="text-muted-foreground">We&apos;re here to help. Reach out any time.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm text-muted-foreground">{CONTACT_PHONE}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Monday to Saturday, 9am to 6pm</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Office</p>
                <p className="text-sm text-muted-foreground">{CONTACT_ADDRESS}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Support Hours</p>
                <p className="text-sm text-muted-foreground">Saturday to Thursday: 9am to 9pm</p>
                <p className="text-sm text-muted-foreground">Friday: 2pm to 9pm</p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="font-semibold text-sm mb-1">Quick Response</p>
              <p className="text-sm text-muted-foreground">Most queries are answered within 2 hours during business hours. For urgent order issues, call us directly.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Name</label>
                <input aria-label="Form input" title="Form input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Arif Rahman" required className="input-base" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input aria-label="Form input" title="Form input" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required className="input-base" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subject</label>
              <select aria-label="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required className="input-base">
                <option value="">Select a subject</option>
                <option>Order Issue</option>
                <option>Return Request</option>
                <option>Product Query</option>
                <option>Payment Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea aria-label="Text area" title="Text area" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Describe your issue or question..." rows={5} required className="input-base resize-none" />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
