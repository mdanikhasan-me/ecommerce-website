import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Mail, ShieldCheck, Sparkles, Truck } from 'lucide-react'

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string | null
}

const STORY_CARDS = [
  {
    href: '/deals',
    label: 'Merchandising story',
    title: 'Campaign moments should feel premium, not noisy.',
    copy: 'Use editorial blocks for offer led moments so promotions feel more curated and less crowded.',
    gradient: 'from-brand-700 via-brand-600 to-brand-500',
  },
  {
    href: '/new-arrivals',
    label: 'Fresh arrivals',
    title: 'Keep newness visible without turning the homepage into a carousel maze.',
    copy: 'A clearer hierarchy gives launches room to breathe and helps shoppers notice what is actually new.',
    gradient: 'from-foreground via-slate-900 to-slate-700',
  },
]

export function StoreCampaigns() {
  return (
    <section className="container-site py-8">
      <div className="grid gap-5 xl:grid-cols-[0.84fr_1.16fr]">
        <div className="surface-panel p-6 sm:p-8">
          <p className="section-kicker">Store story</p>
          <h2 className="section-title mt-3">The storefront now sells trust as much as it sells products.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Production ready commerce does not come from more sections. It comes from stronger hierarchy,
            cleaner campaign framing, and visible signals that the customer journey is safe and supported.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              ['Trusted checkout', 'Secure payment methods and clearer after purchase expectations.'],
              ['Editorial curation', 'Collections that read like selections instead of database dumps.'],
              ['Human support', 'Policies, returns, and help pages that feel reachable and real.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[24px] border border-border/70 bg-background/72 p-4">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {STORY_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative overflow-hidden rounded-[32px] bg-gradient-to-br ${card.gradient} p-6 text-white shadow-[0_24px_70px_rgba(17,24,39,0.18)] sm:p-8`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_36%)]" />
              <div className="relative flex h-full flex-col justify-between gap-16">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/68">{card.label}</p>
                  <h3 className="mt-4 font-display text-3xl leading-tight">{card.title}</h3>
                </div>
                <div>
                  <p className="max-w-sm text-sm leading-7 text-white/72">{card.copy}</p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition-all group-hover:gap-3">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BrandShowcase({ brands }: { brands: Brand[] }) {
  return (
    <section className="container-site py-8">
      <div className="surface-panel p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Featured brands</p>
            <h2 className="section-title mt-3">Authentic labels deserve a calmer, more premium stage.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Brand blocks should signal confidence. These tiles feel more like retail marquees and less like
              a utility grid, which helps the storefront feel closer to production polish.
            </p>
          </div>
          <Link href="/brands" className="inline-link">
            View all brands
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group rounded-[24px] border border-border/80 bg-background/65 p-4 transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_18px_40px_rgba(34,27,21,0.08)]"
            >
              <div className="flex aspect-square items-center justify-center rounded-[20px] bg-secondary/55">
                {brand.logo ? (
                  <div className="relative h-10 w-full">
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="120px" />
                  </div>
                ) : (
                  <span className="font-display text-lg text-foreground">{brand.name}</span>
                )}
              </div>
              <p className="mt-4 text-center text-sm font-medium text-foreground">{brand.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StoreNewsletter() {
  return (
    <section className="container-site py-8 pb-0">
      <div className="overflow-hidden rounded-[34px] bg-gradient-to-br from-foreground via-slate-900 to-brand-800 shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
              <Mail className="h-3.5 w-3.5 text-primary" />
              Newsletter
            </div>
            <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Stay close to every new launch, restock, and flash offer.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
              Instead of a small footer form, the newsletter becomes a proper closing statement: confident,
              brand aligned, and clearly worth subscribing to.
            </p>

            <form className="mt-8 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button type="button" className="btn-primary justify-center">
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: ShieldCheck, title: 'Secure checkout', copy: 'Clear payments and safer order confidence.' },
              { icon: Truck, title: 'Reliable delivery', copy: 'More visible shipping promises and follow through.' },
              { icon: BadgeCheck, title: 'Trusted experience', copy: 'Cleaner signals that the store is ready for real shoppers.' },
              { icon: Sparkles, title: 'Weekly curation', copy: 'New edits and polished collections every week.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-primary">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
