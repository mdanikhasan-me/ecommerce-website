# Step 220 - Current Search Surface Inventory

## Scope

Inspected current search/discovery surfaces without changing runtime behavior.

## Inventory

| Surface | File/source | Current status | Notes |
| --- | --- | --- | --- |
| `robots.txt` | `src/app/robots.ts` | implemented | Disallows admin, API, account, checkout, auth, cart, order, and track-order; exposes sitemap. |
| `sitemap.xml` | `src/app/sitemap.ts` | implemented | Static entries plus DB-backed products/categories with static fallback on error. |
| Canonical URL helper | `src/backend/seo/urls.ts` | implemented | Normalizes localhost to future canonical `https://boilabin.com`. |
| Robots metadata | `src/backend/seo/robots.ts` | implemented | Indexable, noindex/follow, and noindex/nofollow policies exist. |
| Metadata helpers | `src/backend/seo/metadata.ts` | implemented | Product/category/page/search metadata and noindex search behavior. |
| Structured data | `src/backend/seo/structured-data.ts` | implemented | Product, Offer, Breadcrumb, Organization, WebSite, OnlineStore, FAQ, ItemList. |
| Open Graph image | `src/app/opengraph-image.tsx` | implemented | Static image route with factual copy. |
| Product/category metadata | `src/app/(store)/products/[slug]/page.tsx`, `src/app/(store)/category/[slug]/page.tsx` | implemented | DB-backed route behavior not changed. |
| Noindex rules | tests/source helpers | implemented | Search/faceted pages protected in SEO tests. |
| Content scanner | `scripts/audit-ai-marketing-copy.mjs` | implemented | Detects hard-blocked/review-only hype across key areas. |
| Search readiness scanner | `scripts/audit-search-verification-readiness.mjs` | added | No-network repository readiness checks. |
| SEO tests | `tests/seo-policy.test.ts` | implemented | Canonical, robots, schema, sitemap static policies. |
| Search readiness tests | `tests/search-verification-readiness.test.ts` | added | Guardrails for docs/script and future-blocked areas. |
| Public support pages | FAQ, shipping, returns, privacy, terms, contact | implemented | Visible facts support current schema/policy. |
| Search Everywhere docs | `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md` | updated | Added verification workflow section. |

## Result

The local repository has the core search surfaces needed for later staging verification, but external verification remains blocked until hosting/account access exists.
