# Step 4 Technical SEO Fix Log

Date: 2026-06-02

## Files Changed

- `src/backend/seo/urls.ts`
- `src/backend/seo/robots.ts`
- `src/backend/seo/constants.ts`
- `src/backend/seo/metadata.ts`
- `src/backend/seo/structured-data.ts`
- `src/backend/seo/index.ts`
- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/(store)/search/page.tsx`
- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/products/[slug]/page.tsx`
- `src/app/(store)/checkout/page.tsx`
- `src/app/(admin)/admin/layout.tsx`
- `src/app/(store)/order/[orderNumber]/confirmation/page.tsx`
- `src/app/(store)/track-order/page.tsx`
- `src/app/(store)/auth/layout.tsx`
- `src/app/(store)/account/layout.tsx`
- `src/app/(store)/cart/layout.tsx`
- `tests/seo-policy.test.ts`
- `audit-reports/17_STEP_4_TECHNICAL_SEO_FIX_LOG.md`

No visual components were redesigned. No seller marketplace, payment, tracking, or package-install work was done.

## SEO Issues Fixed

- Added a shared canonical URL helper that prevents local `localhost` / `127.0.0.1` values from becoming SEO canonicals.
- Added shared index/noindex robots helpers.
- Added canonical/noindex handling for search and category faceted URLs.
- Converted product metadata image URLs and JSON-LD image URLs to absolute URLs.
- Converted Breadcrumb, Organization, WebSite/SearchAction, LocalBusiness, and ItemList JSON-LD URLs to absolute URLs.
- Added noindex metadata for private or utility routes: admin, account, auth, cart, checkout, order confirmation, and track-order.
- Removed `/track-order` from the sitemap.
- Added robots disallow rules for private areas, order confirmation URLs, search, and common faceted query patterns.
- Added focused automated SEO policy tests.

## Canonical and Noindex Policy Implemented

- Homepage: indexable, canonical `https://boilabin.com`.
- Main product pages: indexable when the product is active/public and the route resolves.
- Missing or inactive product slugs: `notFound()` behavior remains; metadata fallback is noindex/nofollow.
- Out-of-stock products: remain indexable, with Product JSON-LD availability set to `https://schema.org/OutOfStock`.
- Main category pages: indexable, canonical `/category/[slug]`.
- Category pages with `category`, `sort`, `minPrice`, `maxPrice`, `rating`, `inStock`, or `page > 1`: noindex/follow and canonical back to the base category URL.
- Search pages: noindex/follow and canonical `/search`, including query/sort/filter variants.
- Private and utility pages: noindex/follow through route metadata or metadata-only layouts.
- Admin/account/cart/checkout/auth/order/search routes are excluded from robots crawl discovery where appropriate.

## Absolute URL and JSON-LD Changes

- `getSiteUrl()`, `normalizeSiteUrl()`, `canonicalUrl()`, and `toAbsoluteUrl()` now centralize URL handling.
- `NEXT_PUBLIC_SITE_URL` is used only when it is a valid non-local HTTP(S) origin; otherwise the safe fallback is `https://boilabin.com`.
- Product Open Graph images are absolute.
- Product JSON-LD `url`, `offers.url`, and `image` are absolute.
- Breadcrumb JSON-LD item URLs are absolute.
- Organization, WebSite, SearchAction, and LocalBusiness JSON-LD URLs/logos are absolute.
- ItemList JSON-LD product URLs and images are absolute.

## Product Lifecycle SEO Behavior

- Active products that resolve through `isActive: true` remain indexable.
- Out-of-stock products remain indexable and communicate `OutOfStock` in JSON-LD.
- Inactive/draft/deleted-style products are not exposed by the current product route because the page query requires `isActive: true`.
- Missing or inactive slugs continue to return `notFound()`.
- No `410 Gone` behavior was implemented because the current schema does not have a deleted/discontinued lifecycle field. A proper 404 vs 410 distinction would need an approved product lifecycle/schema decision.

## Sitemap and Robots Changes

- Sitemap static entries now exclude `/track-order`, `/search`, cart, auth, account, checkout, and admin URLs.
- Sitemap product entries now use absolute canonical URLs and include only active products whose category is active and seller status is approved.
- Sitemap category entries remain active-category only.
- Sitemap fallback logging is sanitized to avoid dumping raw errors.
- `robots.txt` now disallows private/admin/account/cart/checkout/auth/order routes, `/track-order`, `/search`, and common faceted query patterns.

