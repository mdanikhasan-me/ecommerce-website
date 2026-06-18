import type { Metadata } from 'next'
import Link from 'next/link'
import {
  generatePageMetadata,
  JsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'About Boilabin',
  'Boilabin is a Bangladesh marketplace for everyday products selected in hand, checked before listing, and backed by one accountable store.',
  '/about',
)

const HERO_IMAGE = '/assets/ui/about/about-hero-still-life.webp'

const INFO: { icon: StorefrontIconName; title: string; body: string }[] = [
  {
    icon: 'receipt-text',
    title: 'We handle it ourselves',
    body: "We get the actual product in our hands before it goes up. No relisting a supplier's photos and hoping it's fine. If we haven't seen it, it isn't on the site.",
  },
  {
    icon: 'credit-card',
    title: 'What it has to pass',
    body: "Every product faces the same questions. Does it last. Is the finish clean. Is it useful. Is the price fair for what you get. Miss any of those and it's out.",
  },
  {
    icon: 'truck',
    title: "If it's here, it's on us",
    body: "We picked it, so it's our name on it, not some seller you'll never reach again. When something's wrong, you come to us, and we answer for it.",
  },
]

const SECTIONS: { icon: StorefrontIconName; title: string; body: string }[] = [
  {
    icon: 'tag',
    title: 'Why we built it',
    body: "Shopping online in Bangladesh usually means one of two things. A pile of listings so big that finding something decent becomes its own job, or a fat discount on a price nobody was ever going to pay. And when the product turns out bad, everyone points at the seller. We started Boilabin to do the opposite of all three. Fewer products, honest prices, and one name responsible for what's on the shelf.",
  },
  {
    icon: 'heart',
    title: 'What you get',
    body: "You're choosing from things that already cleared the bar, so the question stops being whether a product is any good and becomes which one is right for you. You spend your time picking between solid options instead of dodging bad ones. That's the shelf we're building.",
  },
]

function AboutContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`container-site ${className}`}>{children}</div>
}

export default function AboutPage() {
  return (
    <div className="bg-background pb-5 lg:pb-0">
      <JsonLd
        data={[
          generateOrganizationJsonLd(),
          generateWebPageJsonLd({
            type: 'AboutPage',
            name: 'About Boilabin',
            description: 'Boilabin is a Bangladesh marketplace for everyday products selected in hand, checked before listing, and backed by one accountable store.',
            path: '/about',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]),
        ]}
      />

      <section className="about-hero" style={{ backgroundImage: `url("${HERO_IMAGE}")` }}>
        <AboutContainer className="about-hero-inner flex min-h-[inherit] items-center">
          <div className="about-hero-copy">
            <h1 className="font-display text-[1.75rem] font-bold leading-[1.04] tracking-normal text-foreground min-[390px]:text-[1.875rem] sm:text-[2.125rem] lg:text-[clamp(2.125rem,3vw,2.75rem)]">
              About Boilabin
            </h1>
            <p className="mt-3.5 max-w-[29rem] text-[0.84rem] leading-[1.62] text-muted-foreground sm:text-[0.9rem] sm:leading-[1.68] lg:text-[0.92rem]">
              Most products never make it onto Boilabin, and that&apos;s the whole point. We&apos;re a Bangladesh
              marketplace for everyday things, but we don&apos;t relist whatever a supplier can ship us. We get the
              product in hand, go through it, and put up only the ones worth your money. A shorter shelf, and nothing on
              it is there by accident.
            </p>
          </div>
        </AboutContainer>
      </section>

      <AboutContainer className="pt-6 sm:pt-7">
        <section className="overflow-hidden rounded-[1.1rem] border border-black/10 bg-card lg:rounded-xl">
          <div className="divide-y divide-black/10 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {INFO.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 px-[1.125rem] py-[1.05rem] sm:gap-5 sm:px-6 sm:py-[1.15rem] lg:gap-5 lg:px-7 lg:py-[1.35rem]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-secondary/50 text-foreground sm:h-10 sm:w-10 lg:h-9 lg:w-9">
                  <LocalIcon name={item.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[0.84rem] font-bold leading-tight text-foreground sm:text-[0.9rem] lg:text-[0.9rem]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[0.78rem] leading-[1.55] text-muted-foreground sm:text-[0.82rem] lg:text-[0.8rem]">
                    {item.body}
                  </p>
                </div>
                <LocalIcon name="chevron-right" className="h-4 w-4 shrink-0 text-foreground lg:hidden" />
              </div>
            ))}
          </div>
        </section>
      </AboutContainer>

      <AboutContainer className="pt-8 lg:pt-10">
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-0">
          {SECTIONS.map((section, index) => (
            <article
              key={section.title}
              className={`grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 gap-y-2 overflow-hidden sm:flex sm:gap-5 sm:overflow-visible md:gap-6 lg:gap-6 ${
                index === 1 ? 'lg:border-l lg:border-black/12 lg:pl-8 xl:pl-11' : 'lg:pr-8 xl:pr-11'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-secondary/55 text-foreground sm:h-10 sm:w-10 lg:h-9 lg:w-9">
                <LocalIcon name={section.icon} className="h-4 w-4" />
              </span>
              <div className="contents sm:block sm:min-w-0">
                <h2 className="self-center font-display text-[1.08rem] font-bold leading-tight tracking-normal text-foreground sm:text-[1.32rem] lg:text-[1.4rem]">
                  {section.title}
                </h2>
                <p className="col-span-2 mt-0 w-full min-w-0 max-w-full break-words text-[0.82rem] leading-[1.58] text-muted-foreground sm:mt-2 sm:text-[0.88rem] sm:leading-[1.64] lg:text-[0.88rem]">
                  {section.body}
                </p>
              </div>
            </article>
          ))}
        </section>
      </AboutContainer>

      <AboutContainer className="pt-6 lg:pt-8">
        <section className="hidden items-center gap-5 rounded-xl border border-black/10 bg-card px-6 py-[1.15rem] lg:flex lg:px-7">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-secondary/45 text-foreground">
            <LocalIcon name="shopping-bag" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.05rem] font-bold leading-tight tracking-normal text-foreground">
              See what made the cut.
            </h2>
            <p className="mt-1 text-[0.8rem] leading-5 text-muted-foreground">
              Every category is a short list. Start anywhere.
            </p>
          </div>
          <Link
            href="/category"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-[0.8rem] font-bold text-background transition-colors md:hover:bg-foreground/90"
          >
            Browse categories
            <LocalIcon name="chevron-right" className="h-4 w-4" />
          </Link>
        </section>

        <Link
          href="/category"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-[0.9rem] font-bold text-background transition-colors md:hover:bg-foreground/90 lg:hidden"
        >
          Browse categories
          <LocalIcon name="chevron-right" className="h-4 w-4" />
        </Link>
      </AboutContainer>
    </div>
  )
}
