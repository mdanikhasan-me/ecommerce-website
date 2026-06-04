import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'About Boilabin',
  'Learn how Boilabin organizes product information, shopping categories, order support, and policy pages for customers in Bangladesh.',
  '/about',
)

export default function AboutPage() {
  return (
    <ContentPageShell
      eyebrow="About Boilabin"
      title="A cleaner online shopping experience for Bangladesh."
      description="Boilabin is being built around clear product listings, practical category browsing, and support pages that help customers understand the shopping flow before placing an order."
      highlights={[
        { label: 'Focus', value: 'Product listings with prices, images, and availability' },
        { label: 'Catalog', value: 'Categories for electronics, fashion, home, beauty, toys, and more' },
        { label: 'Support', value: 'Order, shipping, return, and contact information in one place' },
      ]}
      sections={[
        {
          id: 'story',
          title: 'Our story',
          body: (
            <>
              <p>
                Boilabin started with a simple goal: make online shopping easier to understand
                for customers in Bangladesh.
              </p>
              <p>
                Instead of relying on vague marketplace claims, the storefront focuses on product
                names, images, prices, availability, categories, and order information that buyers
                can review before checkout.
              </p>
            </>
          ),
        },
        {
          id: 'promise',
          title: 'What customers should expect',
          body: (
            <ul>
              <li>Product listings with images, prices, availability, and category details</li>
              <li>Checkout totals that show product, delivery, and payment information</li>
              <li>Account pages where signed-in customers can review orders</li>
              <li>Returns and refunds explained in plain language</li>
              <li>Contact information for order, product, and support questions</li>
            </ul>
          ),
        },
        {
          id: 'vision',
          title: 'Where we are going',
          body: (
            <>
              <p>
                The long term vision is a shopping site where product information, policies,
                category pages, and account tools stay consistent as the catalog grows.
              </p>
              <p>
                That means improving the parts buyers actually use: searchable listings,
                readable product pages, useful support content, and order flows that stay clear.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
