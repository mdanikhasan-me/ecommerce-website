import Link from 'next/link'
import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { CONTACT_EMAIL } from '@/shared/contact'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Help Center',
  'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.',
  '/help',
)

type HelpTopic = {
  title: string
  description: string
  href: string
  icon: StorefrontIconName
}

const POPULAR_SEARCHES = [
  { label: 'track order', href: '/track-order' },
  { label: 'returns', href: '/returns' },
  { label: 'shipping', href: '/shipping' },
  { label: 'payment', href: '/faq' },
  { label: 'account', href: '/account' },
]

const HELP_TOPICS: HelpTopic[] = [
  {
    title: 'Orders & Tracking',
    description: 'Track, view or manage your orders',
    href: '/track-order',
    icon: 'package',
  },
  {
    title: 'Shipping & Delivery',
    description: 'Delivery times, costs and locations',
    href: '/shipping',
    icon: 'truck',
  },
  {
    title: 'Returns & Refunds',
    description: 'Return items and refund process',
    href: '/returns',
    icon: 'refresh-ccw',
  },
  {
    title: 'Payments',
    description: 'Payment methods and billing',
    href: '/faq',
    icon: 'credit-card',
  },
  {
    title: 'Account & Profile',
    description: 'Login, update and account settings',
    href: '/account',
    icon: 'user',
  },
  {
    title: 'Products',
    description: 'Product info, stock and care guides',
    href: '/category',
    icon: 'shopping-bag',
  },
]

const POPULAR_ARTICLES: HelpTopic[] = [
  {
    title: 'How do I track my order?',
    description: '',
    href: '/track-order',
    icon: 'package',
  },
  {
    title: 'What is your return policy?',
    description: '',
    href: '/returns',
    icon: 'refresh-ccw',
  },
  {
    title: 'How long does delivery take?',
    description: '',
    href: '/shipping',
    icon: 'truck',
  },
  {
    title: 'Which payment methods do you accept?',
    description: '',
    href: '/faq',
    icon: 'credit-card',
  },
  {
    title: 'How can I update my account information?',
    description: '',
    href: '/account/profile',
    icon: 'user',
  },
  {
    title: 'How do I use a discount code?',
    description: '',
    href: '/faq',
    icon: 'tag',
  },
]

function TopicCard({ topic }: { topic: HelpTopic }) {
  return (
    <Link
      href={topic.href}
      className="grid min-h-[4.85rem] grid-cols-[1.5rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-[1180px]:flex min-[1180px]:min-h-[10.35rem] min-[1180px]:flex-col min-[1180px]:items-stretch min-[1180px]:p-5"
    >
      <LocalIcon name={topic.icon} className="h-5 w-5 text-foreground min-[1180px]:h-6 min-[1180px]:w-6" />
      <div className="min-w-0 min-[1180px]:mt-7">
        <h3 className="text-sm font-semibold leading-5 text-foreground">{topic.title}</h3>
        <p className="hidden text-sm leading-6 text-muted-foreground min-[1180px]:mt-2 min-[1180px]:block min-[1180px]:max-w-[10rem]">
          {topic.description}
        </p>
      </div>
      <LocalIcon
        name="arrow-right"
        className="h-4 w-4 justify-self-end text-foreground min-[1180px]:mt-auto min-[1180px]:self-end"
      />
    </Link>
  )
}

function ArticleLink({ article }: { article: HelpTopic }) {
  return (
    <Link
      href={article.href}
      className="grid min-h-[4.15rem] grid-cols-[1.5rem_minmax(0,1fr)_1rem] items-center gap-4 border-b border-border px-5 text-sm font-medium text-foreground last:border-b-0 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:px-6"
    >
      <LocalIcon name={article.icon} className="h-5 w-5 text-foreground" />
      <span className="min-w-0">{article.title}</span>
      <LocalIcon name="chevron-right" className="h-4 w-4 text-foreground" />
    </Link>
  )
}

export default function HelpPage() {
  return (
    <div className="bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Help Center',
            description: 'Get help with Boilabin orders, returns, shipping, payments, account support, and contact options.',
            path: '/help',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Help Center', url: '/help' },
          ]),
        ]}
      />

      <section className="bg-[#111118] text-white">
        <div className="container-site flex min-h-[20rem] flex-col items-center justify-center py-12 text-center sm:min-h-[25rem]">
          <h1 className="font-display text-[2.6rem] font-bold leading-none tracking-normal sm:text-5xl">
            Help Center
          </h1>
          <p className="mt-5 max-w-[28rem] text-base leading-7 text-white/82 sm:text-lg">
            Find answers, guides and support for a smooth shopping experience.
          </p>

          <form action="/help" className="mt-9 grid w-full max-w-[36rem] grid-cols-[1fr_auto] overflow-hidden rounded-lg border border-white/25 bg-white text-foreground focus-within:border-white/45">
            <label className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-3 px-5" htmlFor="help-search">
              <LocalIcon name="search" className="h-5 w-5 text-muted-foreground" />
              <input
                id="help-search"
                name="q"
                type="search"
                placeholder="Search for help articles..."
                className="h-14 min-w-0 appearance-none border-0 bg-transparent text-sm outline-none shadow-none ring-0 ring-offset-0 placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </label>
            <button
              type="submit"
              className="m-1.5 rounded-md bg-foreground px-6 text-sm font-semibold text-background outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Search
            </button>
          </form>

          <p className="mt-5 text-sm leading-6 text-white/55">
            Popular searches:{' '}
            {POPULAR_SEARCHES.map((search, index) => (
              <span key={search.href}>
                <Link href={search.href} className="text-white/68">
                  {search.label}
                </Link>
                {index < POPULAR_SEARCHES.length - 1 ? ', ' : null}
              </span>
            ))}
          </p>
        </div>
      </section>

      <main className="container-site py-10 sm:py-12 lg:py-16">
        <section>
          <h2 className="font-display text-2xl font-semibold leading-8">Browse by topic</h2>
          <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2 md:grid-cols-3 min-[1180px]:grid-cols-6 min-[1180px]:gap-4">
            {HELP_TOPICS.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold leading-8">Popular articles</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
            {POPULAR_ARTICLES.map((article) => (
              <ArticleLink key={article.title} article={article} />
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              href="/faq"
              className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-border bg-white px-6 text-sm font-semibold text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              View all articles
              <LocalIcon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-lg bg-[#f5f5f2] p-6 sm:p-7 lg:p-8">
          <div className="grid gap-7 md:grid-cols-2 md:divide-x md:divide-border/70">
            <div className="flex min-h-[9.5rem] flex-col items-start md:pr-8">
              <h2 className="text-lg font-semibold leading-6">Need more help?</h2>
              <p className="mt-2 max-w-[18rem] text-sm leading-6 text-muted-foreground">
                Can&rsquo;t find what you&rsquo;re looking for? We&rsquo;re here for you.
              </p>
              <Link
                href="/contact"
                className="mt-auto inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Contact Support
              </Link>
            </div>

            <div className="flex min-h-[9.5rem] flex-col items-start border-t border-border/70 pt-7 md:border-t-0 md:pl-8 md:pt-0">
              <h2 className="text-lg font-semibold leading-6">Email us</h2>
              <p className="mt-2 max-w-[18rem] text-sm leading-6 text-muted-foreground">
                Send us an email and we&rsquo;ll get back to you soon.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-6 text-sm font-semibold text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <LocalIcon name="mail" className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
