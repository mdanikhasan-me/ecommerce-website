import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd, generateBreadcrumbJsonLd, generatePageMetadata, generateWebPageJsonLd } from '@/backend/seo'
import { siteConfig } from '@/backend/config/site'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const dhakaFee = `Tk ${siteConfig.shipping.dhakaFee}`
const outsideFee = `Tk ${siteConfig.shipping.outsideDhakaFee}`
const freeOver = `Tk ${siteConfig.shipping.freeShippingMin.toLocaleString('en-BD')}`
const pageDescription = `Boilabin delivers across Bangladesh. Standard delivery is ${dhakaFee} inside Dhaka and ${outsideFee} outside Dhaka, with free standard delivery on orders over ${freeOver}.`

export const metadata: Metadata = generatePageMetadata('Delivery Across Bangladesh', pageDescription, '/shipping')

const OPTIONS = [
  ['Inside Dhaka', dhakaFee, 'Same-city delivery', '01-inside-dhaka.webp', 'text-blue-700'],
  ['Outside Dhaka', outsideFee, 'All districts', '02-outside-dhaka.webp', 'text-emerald-700'],
  ['Express delivery', 'By location', 'Where available', '03-express-delivery.webp', 'text-violet-700'],
  ['Free standard delivery', `Free over ${freeOver}`, 'Automatically applied', '04-free-standard-delivery.webp', 'text-green-700'],
] as const

const NOTES: ReadonlyArray<{ icon: StorefrontIconName; title: string; copy: string; tone: string }> = [
  { icon: 'clock', title: 'Delivery timing', copy: 'Orders are typically delivered within 2–5 business days.', tone: 'bg-blue-50' },
  { icon: 'map-pin', title: 'Delivery coverage', copy: 'We deliver to all districts across Bangladesh.', tone: 'bg-emerald-50' },
  { icon: 'credit-card', title: 'Final fees at checkout', copy: 'Delivery fees are calculated from your location and order details.', tone: 'bg-amber-50' },
]

export default function ShippingPage() {
  return (
    <main className="container-site py-7 sm:py-9 lg:py-10">
      <JsonLd data={[generateWebPageJsonLd({ name: 'Delivery Across Bangladesh', description: pageDescription, path: '/shipping' }), generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Delivery', url: '/shipping' }])]} />
      <header className="max-w-2xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"><Link href="/help">Help Center</Link><LocalIcon name="chevron-right" className="h-3.5 w-3.5" /><span className="text-foreground">Delivery</span></nav>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] font-bold tracking-[-0.045em]">Delivery</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">We offer reliable delivery across Bangladesh with flexible options to match your needs. Rates, coverage, and availability may vary by location.</p>
      </header>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4 lg:gap-4">
        {OPTIONS.map(([title, price, note, asset, tone]) => (
          <article key={title} className="rounded-lg bg-[#fafafa] px-4 pb-5 pt-4 text-center sm:px-5">
            <img src={`/assets/content/help/payment-delivery/${asset}`} alt="" width="230" height="150" decoding="async" className="mx-auto h-28 w-full object-contain sm:h-32" />
            <h2 className="mt-2 text-base font-semibold">{title}</h2><p className={`mt-2 text-sm font-bold ${tone}`}>{price}</p><p className="mt-1 text-sm text-muted-foreground">{note}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 border-t border-border pt-7 sm:mt-10 sm:pt-8">
        <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">What to know</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3 md:gap-8">
          {NOTES.map((note) => <article key={note.title} className="flex gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${note.tone}`}><LocalIcon name={note.icon} className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">{note.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{note.copy}</p></div></article>)}
        </div>
      </section>

      <div className="mt-7">
        <SupportContactBar title="Need help with delivery?" description="Our support team is here to help with delivery questions or special requests." />
      </div>
    </main>
  )
}
