import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { siteConfig } from '@/backend/config/site'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const dhakaFee = `Tk ${siteConfig.shipping.dhakaFee}`
const outsideFee = `Tk ${siteConfig.shipping.outsideDhakaFee}`
const freeOver = `Tk ${siteConfig.shipping.freeShippingMin.toLocaleString('en-BD')}`

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Shipping Information',
  `Boilabin delivers across Bangladesh. Standard delivery is ${dhakaFee} inside Dhaka and ${outsideFee} outside Dhaka, with free standard delivery on orders over ${freeOver}.`,
  '/shipping',
)

const OPTIONS: { icon: StorefrontIconName; title: string; price: string; note: string }[] = [
  { icon: 'truck', title: 'Inside Dhaka', price: dhakaFee, note: 'Standard delivery within Dhaka city.' },
  { icon: 'map-pin', title: 'Outside Dhaka', price: outsideFee, note: 'Standard delivery to other districts in Bangladesh.' },
  { icon: 'package', title: 'Express delivery', price: 'By location', note: 'Faster delivery where available. The fee depends on your area.' },
  { icon: 'tag', title: 'Free standard delivery', price: 'Free', note: `Standard orders over ${freeOver}. Express delivery is not included.` },
]

const NOTES: { icon: StorefrontIconName; title: string; body: string }[] = [
  { icon: 'credit-card', title: 'Cash on delivery', body: 'Pay in cash when your order arrives. No online payment is required to place a standard order.' },
  { icon: 'clock', title: 'Delivery timing', body: 'Timing is an estimate and varies by address, item availability, holidays, and order volume.' },
  { icon: 'map-pin', title: 'Coverage', body: 'We deliver across Bangladesh, both inside Dhaka and to districts outside the city.' },
]

export default function ShippingPage() {
  return (
    <div className="container-site py-9 lg:py-14">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Shipping Information',
            description: `Boilabin delivers across Bangladesh. Standard delivery is ${dhakaFee} inside Dhaka and ${outsideFee} outside Dhaka, with free standard delivery on orders over ${freeOver}.`,
            path: '/shipping',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Shipping', url: '/shipping' },
          ]),
        ]}
      />
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shipping</p>
        <h1 className="mt-3 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.5rem]">
          Delivery across Bangladesh.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
          Standard delivery is {dhakaFee} inside Dhaka and {outsideFee} to other districts. Orders over {freeOver} ship
          free, and express delivery is available in some areas for a fee based on your location.
        </p>
      </header>

      <section className="mt-8 lg:mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Delivery options</h2>
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {OPTIONS.map((option) => (
            <div key={option.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                <LocalIcon name={option.icon} className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[13px] font-medium uppercase tracking-wide text-muted-foreground">{option.title}</p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{option.price}</p>
              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{option.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-9 lg:mt-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Good to know</h2>
        <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {NOTES.map((note) => (
            <div key={note.title} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                <LocalIcon name={note.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{note.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{note.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-xs leading-5 text-muted-foreground">
          Delivery times are estimates and may change with address, holidays, order volume, and product availability.
          The fee shown at checkout applies to your order.
        </p>
      </section>
    </div>
  )
}
