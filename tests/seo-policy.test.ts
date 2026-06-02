import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import robots from '@/app/robots'
import { getStaticSitemapEntries } from '@/app/sitemap'
import {
  generateBreadcrumbJsonLd,
  generateCategoryMetadata,
  generateItemListJsonLd,
  generateProductJsonLd,
  generateProductMetadata,
  generateSearchMetadata,
  hasFacetedCategoryParams,
  noIndexFollowRobots,
  normalizeSiteUrl,
  toAbsoluteUrl,
} from '@/backend/seo'

describe('technical SEO policy', () => {
  it('normalizes canonical site URLs and avoids localhost in production', () => {
    assert.equal(
      normalizeSiteUrl('http://localhost:3000', { NODE_ENV: 'production' }),
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

  it('excludes utility and private routes from static sitemap entries', () => {
    const urls = getStaticSitemapEntries('https://boilabin.com').map((entry) => entry.url)

    assert.equal(urls.includes('https://boilabin.com/track-order'), false)
    assert.equal(urls.includes('https://boilabin.com/search'), false)
    assert.equal(urls.includes('https://boilabin.com/cart'), false)
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
