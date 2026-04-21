/**
 * SEO Module - Barrel Export
 *
 * Production-grade SEO infrastructure for Boilabin e-commerce.
 * Built from research on Amazon, Daraz BD, and Google best practices.
 *
 *   constants.ts       -> Site SEO config, bilingual keywords, org info
 *   metadata.ts        -> Next.js Metadata generators (product, category, static)
 *   structured-data.ts -> JSON-LD generators (Product, Breadcrumb, Organization, WebSite, FAQ)
 *   JsonLd.tsx         -> Server component for rendering structured data
 */

export { SEO } from './constants'

export {
  generateProductMetadata,
  generateCategoryMetadata,
  generatePageMetadata,
} from './metadata'

export {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generateLocalBusinessJsonLd,
  generateFAQJsonLd,
  generateItemListJsonLd,
} from './structured-data'

export { JsonLd } from './JsonLd'