## Metadata Changes

- Root `metadataBase` and Open Graph URL now use `getSiteUrl()`.
- Search metadata now uses `generateSearchMetadata(...)` with noindex/follow and canonical `/search`.
- Category metadata now checks faceted params and toggles noindex/follow when needed.
- Product metadata now uses absolute image URLs and explicit noindex/nofollow for missing metadata fallback.
- Checkout, admin, order confirmation, track-order, auth, account, and cart routes now have noindex metadata through page or layout metadata.

## Tests Added or Updated

- Added `tests/seo-policy.test.ts` covering:
  - localhost canonical rejection
  - absolute URL conversion
  - faceted category noindex detection
  - search noindex/canonical behavior
  - product metadata and JSON-LD absolute URLs
  - breadcrumb and ItemList absolute URLs
  - sitemap static-route exclusions
  - robots disallow rules

## Validation Commands Run

- `npx tsx --test tests/seo-policy.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check` on Step 4 files
- Local production server start with `node node_modules/next/dist/bin/next start -p 3100`
- HTTP route smoke checks:
  - `/`
  - `/category`
  - `/category/electronics`
  - `/search?q=sony&sort=popular`
  - `/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition`
  - `/cart`
  - `/checkout`
  - `/auth/login`
  - `/admin/dashboard`
  - `/robots.txt`
  - `/sitemap.xml`
- Metadata/content spot checks:
  - homepage canonical/noindex/localhost
  - category canonical
  - filtered category noindex/canonical
  - search noindex/canonical
  - product canonical/localhost absence
  - cart/auth noindex
  - robots disallow rules
  - sitemap exclusion of `/track-order` and `/search`

## Validation Results

| Command | Result |
|---|---|
| Focused SEO tests | Passed; 9 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 26 suites and 114 tests |
| `npm run build` | Passed |
| `git diff --check` | Passed; Git printed CRLF normalization warnings only |

## Production Build Result

Passed.

Next.js compiled successfully, checked types, generated 75 static pages, and finalized route optimization.

## Routes Smoke-Tested

| Route | Result |
|---|---|
| `/` | 200 |
| `/category` | 200 |
| `/category/electronics` | 200 |
| `/search?q=sony&sort=popular` | 200 |
| Product detail sample | 200 |
| `/cart` | 200 |
| `/checkout` | 307 redirect while unauthenticated |
| `/auth/login` | 200 |
| `/admin/dashboard` | 307 redirect while unauthenticated |
| `/robots.txt` | 200 |
| `/sitemap.xml` | 200 |

Metadata spot-check results:

- Homepage canonical: `https://boilabin.com`
- Homepage noindex: false
- Homepage localhost URL leak: false
- Category canonical: `https://boilabin.com/category/electronics`
- Filtered category canonical: `https://boilabin.com/category/electronics`
- Filtered category noindex: true
- Search canonical: `https://boilabin.com/search`
- Search noindex: true
- Product canonical: absolute product URL
- Product localhost URL leak: false
- Cart noindex: true
- Auth noindex: true
- Robots disallows `/search` and `/cart/`: true
- Sitemap includes `/category`: true
- Sitemap includes `/search`: false
- Sitemap includes `/track-order`: false

## Remaining SEO Risks

- No `410 Gone` strategy exists because the schema does not distinguish discontinued/deleted products from inactive products.
- Search pages are both noindex on render and disallowed in robots. This excludes them from crawl discovery, but already-known search URLs may not always be recrawled to see noindex immediately.
- Product JSON-LD review snippets are still not passed from approved reviews, to avoid adding product-page blocking work in this step.
- No Merchant Center feed was added.
- No seller/store SEO pages were added because seller ownership routes remain unimplemented.
- No brand pages were added.
- No hreflang was added because real Bangla alternate pages do not exist yet.
- Sitemap index/pagination was not added; large-catalog sitemap scaling remains a later task.
- Rich Results validation and Lighthouse SEO checks were not run because no new packages/tools were installed.

## Whether Visuals Changed

No.

## Exact Next Recommended Step

Proceed to the next roadmap step with seller marketplace, online payment, and tracking still disabled. The next safe SEO follow-up is a structured-data validation pass plus product lifecycle planning for discontinued/deleted products before adding Merchant Center or seller/store SEO.
