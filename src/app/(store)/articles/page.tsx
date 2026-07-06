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

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Help Articles',
  'Browse detailed Boilabin help articles for orders, delivery, returns, payments, account support, products, and discount codes.',
  '/articles',
)

type ArticleQuestion = {
  question: string
  answer: string
}

type ArticleCategory = {
  id: string
  title: string
  description: string
  questions: ArticleQuestion[]
}

const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'orders-tracking',
    title: 'Orders & Tracking',
    description: 'Order status, order changes, cancellations, and delivery tracking.',
    questions: [
      {
        question: 'How do I track my order?',
        answer:
          'Use the Track Order page with your order number, or sign in and open My Account, then Orders. The order page shows the latest status we have, such as confirmed, processing, packed, shipped, or delivered. If the status has not changed for a while, contact support with your order number so we can check the delivery update.',
      },
      {
        question: 'Can I change or cancel my order?',
        answer:
          'Contact support as soon as possible after placing the order. We can usually change or cancel an order before it is packed for delivery. Once an order is packed or already handed to delivery, changes may not be possible, so send the order number and the exact change you need early.',
      },
      {
        question: 'What should I do if my order is delayed?',
        answer:
          'First check the order status from Track Order or My Account. Delivery can be delayed by address availability, holidays, high order volume, or item availability. If the expected delivery window has passed, send support your order number and phone number so we can review it and share the next update.',
      },
    ],
  },
  {
    id: 'delivery-fees',
    title: 'Delivery & Fees',
    description: 'Delivery time, location coverage, delivery charges, and free delivery.',
    questions: [
      {
        question: 'How long does delivery take?',
        answer:
          'Delivery timing depends on your address, product availability, and order volume. Dhaka orders are usually faster than outside-Dhaka orders. The final delivery estimate can vary during holidays, traffic disruptions, or high-volume periods. If an item has a special stock state such as pre-order or low stock, timing may also be different.',
      },
      {
        question: 'How much is the delivery fee?',
        answer:
          'The delivery fee is shown before checkout confirmation. Fees can vary based on the delivery area and order type. Orders above the free-delivery threshold may qualify for free standard delivery, but express delivery or special delivery handling may still have a separate charge where available.',
      },
      {
        question: 'Where does Boilabin deliver?',
        answer:
          'Boilabin is built for customers in Bangladesh. Delivery coverage includes Dhaka and outside-Dhaka areas where courier service is available. Some remote areas may need additional time, and support may contact you if the address needs clarification before dispatch.',
      },
    ],
  },
  {
    id: 'returns-refunds',
    title: 'Returns & Refunds',
    description: 'Return eligibility, proof requirements, refunds, and replacements.',
    questions: [
      {
        question: 'What is your return policy?',
        answer:
          'Return requests are reviewed against the return policy. If a product arrives defective, damaged during delivery, or different from what was ordered, contact support quickly with clear photos or video. Change-of-mind returns, used items, or requests without proof may not be accepted.',
      },
      {
        question: 'How do I request a return?',
        answer:
          'Open your order details if the return option is available, or contact support with your order number. Include photos or a short video that clearly shows the issue, the product, and the packaging. Support will review the request and explain whether the item is eligible for refund or replacement.',
      },
      {
        question: 'When will I get my refund?',
        answer:
          'Refund timing depends on return review and item inspection. After the request is approved and the returned item is checked, support will confirm the refund method or replacement. For cash-on-delivery orders, the refund method is arranged directly with you.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Cash on delivery, payment confirmation, failed orders, and future payment methods.',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'Boilabin currently supports cash on delivery. You place the order online and pay in cash when the order reaches you. If online payment is added later, it will appear as a checkout option only when it is fully ready and supported by the store.',
      },
      {
        question: 'Do I get an order confirmation?',
        answer:
          'Yes. After checkout, Boilabin creates an order confirmation with your items, delivery address, phone number, and total amount. Keep the order number because it helps support find the order quickly if you need tracking, cancellation, or delivery help.',
      },
      {
        question: 'Why is there no online payment option?',
        answer:
          'Online payment is not active yet. This keeps checkout simple while the store validates ordering, delivery, and support workflows. When online payment is ready, it will be added carefully so order confirmation, refunds, and payment verification stay reliable.',
      },
    ],
  },
  {
    id: 'account-address',
    title: 'Account & Address',
    description: 'Sign-in, profile details, delivery address, and account information.',
    questions: [
      {
        question: 'How do I add or change my delivery address?',
        answer:
          'Open My Account and update your address details. If you already placed an order, contact support before the order is packed. Once an order is packed or shipped, address changes may not be possible because the delivery information is already handed to the delivery process.',
      },
      {
        question: 'Can I shop without an account?',
        answer:
          'You can browse products without an account, but checkout requires an account so your orders, address, wishlist, and support history can be connected properly. This also helps us verify order details and provide support faster.',
      },
      {
        question: 'How can I update my account information?',
        answer:
          'Go to My Account to review your profile, order history, wishlist, and address information. If a detail cannot be changed from the account area, contact support from the email or phone number linked to your account so we can verify the request.',
      },
    ],
  },
  {
    id: 'products-stock',
    title: 'Products & Stock',
    description: 'Product details, variants, stock status, preorder, and wishlist behavior.',
    questions: [
      {
        question: 'Where can I check product details?',
        answer:
          'Each product page includes the product images, price, stock status, available variants, and details that are currently available. Check the product page before ordering, especially for items with sizes, storage variants, pre-order status, or low stock.',
      },
      {
        question: 'How do I know if an item is in stock?',
        answer:
          'Product cards and product pages show the current stock state. In Stock means the item can be added to cart. Low stock means only a few units are left. Pre-order means the product can be reserved before normal availability. Out of Stock means it cannot be added to cart right now.',
      },
      {
        question: 'How do I use a discount code?',
        answer:
          'Enter a valid discount code during checkout. If the code is active and your order meets its conditions, the discount will apply before you place the order. Some codes may be limited by product, category, date, order value, or usage count.',
      },
    ],
  },
]

function QuestionItem({ item }: { item: ArticleQuestion }) {
  return (
    <details className="group border-b border-border last:border-b-0">
      <summary className="grid min-h-[3.9rem] cursor-pointer list-none grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-4 px-5 text-sm font-semibold text-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring [&::-webkit-details-marker]:hidden sm:px-6">
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

export default function ArticlesPage() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Help Articles',
            description: 'Browse detailed Boilabin help articles for orders, delivery, returns, payments, account support, products, and discount codes.',
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
        <header className="max-w-3xl">
          <h1 className="mt-3 font-display text-[2.4rem] font-bold leading-none tracking-normal sm:text-5xl">
            Support articles
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
            Detailed answers grouped by the common questions customers ask before and after ordering.
          </p>
        </header>

        <div className="mt-10 space-y-12">
          {ARTICLE_CATEGORIES.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="max-w-3xl">
                <h2 className="font-display text-2xl font-semibold leading-8">{category.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-border bg-white">
                {category.questions.map((question) => (
                  <QuestionItem
                    key={question.question}
                    item={question}
                  />
                ))}
              </div>
            </section>
          ))}
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
