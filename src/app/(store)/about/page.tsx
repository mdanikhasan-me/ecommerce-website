import type { Metadata } from 'next'
import {
  generatePageMetadata,
  JsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
  generateWebPageJsonLd,
} from '@/backend/seo'

export const metadata: Metadata = generatePageMetadata(
  'About Boilabin',
  'Boilabin is a Bangladesh marketplace for everyday products selected in hand, checked before listing, and backed by one accountable store.',
  '/about',
)

export default function AboutPage() {
  return (
    <main className="bg-white">
      <JsonLd
        data={[
          generateOrganizationJsonLd(),
          generateWebPageJsonLd({
            type: 'AboutPage',
            name: 'About Boilabin',
            description:
              'Boilabin is a Bangladesh marketplace for everyday products selected in hand, checked before listing, and backed by one accountable store.',
            path: '/about',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]),
        ]}
      />

      <div className="container-site py-10 sm:py-12 lg:py-16">
        <article className="max-w-3xl text-[#111827]">
          <h1 className="font-display text-[2rem] font-medium leading-tight tracking-normal sm:text-[2.5rem]">
            About Boilabin
          </h1>

          <p className="mt-5 text-base leading-7 text-[#374151]">
            Boilabin is a Bangladesh marketplace for everyday products. We keep the store focused on practical items,
            clear prices, and product pages that are easy to understand before you order.
          </p>

          <p className="mt-4 text-base leading-7 text-[#374151]">
            Our goal is simple: make online shopping feel cleaner, faster, and more accountable. We do not want the
            store to feel crowded with endless listings that make choosing harder than it needs to be.
          </p>

          <h2 className="mt-9 text-xl font-semibold leading-7 text-[#111827]">How we choose products</h2>
          <p className="mt-3 text-base leading-7 text-[#374151]">
            Products are added with a focus on usefulness, fair pricing, clear information, and a better shopping
            experience. If a product is listed, it should be easy to compare, easy to understand, and easy to order.
          </p>

          <h2 className="mt-9 text-xl font-semibold leading-7 text-[#111827]">What we are building</h2>
          <p className="mt-3 text-base leading-7 text-[#374151]">
            We are building Boilabin as a fast, polished ecommerce experience for customers in Bangladesh. The website
            should stay simple, responsive, and reliable across phones, tablets, and desktop screens.
          </p>
        </article>
      </div>
    </main>
  )
}
