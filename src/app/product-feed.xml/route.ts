import { db } from '@/backend/database'
import { getSitemapVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { canonicalUrl, toAbsoluteUrl } from '@/backend/seo'
import { SEO } from '@/backend/seo/constants'

export const revalidate = 300

const MAX_FEED_PRODUCTS = 5000

function escapeXml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cleanText(value: string | null | undefined, fallback = '') {
  return (value ?? fallback).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function productItemXml(product: {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  basePrice: number
  salePrice: number | null
  stockQuantity: number
  updatedAt: Date
  category: { name: string }
  images: { url: string; isPrimary: boolean }[]
}) {
  const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url
  const imageUrl = toAbsoluteUrl(primaryImage)
  const description = cleanText(product.shortDescription || product.description, product.name)
  const availability = product.stockQuantity > 0 ? 'in stock' : 'out of stock'
  const link = canonicalUrl(`/products/${product.slug}`)
  const hasSalePrice = product.salePrice !== null && product.salePrice < product.basePrice

  return `
    <item>
      <g:id>${escapeXml(product.sku || product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      ${imageUrl ? `<g:image_link>${escapeXml(imageUrl)}</g:image_link>` : ''}
      <g:availability>${availability}</g:availability>
      <g:price>${product.basePrice.toFixed(2)} BDT</g:price>
      ${hasSalePrice ? `<g:sale_price>${product.salePrice!.toFixed(2)} BDT</g:sale_price>` : ''}
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(SEO.siteName)}</g:brand>
      <g:product_type>${escapeXml(product.category.name)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:custom_label_0>${escapeXml(product.category.name)}</g:custom_label_0>
      <g:custom_label_1>${availability}</g:custom_label_1>
    </item>`
}

export async function GET() {
  const products = await db.product.findMany({
    where: getSitemapVisibleProductWhere(),
    orderBy: { updatedAt: 'desc' },
    take: MAX_FEED_PRODUCTS,
    select: {
      id: true,
      sku: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      basePrice: true,
      salePrice: true,
      stockQuantity: true,
      updatedAt: true,
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { url: true, isPrimary: true },
      },
    },
  })

  const updatedAt = (products[0]?.updatedAt ?? new Date()).toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SEO.siteName)} Product Feed</title>
    <link>${escapeXml(canonicalUrl('/'))}</link>
    <description>${escapeXml(SEO.defaultDescription)}</description>
    <lastBuildDate>${escapeXml(updatedAt)}</lastBuildDate>
    ${products.map(productItemXml).join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
