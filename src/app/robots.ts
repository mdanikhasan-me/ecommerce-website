import type { MetadataRoute } from 'next'
import { canonicalUrl } from '@/backend/seo'

const DISALLOW_RULES = [
  '/admin/',
  '/api/',
  '/account/',
  '/checkout/',
  '/auth/',
  '/cart/',
  '/order/',
  '/track-order',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_RULES,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: DISALLOW_RULES,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: DISALLOW_RULES,
      },
    ],
    sitemap: canonicalUrl('/sitemap.xml'),
  }
}
