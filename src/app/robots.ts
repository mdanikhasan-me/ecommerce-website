import type { MetadataRoute } from 'next'
import { canonicalUrl } from '@/backend/seo'

const DISALLOW_RULES = [
  '/admin',
  '/api',
  '/account',
  '/checkout',
  '/auth',
  '/cart',
  '/compare',
  '/wishlist',
  '/order/',
  '/track-order',
]

const DISCOVERY_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'Google-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_RULES,
      },
      ...DISCOVERY_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW_RULES,
      })),
    ],
    sitemap: canonicalUrl('/sitemap.xml'),
    host: canonicalUrl('/').replace(/\/$/, ''),
  }
}
