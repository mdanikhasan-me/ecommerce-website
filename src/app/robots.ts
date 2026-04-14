/**
 * Robots.txt Generator
 *
 * Controls which pages search engines can crawl and index.
 * Blocks admin/seller dashboards and API routes from indexing.
 *
 * Access at: /robots.txt
 */

import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/seller/',
          '/api/',
          '/account/',
          '/checkout/',
          '/auth/',
          '/cart/',
        ],
      },
      {
        // Allow Google to see everything public
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/api/', '/account/', '/checkout/', '/auth/'],
      },
      {
        // Allow Bing
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/seller/', '/api/', '/account/', '/checkout/', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
