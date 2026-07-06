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
  'Boilabin Help Articles',
  'Browse Boilabin help articles for orders, delivery, returns, payments, account support, products, and discount codes.',
  '/articles',
)

type ArticleItem = {
  title: string
  summary: string
}

type ArticleGroup = {
  id: string
  title: string
  description: string
  icon: StorefrontIconName
  articles: ArticleItem[]
}

const ARTICLE_GROUPS: ArticleGroup[] = [
  {
    id: 'orders-tracking',
    title: 'Orders & Tracking',
    description: 'Order status, tracking, changes and cancellations.',
    icon: 'package',
    articles: [
      {
        title: 'How do I track my order?',
        summary: 'Open Track Order with your order number, or sign in and go to My Account, then Orders, to see the latest status.',
      },
      {
        title: 'Can I change or cancel my order?',
        summary: 'Contact support as soon as possible with your order number. We can usually help before the order is packed for delivery.',
      },
      {
        title: 'What should I do if my order is delayed or missing?',
        summary: 'Check your order status first. If the delivery looks delayed, contact support so we can review the order and delivery update.',
      },
    ],
  },
  {
    id: 'delivery-fees',
    title: 'Delivery & Fees',
    description: 'Delivery timing, coverage, fees and delivery expectations.',
    icon: 'truck',
    articles: [
      {
        title: 'How long does delivery take?',
        summary: 'Delivery timing depends on your address and product availability. Orders inside Dhaka usually arrive faster than outside Dhaka.',
      },
      {
        title: 'How much is the delivery fee?',
        summary: 'Delivery fees are shown before checkout confirmation. Orders over the free-delivery threshold can qualify for free delivery.',
      },
      {
        title: 'Where do you deliver?',
        summary: 'Boilabin is built for customers in Bangladesh. Delivery availability and timing can vary by address and product availability.',
      },
    ],
  },
  {
    id: 'returns-refunds',
    title: 'Returns & Refunds',
    description: 'Return eligibility, return requests and refund steps.',
    icon: 'refresh-ccw',
    articles: [
      {
        title: 'What is your return policy?',
        summary: 'Return requests are reviewed against the return policy. Report damaged, defective, or wrong items quickly with clear proof.',
      },
      {
        title: 'How do I request a return?',
        summary: 'Open your order details when available, or contact support with your order number and clear photos or video of the issue.',
      },
      {
        title: 'When will I get my refund?',
        summary: 'After the return is reviewed and approved, support will confirm the refund or replacement process for your order.',
      },
    ],
  },
  {
    id: 'payments-cod',
    title: 'Payments & COD',
    description: 'Cash on delivery, order confirmation and payment questions.',
    icon: 'credit-card',
    articles: [
      {
        title: 'What payment methods do you accept?',
        summary: 'Boilabin currently supports cash on delivery. If online payment becomes available, it will appear during checkout.',
      },
      {
        title: 'Do I get an order confirmation?',
        summary: 'Yes. After checkout, Boilabin creates a confirmation with the order items, delivery address, and total amount.',
      },
      {
        title: 'Will you add online payment?',
        summary: 'Online payment will be added only when it is ready. Until then, cash on delivery is the active checkout payment method.',
      },
    ],
  },
  {
    id: 'account-address',
    title: 'Account & Address',
    description: 'Profile, address, sign-in and account support.',
    icon: 'user',
    articles: [
      {
        title: 'How do I add or change my delivery address?',
        summary: 'Go to My Account and update your address details, or contact support before the order is packed if the address needs correction.',
      },
      {
        title: 'How can I update my account information?',
        summary: 'Go to My Account to review profile details, orders, wishlist, and address information linked to your account.',
      },
      {
        title: 'Can I shop without an account?',
        summary: 'You can browse products freely, but checkout requires an account so orders, addresses, and support requests can be tracked.',
      },
    ],
  },
  {
    id: 'products-stock',
    title: 'Products & Stock',
    description: 'Product details, variants, stock status and product care.',
    icon: 'shopping-bag',
    articles: [
      {
        title: 'Where can I check product details?',
        summary: 'Each product page includes images, price, stock status, variants when available, and the current product information.',
      },
      {
        title: 'How do I know if an item is in stock?',
        summary: 'The product card and product page show the current stock state, including in stock, low stock, pre-order, or out of stock.',
      },
      {
        title: 'How do I use a discount code?',
        summary: 'Enter a valid discount code during checkout. If the code is eligible, the discount will apply before you place the order.',
      },
    ],
  },
]

export default function ArticlesPage() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Help Articles',
            description: 'Browse Boilabin help articles for orders, delivery, returns, payments, account support, products, and discount codes.',
            path: '/articles',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Help Center', url: '/help' },
            { name: 'Articles', url: '/articles' },
          ]),
        ]}
      />

      <div className="container-site py-10 sm:py-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Help Articles</p>
          <h1 className="mt-3 font-display text-[2.4rem] font-bold leading-none tracking-normal sm:text-5xl">
            All help articles
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
            Clear answers for orders, delivery, returns, payments, account settings, and product questions.
          </p>
        </div>

        <div className="mt-9 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-2" aria-label="Help article topics">
              {ARTICLE_GROUPS.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {group.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            {ARTICLE_GROUPS.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <div className="grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)]">
                  <LocalIcon name={group.icon} className="h-6 w-6 text-foreground" />
                  <div>
                    <h2 className="font-display text-2xl font-semibold leading-8">{group.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-border bg-white">
                  {group.articles.map((article) => (
                    <article key={article.title} className="border-b border-border px-5 py-5 last:border-b-0 sm:px-6">
                      <h3 className="text-base font-semibold leading-6 text-foreground">{article.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{article.summary}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-lg bg-[#f5f5f2] p-6 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold leading-6">Need a direct answer?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Contact support and include your order number if your question is order-specific.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 text-sm font-semibold text-background focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Contact support
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-6 text-sm font-semibold text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <LocalIcon name="mail" className="h-4 w-4" />
                Email us
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
