import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Articles',
  'Read Boilabin shopping guides, store updates, and useful customer information.',
  '/articles',
)

type ArticleQuestion = {
  question: string
  answer: ReactNode
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
        answer: (
          <>
            Use the <ArticleTextLink href="/track-order">Track Order</ArticleTextLink> page with
            your order number, or sign in and open <ArticleTextLink href="/account">My Account</ArticleTextLink>,
            then Orders. The order page shows the latest status we have, such as confirmed,
            processing, packed, shipped, or delivered. If the status has not changed for a while,
            contact support with your order number so we can check the delivery update.
          </>
        ),
      },
      {
        question: 'Can I change or cancel my order?',
        answer: (
          <>
            <ArticleTextLink href="/contact">Contact support</ArticleTextLink> as soon as possible
            after placing the order. We can usually change or cancel an order before it is packed
            for delivery. Once an order is packed or already handed to delivery, changes may not be
            possible, so send the order number and the exact change you need early.
          </>
        ),
      },
      {
        question: 'What should I do if my order is delayed?',
        answer: (
          <>
            First check the order status from <ArticleTextLink href="/track-order">Track Order</ArticleTextLink>
            {' '}or <ArticleTextLink href="/account">My Account</ArticleTextLink>. Delivery can be
            delayed by address availability, holidays, high order volume, or item availability. If
            the expected delivery window has passed, send support your order number and phone
            number so we can review it and share the next update.
          </>
        ),
      },
      {
        question: 'Why does my order status not update immediately?',
        answer: (
          <>
            Some order updates depend on packing, dispatch, and courier handoff. The status may
            stay the same while the order is being prepared or while the delivery partner is
            processing it. If the status has not changed after the expected handling time,
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink> with your order
            number.
          </>
        ),
      },
      {
        question: 'What information should I keep after placing an order?',
        answer: (
          <>
            Keep your order number, phone number used at checkout, and delivery address details.
            These help support identify the order quickly. If you
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink>, include the
            product name and the issue you need help with so the team can respond faster.
          </>
        ),
      },
    ],
  },
  {
    id: 'checkout-cart',
    title: 'Checkout & Cart',
    description: 'Cart totals, checkout review, quantity changes, and order placement.',
    questions: [
      {
        question: 'Can I review my order before placing it?',
        answer: (
          <>
            Yes. <ArticleTextLink href="/cart">Your cart</ArticleTextLink> and checkout should show
            the products, quantities, delivery details, delivery fee when applicable, and final
            total before you place the order. Review the address and phone number carefully because
            those details are used for delivery and support follow-up.
          </>
        ),
      },
      {
        question: 'Why did my cart total change?',
        answer: (
          <>
            A <ArticleTextLink href="/cart">cart</ArticleTextLink> total can change if quantity
            changes, a product price updates, a discount no longer applies, or delivery fees are
            recalculated based on the address. The amount shown at the final checkout step is the
            amount you should use as the confirmed order total.
          </>
        ),
      },
      {
        question: 'What happens if an item sells out before checkout?',
        answer: (
          <>
            Stock can change while customers are browsing. If an item sells out before checkout, it
            may no longer be available to add to cart or place in an order. You can add sold-out
            products to <ArticleTextLink href="/wishlist">wishlist</ArticleTextLink> where available,
            then check back later when stock returns.
          </>
        ),
      },
      {
        question: 'Can I order more than one quantity of the same product?',
        answer: (
          <>
            Yes, if enough stock is available. Use the quantity selector on the product page or
            {' '}<ArticleTextLink href="/cart">cart</ArticleTextLink>. If stock is limited, the site may
            restrict the quantity so customers cannot order more units than the store can fulfill.
          </>
        ),
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
        answer: (
          <>
            Delivery timing depends on your address, product availability, and order volume. Dhaka
            orders are usually faster than outside-Dhaka orders. The final delivery estimate can
            vary during holidays, traffic disruptions, or high-volume periods. Read the
            {' '}<ArticleTextLink href="/shipping">delivery guide</ArticleTextLink> for the latest
            delivery expectations.
          </>
        ),
      },
      {
        question: 'How much is the delivery fee?',
        answer: (
          <>
            The delivery fee is shown before checkout confirmation. Fees can vary based on the
            delivery area and order type. Orders above the free-delivery threshold may qualify for
            free standard delivery, and the <ArticleTextLink href="/shipping">shipping page</ArticleTextLink>
            {' '}explains how delivery timing and charges are handled.
          </>
        ),
      },
      {
        question: 'Where does Boilabin deliver?',
        answer: (
          <>
            Boilabin is built for customers in Bangladesh. Delivery coverage includes Dhaka and
            outside-Dhaka areas where courier service is available. Some remote areas may need
            additional time, and <ArticleTextLink href="/contact">support</ArticleTextLink> may
            contact you if the address needs clarification before dispatch.
          </>
        ),
      },
      {
        question: 'Can I choose express delivery?',
        answer: (
          <>
            Express delivery may be available only for selected locations and order conditions. If
            express delivery is available for your address, it should appear during checkout or be
            confirmed by <ArticleTextLink href="/contact">support</ArticleTextLink>. Standard
            delivery remains the default option.
          </>
        ),
      },
      {
        question: 'What if the delivery person cannot reach me?',
        answer: (
          <>
            Make sure the phone number and address are correct before placing the order. If the
            delivery person cannot reach you, delivery may be delayed or returned. Update important
            details from <ArticleTextLink href="/account">My Account</ArticleTextLink> or contact
            support quickly if your phone number changes after ordering.
          </>
        ),
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
        answer: (
          <>
            Return requests are reviewed against the
            {' '}<ArticleTextLink href="/returns">return policy</ArticleTextLink>. If a product
            arrives defective, damaged during delivery, or different from what was ordered, contact
            support quickly with clear photos or video. Change-of-mind returns, used items, or
            requests without proof may not be accepted.
          </>
        ),
      },
      {
        question: 'How do I request a return?',
        answer: (
          <>
            Open your order details if the return option is available, or
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink> with your order
            number. Include photos or a short video that clearly shows the issue, the product, and
            the packaging. Support will review the request and explain whether the item is eligible
            for refund or replacement.
          </>
        ),
      },
      {
        question: 'When will I get my refund?',
        answer: (
          <>
            Refund timing depends on return review and item inspection. After the request is
            approved and the returned item is checked, support will confirm the refund method or
            replacement. For cash-on-delivery orders, the refund method is arranged directly with
            you through <ArticleTextLink href="/contact">support</ArticleTextLink>.
          </>
        ),
      },
      {
        question: 'What proof do I need for a damaged item?',
        answer: (
          <>
            Share clear photos or a short video showing the product issue, outer packaging, product
            label if available, and the delivered item. The clearer the proof is, the easier it is
            for support to review whether the issue happened before or during delivery. The
            {' '}<ArticleTextLink href="/returns">returns page</ArticleTextLink> explains what is
            usually reviewed.
          </>
        ),
      },
      {
        question: 'Can I return a product because I changed my mind?',
        answer: (
          <>
            Change-of-mind returns are not guaranteed. Returns are mainly reviewed for defective,
            damaged, or wrong items. If you are unsure about size, variant, compatibility, or product
            details, check the product page carefully or
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink> before ordering.
          </>
        ),
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
        answer: (
          <>
            Boilabin currently supports cash on delivery. You place the order online and pay in cash
            when the order reaches you. The <ArticleTextLink href="/payments">payments page</ArticleTextLink>
            {' '}explains current payment support and what customers should check before paying.
          </>
        ),
      },
      {
        question: 'Do I get an order confirmation?',
        answer: (
          <>
            Yes. After checkout, Boilabin creates an order confirmation with your items, delivery
            address, phone number, and total amount. Keep the order number because it helps support
            find the order quickly if you need
            {' '}<ArticleTextLink href="/track-order">tracking</ArticleTextLink>, cancellation, or
            delivery help.
          </>
        ),
      },
      {
        question: 'Why is there no online payment option?',
        answer: (
          <>
            Online payment is not active yet. This keeps checkout simple while the store validates
            ordering, delivery, and support workflows. When online payment is ready, it will be added
            carefully so order confirmation, refunds, and payment verification stay reliable. Check
            {' '}<ArticleTextLink href="/payments">payments</ArticleTextLink> for the current method.
          </>
        ),
      },
      {
        question: 'Should I pay before receiving a cash-on-delivery order?',
        answer: (
          <>
            For cash on delivery, payment is made when the order reaches you. Confirm the order
            amount and delivery details before paying. If someone asks you to pay through an
            unofficial method before delivery,
            {' '}<ArticleTextLink href="/contact">contact Boilabin support</ArticleTextLink> first.
          </>
        ),
      },
      {
        question: 'What should I do if the delivery amount looks wrong?',
        answer: (
          <>
            Compare the delivery amount with your order confirmation. If the amount is different, do
            not ignore it. <ArticleTextLink href="/contact">Contact support</ArticleTextLink> with
            your order number so we can check the product total, delivery fee, and any discount
            before you complete payment.
          </>
        ),
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
        answer: (
          <>
            Open <ArticleTextLink href="/account">My Account</ArticleTextLink> and update your
            address details. If you already placed an order, contact support before the order is
            packed. Once an order is packed or shipped, address changes may not be possible because
            the delivery information is already handed to the delivery process.
          </>
        ),
      },
      {
        question: 'Can I shop without an account?',
        answer: (
          <>
            You can browse products without an account, but checkout requires an account so your
            orders, address, <ArticleTextLink href="/wishlist">wishlist</ArticleTextLink>, and
            support history can be connected properly. This also helps us verify order details and
            provide support faster.
          </>
        ),
      },
      {
        question: 'How can I update my account information?',
        answer: (
          <>
            Go to <ArticleTextLink href="/account">My Account</ArticleTextLink> to review your
            profile, order history, wishlist, and address information. If a detail cannot be changed
            from the account area, contact support from the email or phone number linked to your
            account so we can verify the request.
          </>
        ),
      },
      {
        question: 'Why should my phone number be correct?',
        answer: (
          <>
            Your phone number is used for delivery coordination, order verification, and support
            follow-up. If the number is wrong, the delivery partner may not be able to reach you and
            the order may be delayed or returned. Update it from
            {' '}<ArticleTextLink href="/account">My Account</ArticleTextLink> before ordering.
          </>
        ),
      },
      {
        question: 'Can I use more than one delivery address?',
        answer: (
          <>
            You can use the address that matches the order you are placing. If your account supports
            saved addresses, choose the correct one before checkout. Otherwise, update the delivery
            address from <ArticleTextLink href="/account">My Account</ArticleTextLink> before placing
            the order.
          </>
        ),
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
        answer: (
          <>
            Each product page includes the product images, price, stock status, available variants,
            and details that are currently available. Start from
            {' '}<ArticleTextLink href="/category">categories</ArticleTextLink> or search, then check
            the product page before ordering, especially for sizes, storage variants, pre-order
            status, or low stock.
          </>
        ),
      },
      {
        question: 'How do I know if an item is in stock?',
        answer: (
          <>
            Product cards and product pages show the current stock state. In Stock means the item can
            be added to cart. Low stock means only a few units are left. Pre-order means the product
            can be reserved before normal availability. Out of Stock means it cannot be added to cart
            right now, but it may still be saved to
            {' '}<ArticleTextLink href="/wishlist">wishlist</ArticleTextLink>.
          </>
        ),
      },
      {
        question: 'How do I use a discount code?',
        answer: (
          <>
            Enter a valid discount code during checkout. If the code is active and your order meets
            its conditions, the discount will apply before you place the order. Review
            {' '}<ArticleTextLink href="/cart">your cart</ArticleTextLink> before checkout because
            some codes may be limited by product, category, date, order value, or usage count.
          </>
        ),
      },
      {
        question: 'How do product variants work?',
        answer: (
          <>
            Some products have variants such as size, color, storage, memory, or model. Select the
            correct variant before adding the product to
            {' '}<ArticleTextLink href="/cart">cart</ArticleTextLink>. The selected variant can
            affect price, stock, delivery timing, and eligibility for preorder.
          </>
        ),
      },
      {
        question: 'What does preorder mean?',
        answer: (
          <>
            Preorder means the product is not in normal ready stock yet, but the store can accept
            interest or reservation based on availability planning. Preorder timing may differ from
            normal delivery, so check the product page or
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink> if timing matters.
          </>
        ),
      },
    ],
  },
  {
    id: 'wishlist-availability',
    title: 'Wishlist & Availability',
    description: 'Wishlist behavior, stock reminders, unavailable products, and saved items.',
    questions: [
      {
        question: 'Does wishlist reserve a product for me?',
        answer: (
          <>
            No. <ArticleTextLink href="/wishlist">Wishlist</ArticleTextLink> saves the product for
            later, but it does not reserve stock. If a product is in stock and you want to order it,
            add it to cart and complete checkout. Stock can still change while a product is only
            saved in wishlist.
          </>
        ),
      },
      {
        question: 'Why can I add an out-of-stock product to wishlist?',
        answer: (
          <>
            <ArticleTextLink href="/wishlist">Wishlist</ArticleTextLink> is useful for products you
            may want later. If an item is out of stock, adding it to wishlist lets you find it again
            quickly without searching the catalog. It does not guarantee restock or hold the product.
          </>
        ),
      },
      {
        question: 'What should I do when only a few items are left?',
        answer: (
          <>
            Low stock means there are only a few units available. If you need the item, place the
            order soon and review the selected variant carefully. Low-stock products can sell out
            quickly, especially if several customers are viewing the same item from
            {' '}<ArticleTextLink href="/category">the catalog</ArticleTextLink>.
          </>
        ),
      },
      {
        question: 'Will Boilabin notify me when a product returns?',
        answer: (
          <>
            Stock notifications depend on the product and available store features. If notification
            is available, use the <ArticleTextLink href="/wishlist">wishlist</ArticleTextLink> or
            product page option. Otherwise, check the product page again later or contact support
            about expected availability.
          </>
        ),
      },
    ],
  },
  {
    id: 'support-safety',
    title: 'Support & Safety',
    description: 'Official support, safe communication, privacy, and account security.',
    questions: [
      {
        question: 'Where should I contact Boilabin support?',
        answer: (
          <>
            Use the <ArticleTextLink href="/contact">Contact page</ArticleTextLink>, official email,
            phone number, or official social links shown on the website. Include your order number
            when the issue is order-related. Avoid sharing sensitive account details through
            unofficial pages or unknown profiles.
          </>
        ),
      },
      {
        question: 'What information should I avoid sharing?',
        answer: (
          <>
            Do not share passwords, private login codes, or unnecessary personal information. For
            order support, the usual details are order number, phone number used for checkout,
            product name, delivery issue, and clear proof if the issue is about damage or
            {' '}<ArticleTextLink href="/returns">returns</ArticleTextLink>.
          </>
        ),
      },
      {
        question: 'How is my order information used?',
        answer: (
          <>
            Order information is used to process checkout, prepare delivery, contact you about the
            order, and provide support. Delivery address and phone number are needed for fulfillment.
            For broader details, review the
            {' '}<ArticleTextLink href="/privacy">Privacy Policy</ArticleTextLink>.
          </>
        ),
      },
      {
        question: 'How can I tell if a support message is official?',
        answer: (
          <>
            Official support should match the contact details shown on Boilabin. Be careful with
            messages asking for unusual payment methods, passwords, or private login codes. If
            anything feels wrong, stop and
            {' '}<ArticleTextLink href="/contact">contact support</ArticleTextLink> through the
            website directly.
          </>
        ),
      },
    ],
  },
]

function ArticleTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-[#0f766e] underline decoration-[#0f766e]/35 decoration-1 underline-offset-[3px] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </Link>
  )
}

export function FAQPageContent() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin FAQ',
            description: 'Browse Boilabin frequently asked questions about orders, checkout, delivery, returns, payments, account support, products, stock, wishlist, and support safety.',
            path: '/faq',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Help Center', url: '/help' },
            { name: 'FAQ', url: '/faq' },
          ]),
        ]}
      />

      <div className="container-site py-7 sm:py-9 lg:py-10">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">FAQ</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Detailed answers to common questions before and after ordering.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {ARTICLE_CATEGORIES.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-24">
              <SupportFaqList heading={category.title} description={category.description} showMoreLink={false} questions={category.questions.map(({ question, answer }) => [question, answer] as const)} />
            </div>
          ))}
        </div>

        <div className="mt-10"><SupportContactBar title="Need a direct answer?" description="Contact us with your order number when your question is order-specific." /></div>
      </div>
    </main>
  )
}

export default function ArticlesPage() {
  return (
    <main className="bg-white text-foreground">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Articles',
            description: 'Read Boilabin shopping guides, store updates, and useful customer information.',
            path: '/articles',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Articles', url: '/articles' },
          ]),
        ]}
      />
      <div className="container-site py-10 sm:py-12 lg:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Articles</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Shopping guides, store updates, and useful ideas will appear here.
          </p>
        </header>
      </div>
    </main>
  )
}
