import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import robots from '@/app/robots'
import { getStaticSitemapEntries } from '@/app/sitemap'
import {
  canonicalUrl,
  generateBreadcrumbJsonLd,
  generateCategoryMetadata,
  generateFAQJsonLd,
  generateItemListJsonLd,
  generateLocalBusinessJsonLd,
  generateOrganizationJsonLd,
  generateProductJsonLd,
  generateProductMetadata,
  generateSearchMetadata,
  generateWebsiteJsonLd,
  hasFacetedCategoryParams,
  noIndexFollowRobots,
  normalizeSiteUrl,
  serializeJsonLd,
  toAbsoluteUrl,
} from '@/backend/seo'

describe('technical SEO policy', () => {
  it('normalizes canonical site URLs and avoids localhost in production', () => {
    assert.equal(
      normalizeSiteUrl('http://localhost:3000', { NODE_ENV: 'production' }),
      'https://boilabin.com',
    )
    assert.equal(
      normalizeSiteUrl('http://[::1]:3000/products/test', { NODE_ENV: 'production' }),
      'https://boilabin.com',
    )
    assert.equal(
      normalizeSiteUrl('ftp://shop.example.com', { NODE_ENV: 'production' }),
      'https://boilabin.com',
    )
    assert.equal(
      normalizeSiteUrl('https://shop.example.com/path', { NODE_ENV: 'production' }),
      'https://shop.example.com',
    )
  })

  it('converts relative media paths to absolute URLs', () => {
    assert.equal(toAbsoluteUrl('/uploads/product.webp', 'https://boilabin.com'), 'https://boilabin.com/uploads/product.webp')
    assert.equal(toAbsoluteUrl('https://cdn.example.com/image.jpg', 'https://boilabin.com'), 'https://cdn.example.com/image.jpg')
    assert.equal(canonicalUrl('', 'https://boilabin.com'), 'https://boilabin.com/')
  })

  it('detects faceted category URLs that should not be indexed', () => {
    assert.equal(hasFacetedCategoryParams({}), false)
    assert.equal(hasFacetedCategoryParams({ page: '1' }), false)
    assert.equal(hasFacetedCategoryParams({ page: '2' }), true)
    assert.equal(hasFacetedCategoryParams({ sort: 'popular' }), true)
    assert.equal(hasFacetedCategoryParams({ minPrice: '1000' }), true)
  })

  it('keeps base category pages indexable and marks faceted category pages noindex', () => {
    const base = generateCategoryMetadata({ name: 'Electronics', slug: 'electronics', productCount: 18 })
    const filtered = generateCategoryMetadata({
      name: 'Electronics',
      slug: 'electronics',
      productCount: 18,
      indexable: false,
    })

    assert.equal(base.alternates?.canonical, 'https://boilabin.com/category/electronics')
    assert.deepEqual(filtered.robots, noIndexFollowRobots)
    assert.equal(filtered.alternates?.canonical, 'https://boilabin.com/category/electronics')
  })

  it('marks search pages noindex with a stable canonical URL', () => {
    const metadata = generateSearchMetadata({ q: 'sony' })

    assert.deepEqual(metadata.robots, noIndexFollowRobots)
    assert.equal(metadata.alternates?.canonical, 'https://boilabin.com/search')
  })

  it('generates absolute product metadata and Product JSON-LD URLs', () => {
    const product = {
      name: 'Test Phone',
      slug: 'test-phone',
      description: 'A test product',
      shortDescription: 'Short test product description',
      basePrice: 1200,
      salePrice: 1000,
      images: [{ url: '/uploads/test-phone.webp', isPrimary: true }],
      category: { name: 'Electronics', slug: 'electronics' },
      stockQuantity: 0,
    }

    const metadata = generateProductMetadata(product)
    const jsonLd = generateProductJsonLd(product)

    assert.equal(metadata.alternates?.canonical, 'https://boilabin.com/products/test-phone')
    assert.equal((metadata.openGraph?.images as { url: string }[])[0].url, 'https://boilabin.com/uploads/test-phone.webp')
    assert.equal(jsonLd.url, 'https://boilabin.com/products/test-phone')
    assert.deepEqual(jsonLd.image, ['https://boilabin.com/uploads/test-phone.webp'])
    assert.equal((jsonLd.offers as { availability: string }).availability, 'https://schema.org/OutOfStock')
  })

  it('keeps Product Offer schema useful without unsupported merchant claims', () => {
    const jsonLd = generateProductJsonLd({
      name: 'Test Phone',
      slug: 'test-phone',
      description: 'A test product',
      basePrice: 1200,
      images: [{ url: '/uploads/test-phone.webp' }],
      category: { name: 'Electronics', slug: 'electronics' },
      stockQuantity: 5,
    })

    const serialized = JSON.stringify(jsonLd).toLowerCase()
    const offer = jsonLd.offers as Record<string, unknown>
    const shippingDetails = offer.shippingDetails as Record<string, unknown>
    const returnPolicy = offer.hasMerchantReturnPolicy as Record<string, unknown>

    assert.equal(offer.priceCurrency, 'BDT')
    assert.equal((offer.seller as { name: string }).name, 'Boilabin')
    assert.equal((shippingDetails.shippingRate as { currency: string }).currency, 'BDT')
    assert.equal((shippingDetails.shippingDestination as { addressCountry: string }).addressCountry, 'BD')
    assert.equal('deliveryTime' in shippingDetails, false)
    assert.equal(returnPolicy.returnPolicyCategory, 'https://schema.org/MerchantReturnFiniteReturnWindow')
    assert.equal(returnPolicy.merchantReturnDays, 7)
    assert.equal('returnMethod' in returnPolicy, false)
    assert.equal(serialized.includes('gtin'), false)
    assert.equal(serialized.includes('mpn'), false)
    assert.equal(serialized.includes('authentic'), false)
    assert.equal(serialized.includes('bkash'), false)
    assert.equal(serialized.includes('nagad'), false)
    assert.equal(serialized.includes('visa'), false)
    assert.equal(serialized.includes('mastercard'), false)
  })

  it('keeps metadata fallbacks factual and canonical without hard-blocked hype', () => {
    const productMetadata = generateProductMetadata({
      name: 'Test Phone',
      slug: 'test-phone',
      basePrice: 1200,
      images: [],
      category: { name: 'Electronics', slug: 'electronics' },
    })
    const categoryMetadata = generateCategoryMetadata({
      name: 'Electronics',
      slug: 'electronics',
      productCount: 8,
    })
    const serialized = JSON.stringify([productMetadata, categoryMetadata]).toLowerCase()

    assert.equal(productMetadata.alternates?.canonical, 'https://boilabin.com/products/test-phone')
    assert.equal(categoryMetadata.alternates?.canonical, 'https://boilabin.com/category/electronics')
    assert.doesNotMatch(serialized, /\b(most trusted|trusted|premium|best price|leading|ultimate|authentic guaranteed|fast delivery|secure checkout)\b/)
  })

  it('keeps Organization, WebSite, OnlineStore, and FAQ JSON-LD factual', () => {
    const organization = generateOrganizationJsonLd()
    const website = generateWebsiteJsonLd()
    const onlineStore = generateLocalBusinessJsonLd()
    const faq = generateFAQJsonLd([
      {
        question: 'What payment methods do you accept?',
        answer: 'Cash on Delivery is available now.',
      },
    ])

    assert.equal(organization.name, 'Boilabin')
    assert.equal(organization.url, 'https://boilabin.com/')
    assert.deepEqual(organization.sameAs, [])
    assert.equal(website.potentialAction['@type'], 'SearchAction')
    assert.equal(website.potentialAction.target.urlTemplate, 'https://boilabin.com/search?q={search_term_string}')
    assert.equal(onlineStore.paymentAccepted, 'Cash on Delivery')
    assert.equal(JSON.stringify(onlineStore).includes('bKash'), false)
    assert.equal(JSON.stringify(onlineStore).includes('Nagad'), false)
    assert.equal(faq.mainEntity[0].name, 'What payment methods do you accept?')
    assert.equal(faq.mainEntity[0].acceptedAnswer.text, 'Cash on Delivery is available now.')
  })

  it('generates absolute breadcrumb and item-list JSON-LD URLs', () => {
    const breadcrumb = generateBreadcrumbJsonLd([{ name: 'Electronics', url: '/category/electronics' }])
    const itemList = generateItemListJsonLd('Electronics products', [
      {
        name: 'Test Phone',
        slug: 'test-phone',
        basePrice: 1200,
        image: '/uploads/test-phone.webp',
        position: 1,
      },
    ])

    assert.equal(breadcrumb.itemListElement[0].item, 'https://boilabin.com/category/electronics')
    assert.equal(itemList.itemListElement[0].item.url, 'https://boilabin.com/products/test-phone')
    assert.equal(itemList.itemListElement[0].item.image, 'https://boilabin.com/uploads/test-phone.webp')
  })

  it('escapes JSON-LD script-breaking characters before rendering', () => {
    const serialized = serializeJsonLd({
      name: '</script><img src=x onerror=alert(1)>',
      description: 'Ampersand & line\u2028separator\u2029test',
    })

    assert.equal(serialized.includes('</script'), false)
    assert.equal(serialized.includes('<'), false)
    assert.equal(serialized.includes('>'), false)
    assert.equal(serialized.includes('&'), false)
    assert.equal(serialized.includes('\u2028'), false)
    assert.equal(serialized.includes('\u2029'), false)
    assert.match(serialized, /\\u003c\/script\\u003e/)
    assert.match(serialized, /\\u0026/)
    assert.match(serialized, /\\u2028/)
    assert.match(serialized, /\\u2029/)
  })

  it('excludes utility and private routes from static sitemap entries', () => {
    const urls = getStaticSitemapEntries('https://boilabin.com').map((entry) => entry.url)

    assert.equal(urls.includes('https://boilabin.com/track-order'), false)
    assert.equal(urls.includes('https://boilabin.com/search'), false)
    assert.equal(urls.includes('https://boilabin.com/cart'), false)
    assert.equal(urls.includes('https://boilabin.com/deals'), false)
    assert.equal(urls.includes('https://boilabin.com/category'), true)
  })

  it('disallows private routes but allows search and faceted URLs to expose noindex', () => {
    const rules = robots().rules
    const disallow = Array.isArray(rules) && rules[0] && 'disallow' in rules[0] ? rules[0].disallow : []

    assert.ok(Array.isArray(disallow))
    assert.ok(disallow.includes('/admin/'))
    assert.ok(disallow.includes('/api/'))
    assert.ok(disallow.includes('/account/'))
    assert.ok(disallow.includes('/cart/'))
    assert.ok(disallow.includes('/order/'))
    assert.ok(disallow.includes('/track-order'))
    assert.equal(disallow.includes('/search'), false)
    assert.equal(disallow.includes('/*?*sort='), false)
    assert.equal(disallow.includes('/*?*minPrice='), false)
  })
})
