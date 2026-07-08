import Image from 'next/image'
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

const pageDescription = `Boilabin delivers across Bangladesh. Standard delivery is ${dhakaFee} inside Dhaka and ${outsideFee} outside Dhaka, with free standard delivery on orders over ${freeOver}.`

export const metadata: Metadata = generatePageMetadata(
  'Delivery Across Bangladesh',
  pageDescription,
  '/shipping',
)

const OPTIONS: ReadonlyArray<{
  iconSrc: string
  iconAlt: string
  title: string
  price: string
  note: string
  tone: string
}> = [
  {
    iconSrc: '/assets/shipping/icons/inside-dhaka-point-map.svg',
    iconAlt: 'Blue map location',
    title: 'Inside Dhaka',
    price: dhakaFee,
    note: 'Same-city delivery',
    tone: 'text-[#2f80ff]',
  },
  {
    iconSrc: '/assets/shipping/icons/outside-dhaka-point-map.svg',
    iconAlt: 'Gold map location',
    title: 'Outside Dhaka',
    price: outsideFee,
    note: 'All districts',
    tone: 'text-[#d69a22]',
  },
  {
    iconSrc: '/assets/shipping/icons/express-delivery.svg',
    iconAlt: 'Express delivery truck',
    title: 'Express delivery',
    price: 'By location',
    note: 'Where available',
    tone: 'text-[#6d5cf6]',
  },
  {
    iconSrc: '/assets/shipping/icons/free-standard-tag.svg',
    iconAlt: 'Green free delivery tag',
    title: 'Free standard delivery',
    price: `Free over ${freeOver}`,
    note: 'Automatically applied',
    tone: 'text-[#32945a]',
  },
] as const

const GOOD_TO_KNOW: ReadonlyArray<{ icon: StorefrontIconName; title: string; body: string }> = [
  {
    icon: 'clock',
    title: 'Delivery timing',
    body: 'Timing is an estimate and varies by address, item availability, holidays, and order volume.',
  },
  {
    icon: 'grid',
    title: 'Coverage',
    body: 'We deliver across Bangladesh, both inside Dhaka and to districts outside the city.',
  },
] as const

export default function ShippingPage() {
  return (
    <main className="container-site py-4 sm:py-6 lg:py-7">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Delivery Across Bangladesh',
            description: pageDescription,
            path: '/shipping',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Shipping', url: '/shipping' },
          ]),
        ]}
      />

      <section className="relative overflow-hidden rounded-xl bg-[#050505] px-4 py-6 text-white sm:px-7 sm:py-7 lg:px-10 lg:py-9">
        <div className="relative z-10 min-w-0 max-w-[15.4rem] pr-9 sm:max-w-[35rem] sm:pr-48 lg:max-w-[42rem] lg:pr-0">
          <h1 className="max-w-[12.5rem] font-display text-[1.62rem] font-bold leading-[1.04] tracking-tight sm:max-w-[34rem] sm:text-[3rem] lg:text-[3.45rem]">
            Delivery across Bangladesh
          </h1>
          <p className="mt-3 max-w-[15rem] text-[13px] leading-5 text-white/72 sm:mt-4 sm:max-w-[34rem] sm:text-base sm:leading-7">
            Standard delivery is {dhakaFee} inside Dhaka and {outsideFee} to other districts. Orders over {freeOver}{' '}
            ship free, and express delivery is available in some areas for a fee based on your location.
          </p>
          <div className="mt-10 w-fit sm:mt-12">
              <p className="pl-4 text-[13px] font-semibold text-white sm:pl-5 sm:text-sm">Need support?</p>
            <a
              href="/contact"
              className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-full bg-[#246bff] px-4 text-[13px] font-semibold text-white sm:min-h-10 sm:gap-3 sm:px-5 sm:text-sm"
            >
              Contact us
              <LocalIcon name="arrow-right" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute right-[-2.25rem] top-1/2 aspect-square w-[12.25rem] -translate-y-1/2 opacity-70 sm:right-7 sm:w-[17.5rem] sm:opacity-85 lg:right-14 lg:w-[24rem]">
          <Image
            src="/assets/shipping/bangladesh-delivery-map.webp"
            alt="Delivery route map across Bangladesh"
            fill
            priority
            sizes="(max-width: 639px) 12.25rem, (max-width: 1023px) 17.5rem, 24rem"
            className="object-contain"
          />
        </div>
      </section>

      <section id="delivery-options" className="mt-9 scroll-mt-24 sm:mt-11">
        <div>
          <h2 className="font-display text-[1.55rem] font-bold tracking-tight text-foreground sm:text-[1.85rem]">
            Delivery options
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Simple rates, clear coverage, no surprises.</p>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-card px-4 py-4 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {OPTIONS.map((option) => (
              <div
                key={option.title}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-3 xl:border-r xl:border-border xl:px-6 first:xl:pl-0 last:xl:border-r-0 last:xl:pr-0"
              >
                <span className="relative flex h-9 w-9 items-center justify-center">
                  <Image
                    src={option.iconSrc}
                    alt={option.iconAlt}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{option.title}</p>
                  <p className={`mt-0.5 text-sm font-bold ${option.tone}`}>{option.price}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{option.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-9 sm:mt-11">
        <div>
          <h2 className="font-display text-[1.55rem] font-bold tracking-tight text-foreground sm:text-[1.85rem]">
            Good to know
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">Helpful details before you place an order.</p>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-[#f7f7f5] px-4 py-4 sm:px-5">
          <div className="grid gap-4 md:grid-cols-2">
            {GOOD_TO_KNOW.map((note) => (
              <div key={note.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground">
                  <LocalIcon name={note.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{note.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{note.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3 border-t border-border pt-4 text-[#1e3766]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#276bff]">
              <LocalIcon name="help-circle" className="h-5 w-5" />
            </span>
            <p className="text-[13px] leading-5">
              Final delivery timing and fee are confirmed at checkout because they depend on address, holidays, order
              volume, and product availability.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
