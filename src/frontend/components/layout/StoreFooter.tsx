import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Twitter,
} from 'lucide-react'

const TRUST_POINTS = [
  {
    icon: Truck,
    title: 'Fast delivery',
    copy: 'Flexible delivery options in major cities and same week coverage nationwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified sellers',
    copy: 'Carefully reviewed vendors, transparent policies, and safer checkout on every order.',
  },
  {
    icon: RefreshCcw,
    title: 'Easy returns',
    copy: 'Straightforward return windows and responsive support when something is not right.',
  },
  {
    icon: CreditCard,
    title: 'Flexible payments',
    copy: 'Cash on delivery, cards, bKash, and Nagad built into the same checkout flow.',
  },
]

const SHOP_LINKS = [
  ['Flash deals', '/deals'],
  ['New arrivals', '/new-arrivals'],
  ['Brands', '/brands'],
  ['Wishlist', '/wishlist'],
]

const SUPPORT_LINKS = [
  ['Help center', '/help'],
  ['Track order', '/track-order'],
  ['Returns', '/returns'],
  ['Contact', '/contact'],
]

const COMPANY_LINKS = [
  ['About', '/about'],
  ['Terms', '/terms'],
  ['Privacy', '/privacy'],
  ['Shipping', '/shipping'],
]

export function StoreFooter() {
  return (
    <footer className="mt-24 border-t border-foreground/10 bg-foreground text-background">
      <div className="container-site py-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <span className="eyebrow-chip border-white/10 bg-white/10 text-background">
                  Boilabin marketplace
                </span>
                <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-background md:text-4xl">
                  A more considered online shopping experience for Bangladesh.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-background/70">
                  We are building a storefront that feels reliable at every step: curated assortments,
                  verified sellers, cleaner discovery, and support that still feels human after checkout.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-background/75">
                <a href="mailto:hello@boilabin.com" className="inline-flex items-center gap-2 hover:text-background">
                  <Mail className="h-4 w-4" />
                  hello@boilabin.com
                </a>
                <a href="tel:+8801700000000" className="inline-flex items-center gap-2 hover:text-background">
                  <Phone className="h-4 w-4" />
                  +880 1700 000000
                </a>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['50k+', 'Monthly product views'],
                ['100%', 'Secure checkout flow'],
                ['7 days', 'Straightforward return support'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="font-display text-3xl text-background">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-background/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-primary">
                  <point.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-background">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-background/66">{point.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 xl:grid-cols-[1fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-background/45">Stay close</p>
            <div className="mt-4 flex items-center gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-background/70 transition-colors hover:text-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-background/62">
              Follow the latest launches, brand stories, and editorial picks as the storefront evolves.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-background/45">Shop</p>
            <div className="mt-4 space-y-3">
              {SHOP_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className="flex items-center justify-between text-sm text-background/72 transition-colors hover:text-background">
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-background/45">Support</p>
            <div className="mt-4 space-y-3">
              {SUPPORT_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-background/72 transition-colors hover:text-background">
                  {label}
                </Link>
              ))}
              {COMPANY_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-background/50 transition-colors hover:text-background">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-background/72">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              Join the list
            </div>
            <h3 className="mt-4 font-display text-2xl text-background">Get weekly product edits and launch alerts.</h3>
            <p className="mt-3 text-sm leading-6 text-background/62">
              Early deals, new brands, and small improvements to the experience delivered without the spam.
            </p>
            <form className="mt-5 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/8 px-4 py-3 text-sm text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button type="button" className="btn-primary shrink-0">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-4 text-xs text-background/48 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} Boilabin. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>Payments:</span>
            {['COD', 'bKash', 'Nagad', 'Visa', 'Mastercard'].map((method) => (
              <span key={method} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-background/66">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
