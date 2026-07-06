import { canonicalUrl } from '@/backend/seo'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

export const revalidate = 3600

const PUBLIC_SECTIONS = [
  ['Home', '/', 'Main shopping page with featured products, best sellers, new arrivals, categories, and store identity.'],
  ['Categories', '/category', 'Browse active shopping departments and subcategories.'],
  ['New Arrivals', '/new-arrivals', 'Recently added public products.'],
  ['Help Center', '/help', 'Customer support entry point for orders, returns, shipping, payments, and account help.'],
  ['Help Articles', '/articles', 'Detailed help articles for orders, delivery, returns, payments, account support, and products.'],
  ['Contact', '/contact', 'Customer support contact form, email, phone, and office information.'],
  ['About', '/about', 'About Boilabin and how the store works.'],
  ['Shipping', '/shipping', 'Delivery fees, timing, and Bangladesh coverage.'],
  ['Returns', '/returns', 'Return and refund policy.'],
] as const

const PRIVATE_OR_LOW_VALUE_SECTIONS = [
  '/admin',
  '/api',
  '/account',
  '/auth',
  '/cart',
  '/checkout',
  '/compare',
  '/order',
  '/track-order',
  '/wishlist',
] as const

function pageLine([label, path, description]: (typeof PUBLIC_SECTIONS)[number]) {
  return `- ${label}: ${canonicalUrl(path)} - ${description}`
}

export function GET() {
  const productPattern = `${canonicalUrl('/products')}/{product-slug}`
  const categoryPattern = `${canonicalUrl('/category')}/{category-slug}`

  const body = `# Boilabin

Boilabin is an online shopping website for Bangladesh. It publishes product listings, category pages, prices in BDT, stock availability, cash-on-delivery checkout information, delivery details, return policy, and customer support information.

## Crawl Priority

Use the XML sitemap for the full public URL list:
- Sitemap: ${canonicalUrl('/sitemap.xml')}
- Robots: ${canonicalUrl('/robots.txt')}
- Product feed: ${canonicalUrl('/product-feed.xml')}

## Important Public Pages

${PUBLIC_SECTIONS.map(pageLine).join('\n')}

## URL Patterns

- Product pages: ${productPattern}
- Category pages: ${categoryPattern}
- Search page: ${canonicalUrl('/search')} is available for users, but search result URLs are not intended as canonical indexed pages.

## Structured Data

Public pages use JSON-LD where relevant:
- Home: Organization, OnlineStore, and WebSite with SearchAction.
- Product pages: Product, Offer, shipping details, return policy, aggregate rating when available, and breadcrumb data.
- Category and collection pages: CollectionPage, ItemList, and breadcrumb data.
- Contact/About/Help/Articles pages: WebPage or ContactPage data plus breadcrumb data.

## Do Not Treat As Public Catalog Content

These paths are private, transactional, or low-value for public search:
${PRIVATE_OR_LOW_VALUE_SECTIONS.map((path) => `- ${canonicalUrl(path)}`).join('\n')}

## Contact

- Email: ${CONTACT_EMAIL}
- Phone: ${CONTACT_PHONE}
`

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
