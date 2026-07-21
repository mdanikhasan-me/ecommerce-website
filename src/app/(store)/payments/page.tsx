import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd, generateBreadcrumbJsonLd, generatePageMetadata, generateWebPageJsonLd } from '@/backend/seo'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Payment Information',
  'Learn about Boilabin payment methods, payment confirmation, and checkout safety.',
  '/payments',
)

const PAYMENT_METHODS = [
  ['Cash on Delivery', '05-cash-on-delivery.webp'],
  ['bKash', '06-bkash.webp'],
  ['Nagad', '07-nagad.webp'],
  ['Bank Transfer', '08-bank-transfer.webp'],
  ['Cards', '09-cards.webp'],
] as const

const PAYMENT_STEPS: ReadonlyArray<{ icon: StorefrontIconName; title: string; copy: string; tone: string }> = [
  { icon: 'clock', title: 'When you pay', copy: 'Cash on Delivery is paid when your order arrives.', tone: 'bg-slate-100' },
  { icon: 'check-circle', title: 'Order confirmation', copy: 'You receive confirmation as soon as your order is placed.', tone: 'bg-emerald-50' },
  { icon: 'shield', title: 'Payment safety', copy: 'Review the final total before paying at delivery.', tone: 'bg-blue-50' },
]

const PAYMENT_QUESTIONS = [
  ['Which payment methods are available?', 'Cash on Delivery is currently available. Any newly available method appears in checkout before you place an order.'],
  ['When do I pay for a Cash on Delivery order?', 'Pay the final confirmed order amount when your order is delivered.'],
  ['Where can I check my order total?', 'Checkout shows your item total, delivery fee, coupon discount, and final total before you place the order.'],
  ['What should I do if my total looks incorrect?', 'Do not complete payment. Contact support with your order number so we can review it.'],
] as const

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

      <section className="mt-8 py-5 sm:mt-10 sm:py-6">
        <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">Payment methods</h2>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
          {PAYMENT_METHODS.map(([title, asset]) => (
            <article key={title} className="min-w-0 text-center last:col-span-2 sm:last:col-span-1 lg:px-5">
              <div className="flex h-12 items-center justify-center sm:h-14">
                {/* Supplied payment marks stay direct to avoid a second lossy encode. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/content/help/payment-delivery/${asset}`} alt="" className="h-12 w-auto object-contain sm:h-14" />
              </div>
              <h3 className="mt-3 text-sm font-semibold sm:text-base">{title}</h3>
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

      <div className="mt-8 sm:mt-10"><SupportFaqList questions={PAYMENT_QUESTIONS} heading="Payment FAQ" /></div>
      <div className="mt-7"><SupportContactBar title="Need help with payment?" description="If your order total, delivery fee, or confirmation looks incorrect, contact support with your order number." /></div>
    </main>
  )
}
