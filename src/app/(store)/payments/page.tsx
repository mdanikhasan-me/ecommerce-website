import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd, generateBreadcrumbJsonLd, generatePageMetadata, generateWebPageJsonLd } from '@/backend/seo'
import { CONTACT_EMAIL } from '@/shared/contact'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Payment Information',
  'Learn about Boilabin payment methods, payment confirmation, and checkout safety.',
  '/payments',
)

const PAYMENT_METHODS = [
  ['Cash on Delivery', 'Pay when your order is delivered.', '05-cash-on-delivery.webp', 'Available at checkout'],
  ['bKash', 'Mobile payment when it becomes available.', '06-bkash.webp', 'Not active yet'],
  ['Nagad', 'Mobile payment when it becomes available.', '07-nagad.webp', 'Not active yet'],
  ['Bank Transfer', 'Transfer directly when it becomes available.', '08-bank-transfer.webp', 'Not active yet'],
  ['Cards', 'Debit and credit cards when available.', '09-cards.webp', 'Not active yet'],
] as const

const PAYMENT_STEPS: ReadonlyArray<{ icon: StorefrontIconName; title: string; copy: string; tone: string }> = [
  { icon: 'clock', title: 'When you pay', copy: 'Cash on Delivery is paid when your order arrives.', tone: 'bg-slate-100' },
  { icon: 'check-circle', title: 'Order confirmation', copy: 'You receive confirmation as soon as your order is placed.', tone: 'bg-emerald-50' },
  { icon: 'shield', title: 'Payment safety', copy: 'Review the final total before paying at delivery.', tone: 'bg-blue-50' },
]

export default function PaymentsPage() {
  return (
    <main className="container-site py-7 sm:py-9 lg:py-10">
      <JsonLd
        data={[
          generateWebPageJsonLd({ name: 'Boilabin Payment Information', description: 'Learn about Boilabin payment methods, payment confirmation, and checkout safety.', path: '/payments' }),
          generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Payment', url: '/payments' }]),
        ]}
      />

      <header className="max-w-2xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <Link href="/help">Help Center</Link><LocalIcon name="chevron-right" className="h-3.5 w-3.5" /><span className="text-foreground">Payment</span>
        </nav>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] font-bold tracking-[-0.045em]">Payment</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Boilabin offers secure, clear checkout options. Available methods are always shown before you place an order.</p>
      </header>

      <section className="mt-8 border-y border-border py-5 sm:mt-10 sm:py-6">
        <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">Payment methods</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {PAYMENT_METHODS.map(([title, copy, asset, status]) => (
            <article key={title} className="min-w-0 text-center lg:border-r lg:border-border lg:px-5 last:lg:border-r-0">
              <div className="flex h-14 items-center justify-center">
                <Image src={`/assets/content/help/payment-delivery/${asset}`} alt="" width={96} height={56} className="h-14 w-auto object-contain" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
              <p className={`mt-2 text-[11px] font-semibold ${status === 'Available at checkout' ? 'text-emerald-700' : 'text-muted-foreground'}`}>{status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 sm:mt-10">
        <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">How payments work</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3 md:gap-8">
          {PAYMENT_STEPS.map((step) => (
            <article key={step.title} className="flex gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${step.tone}`}><LocalIcon name={step.icon} className="h-5 w-5" /></span>
              <div><h3 className="text-sm font-semibold">{step.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{step.copy}</p></div>
            </article>
          ))}
        </div>
        <p className="mt-6 flex gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground"><LocalIcon name="help-circle" className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />Available payment options may vary by order, location, and verification requirements.</p>
      </section>

      <section aria-label="Payment support" className="mt-6 grid divide-y divide-border rounded-md border border-border bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
        <Link href="/faq" className="flex items-center gap-3 p-4"><LocalIcon name="receipt-text" className="h-6 w-6 text-indigo-700" /><span className="min-w-0 flex-1"><strong className="block text-sm">Payment FAQ</strong><span className="mt-1 block text-xs text-muted-foreground">Common payment questions.</span></span><LocalIcon name="arrow-right" className="h-4 w-4" /></Link>
        <Link href="/contact" className="flex items-center gap-3 p-4"><LocalIcon name="message-circle" className="h-6 w-6 text-emerald-700" /><span className="min-w-0 flex-1"><strong className="block text-sm">Chat with support</strong><span className="mt-1 block text-xs text-muted-foreground">Get help from our team.</span></span><LocalIcon name="arrow-right" className="h-4 w-4" /></Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 p-4"><LocalIcon name="mail" className="h-6 w-6 text-amber-700" /><span className="min-w-0 flex-1"><strong className="block text-sm">Email us</strong><span className="mt-1 block text-xs text-muted-foreground">{CONTACT_EMAIL}</span></span><LocalIcon name="arrow-right" className="h-4 w-4" /></a>
      </section>
    </main>
  )
}
