/**
 * Dynamic Sitemap Generator
 *
 * Automatically generates sitemap.xml from database products and categories.
 *
 * Access at: /sitemap.xml
 */

import type { MetadataRoute } from 'next'
import { db } from '@/backend/database'
import { getSitemapVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { canonicalUrl, getSiteUrl } from '@/backend/seo'
import { logSecurityEvent } from '@/backend/security/security-log'

export const revalidate = 300

const STATIC_PAGE_LAST_MODIFIED = new Date('2026-06-16T00:00:00.000Z')

export function getStaticSitemapEntries(siteUrl = getSiteUrl()): MetadataRoute.Sitemap {
  return [
    { url: canonicalUrl('/', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'daily', priority: 1.0 },
    { url: canonicalUrl('/new-arrivals', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'daily', priority: 0.9 },
    { url: canonicalUrl('/category', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: canonicalUrl('/about', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: canonicalUrl('/contact', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: canonicalUrl('/faq', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: canonicalUrl('/help', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: canonicalUrl('/shipping', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: canonicalUrl('/terms', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.2 },
    { url: canonicalUrl('/privacy', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.2 },
    { url: canonicalUrl('/returns', siteUrl), lastModified: STATIC_PAGE_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.2 },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const staticPages = getStaticSitemapEntries(siteUrl)

  try {
    const products = await db.product.findMany({
      where: getSitemapVisibleProductWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: canonicalUrl(`/products/${p.slug}`, siteUrl),
      lastModified: p.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    }))

    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
      url: canonicalUrl(`/category/${c.slug}`, siteUrl),
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...productPages, ...categoryPages]
  } catch {
    logSecurityEvent({
      type: 'server_error',
      severity: 'error',
      route: '/sitemap.xml',
      statusCode: 200,
      errorCode: 'dynamic_sitemap_entries_failed',
      metadata: {
        feature: 'sitemap',
        fallback: 'static_entries',
      },
    })
    return staticPages
  }
}
