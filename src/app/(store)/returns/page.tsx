import type { Metadata } from 'next'

import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Returns Made Simple',
  'Boilabin accepts seven-day returns for defective or damaged items. Learn what is covered, what proof is needed, and how refunds or replacements are handled.',
  '/returns',
)

const summary = [
  ['calendar-days', 'Return window', '7 days from delivery'],
  ['shield', 'What is covered', 'Defective items and delivery damage'],
  ['refresh-ccw', 'Resolution', 'Refund or replacement'],
] as const satisfies ReadonlyArray<readonly [StorefrontIconName, string, string]>

const returnable = [
  'Items that are defective or do not work as intended',
  'Items that arrived damaged due to delivery',
  'Items with missing parts or accessories',
]

const excluded = [
  'Change of mind or preference',
  'Items damaged after delivery',
  'Items that have been used or washed',
  'Sale or clearance items unless defective',
]

const steps = [
  ['receipt-text', 'Check eligibility', 'Confirm your item is within the 7-day return window and meets our return criteria.'],
  ['package', 'Submit request', 'Contact us with your order number, item details, and photos of the issue if applicable.'],
  ['search', 'Review', 'We review your request and confirm whether your return is approved.'],
  ['truck', 'Return & inspection', 'Send the item back as instructed. We inspect it to verify the reported issue.'],
  ['refresh-ccw', 'Resolution', 'We issue a refund or send a replacement once inspection is complete.'],
] as const satisfies ReadonlyArray<readonly [StorefrontIconName, string, string]>

const RETURN_QUESTIONS = [
  ['Which items can I return?', 'You can request a return for defective items, items damaged during delivery, or items with missing parts or accessories.'],
  ['How long do I have to request a return?', 'Please contact support within 7 days of delivery.'],
  ['What proof do I need for a return?', 'Send your order number, a clear description of the issue, and photos when they help show the damage or defect.'],
  ['Will I receive a refund or replacement?', 'After the return is reviewed and inspected, we will arrange the applicable refund or replacement.'],
] as const

function PolicyList({ title, items, positive }: { title: string; items: readonly string[]; positive: boolean }) {
  const icon = positive ? 'check-circle' : 'x'
  return (
    <section>
      <h2 className="flex items-center gap-3 text-lg font-semibold"><LocalIcon name={icon} className={positive ? 'h-5 w-5 text-green-600' : 'h-5 w-5 text-red-500'} />{title}</h2>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => <li key={item} className="flex gap-3 py-3 text-sm text-muted-foreground"><LocalIcon name={icon} className={positive ? 'h-4 w-4 text-green-600' : 'h-4 w-4 text-red-500'} />{item}</li>)}
      </ul>
    </section>
  )
}

export default function ReturnsPage() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd data={[generateWebPageJsonLd({ name: 'Boilabin Returns Made Simple', description: 'Seven-day returns for defective or damaged items.', path: '/returns' }), generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Returns', url: '/returns' }])]} />
      <div className="container-site py-7 sm:py-9 lg:py-10">
        <p className="text-sm text-muted-foreground">Help Center <span className="mx-2">/</span> <span className="font-medium text-foreground">Returns</span></p>
        <section className="mt-4 grid gap-7 border-b border-border pb-7 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,1.25fr)] lg:items-center">
          <div><h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Returns</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">We want you to be happy with your order. If something is wrong, we offer a 7-day return window for defective items or items damaged during delivery.</p></div>
          <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {summary.map(([icon, title, copy]) => <div key={title} className="flex gap-3 py-4 sm:px-4 sm:py-2"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary"><LocalIcon name={icon} className="h-5 w-5" /></span><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{copy}</span></span></div>)}
          </div>
        </section>
        <section className="grid gap-10 py-8 lg:grid-cols-2 lg:gap-16"><PolicyList title="What you can return" items={returnable} positive /><PolicyList title="What is not covered" items={excluded} positive={false} /></section>
        <section className="py-8"><h2 className="text-xl font-semibold">How it works</h2><ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">{steps.map(([icon, title, copy], index) => <li key={title} className="relative text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-primary">{index + 1}</span><span className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary"><LocalIcon name={icon} className="h-6 w-6" /></span><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-48 text-xs leading-5 text-muted-foreground">{copy}</p></li>)}</ol></section>
        <div className="mt-2"><SupportFaqList questions={RETURN_QUESTIONS} heading="Returns FAQ" /></div>
        <div className="mt-7"><SupportContactBar title="Need help with a return?" description="Our support team can help with your return request." /></div>
      </div>
    </main>
  )
}
