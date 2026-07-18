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

type PopularQuestion = {
  question: string
  answer: string
}

const HELP_TOPICS: HelpTopic[] = [
  {
    title: 'Track order',
    description: 'Track order status',
    href: '/track-order',
    icon: 'package',
  },
  {
    title: 'Delivery',
    description: 'Fees, timing and coverage',
    href: '/shipping',
    icon: 'truck',
  },
  {
    title: 'Returns',
    description: 'Return and refund policy',
    href: '/returns',
    icon: 'refresh-ccw',
  },
  {
    title: 'Payment',
    description: 'COD and payment help',
    href: '/payments',
    icon: 'credit-card',
  },
  {
    title: 'Account',
    description: 'Profile and address',
    href: '/account',
    icon: 'user',
  },
  {
    title: 'Products',
    description: 'Catalog and stock',
    href: '/category',
    icon: 'shopping-bag',
  },
]

const POPULAR_QUESTIONS: PopularQuestion[] = [
  {
    question: 'How do I track my order?',
    answer: 'Open Track Order with your order number, or sign in and go to My Account, then Orders, to see the latest status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Boilabin currently supports cash on delivery. If online payment becomes available, it will appear during checkout.',
  },
  {
    question: 'Can I change or cancel my order?',
    answer: 'Contact support as soon as possible with your order number. We can usually help before the order is packed for delivery.',
  },
  {
    question: 'What should I do if my order is delayed or missing?',
    answer: 'Check your order status first. If the delivery looks delayed, contact support so we can review the order and delivery update.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Return requests are reviewed against the return policy. Report damaged, defective, or wrong items quickly with clear proof.',
  },
  {
    question: 'How do I add or change my delivery address?',
    answer: 'Go to My Account and update your address details, or contact support before the order is packed if the address needs correction.',
  },
]

function TopicCard({ topic }: { topic: HelpTopic }) {
  return (
    <Link
      href={topic.href}
      className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full border border-[#dce5f0] bg-white/95 px-4 text-xs font-medium text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <LocalIcon name={topic.icon} className="h-4 w-4" />
      <span className="truncate">{topic.title}</span>
    </Link>
  )
}

function PopularQuestionItem({ item, defaultOpen }: { item: PopularQuestion; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-border last:border-b-0"
    >
      <summary className="grid min-h-[3.75rem] cursor-pointer list-none grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-4 px-5 text-sm font-semibold text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring [&::-webkit-details-marker]:hidden sm:px-6">
        <span className="min-w-0">{item.question}</span>
        <span className="text-center text-lg leading-none text-foreground/70 group-open:hidden">+</span>
        <span className="hidden text-center text-lg leading-none text-foreground/70 group-open:block">-</span>
      </summary>
      <p className="px-5 pb-5 pr-10 text-sm leading-6 text-muted-foreground sm:px-6 sm:pr-14">
        {item.answer}
      </p>
    </details>
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

      <section className="bg-[linear-gradient(135deg,#f9fbff_0%,#edf5ff_50%,#f8fbff_100%)]">
        <div className="container-site flex min-h-[22rem] flex-col items-center justify-center py-10 text-center sm:min-h-[25rem] sm:py-12 lg:min-h-[26rem]">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-[2rem]">
            How can we help you?
          </h1>
          <p className="mt-4 text-xs leading-5 text-muted-foreground sm:text-sm">
            Find helpful answers and resources for a smooth shopping experience.
          </p>

          <form action="/help" className="mt-8 grid h-12 w-full max-w-2xl grid-cols-[1fr_auto] overflow-hidden rounded-lg border border-[#d7e1ed] bg-white text-foreground focus-within:border-[#9ebdf1]">
            <label className="grid min-w-0 grid-cols-[1.125rem_minmax(0,1fr)] items-center gap-3 px-4" htmlFor="help-search">
              <LocalIcon name="search" className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
              <input
                id="help-search"
                name="q"
                type="search"
                placeholder="Search for help articles..."
                className="h-full min-w-0 appearance-none border-0 bg-transparent text-xs outline-none shadow-none ring-0 ring-offset-0 placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
              />
            </label>
            <button
              type="submit"
              className="m-1.5 min-w-[5.5rem] rounded-md bg-[#075df7] px-4 text-xs font-semibold text-white outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075df7] sm:min-w-24"
            >
              Search
            </button>
          </form>

          <nav aria-label="Help shortcuts" className="mt-8 flex w-full flex-wrap justify-center gap-2.5 sm:gap-3">
            {HELP_TOPICS.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </nav>
        </div>
      </section>

      <main className="container-site py-10 sm:py-12 lg:py-16">
        <section>
          <h2 className="font-display text-2xl font-semibold leading-8">Popular articles</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
            {POPULAR_QUESTIONS.map((item, index) => (
              <PopularQuestionItem key={item.question} item={item} defaultOpen={index === 0} />
            ))}
          </div>

          <div className="mt-7 flex justify-center">
            <Link
              href="/articles"
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
