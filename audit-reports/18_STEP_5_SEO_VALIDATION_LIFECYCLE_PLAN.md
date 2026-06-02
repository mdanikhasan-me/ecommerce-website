# Step 5 SEO Validation and Product Lifecycle Plan

Date: 2026-06-02

## Step 4 SEO Validation Result

Step 4 technical SEO changes remain in place and production build validation passed after one tiny policy correction in Step 5.

Validated intact:

- Shared canonical URL helpers still reject local hostnames and return `https://boilabin.com` as the safe fallback.
- Homepage is indexable with canonical `https://boilabin.com`.
- Main category pages are indexable with stable category canonicals.
- Faceted category URLs render `noindex, follow` and canonical back to the base category URL.
- Search URLs render `noindex, follow` and canonical `/search`.
- Product pages render absolute canonical URLs and Product/Breadcrumb JSON-LD.
- Product JSON-LD images and Offer URLs are absolute.
- Private/utility metadata-only noindex layouts remain present for auth, account, cart, checkout, admin, order confirmation, and track-order surfaces.
- Sitemap still excludes search, track-order, cart, checkout, auth, account, and admin routes.

## Files Changed

- `src/app/robots.ts`
- `tests/seo-policy.test.ts`
- `audit-reports/18_STEP_5_SEO_VALIDATION_LIFECYCLE_PLAN.md`

## Tiny Step 5 Fix Applied

`robots.txt` no longer disallows `/search` or common faceted query patterns such as `sort`, `minPrice`, and `maxPrice`.

Reason: search and faceted category URLs are intentionally rendered with `noindex, follow` and stable canonicals. If robots blocks those URLs, crawlers may be unable to see the `noindex` directive on already-known duplicate URLs.

Kept disallowed:

- `/admin/`
- `/api/`
- `/account/`
- `/checkout/`
- `/auth/`
- `/cart/`
- `/order/`
- `/track-order`

## Canonical, Noindex, and Robots Consistency Result

Result: consistent after the Step 5 robots correction.

| Surface | Canonical | Robots meta | robots.txt | Verdict |
|---|---|---|---|---|
| `/` | `https://boilabin.com` | index/follow | allowed | OK |
| `/category` | `https://boilabin.com/category` | index/follow | allowed | OK |
| `/category/electronics` | `https://boilabin.com/category/electronics` | index/follow | allowed | OK |
| `/category/electronics?sort=price_asc` | `https://boilabin.com/category/electronics` | noindex/follow | allowed | OK |
| `/category/electronics?minPrice=1000&maxPrice=5000` | `https://boilabin.com/category/electronics` | noindex/follow | allowed | OK |
| `/search?q=sony&sort=popular` | `https://boilabin.com/search` | noindex/follow | allowed | OK |
| Product detail sample | absolute product URL | index/follow | allowed | OK |
| `/cart` | `https://boilabin.com/cart` | noindex/follow | disallowed | Acceptable private/utility crawl block |
| `/auth/login` | `https://boilabin.com/auth/login` | noindex/follow | disallowed | Acceptable private/utility crawl block |
| `/checkout` | source metadata noindex; unauth redirects | noindex/follow source-inspected | disallowed | OK |
| `/admin/dashboard` | admin layout noindex; unauth redirects | noindex/follow source-inspected | disallowed | OK |
| Order confirmation unauth URL | source metadata noindex; unauth 404 | noindex/follow source-inspected | disallowed | OK |

Private/utility routes are intentionally disallowed to reduce crawl exposure. Search and faceted duplicate URLs are now crawlable so crawlers can observe noindex/canonical directives.

## Metadata Spot-Check Results

Local production server: `node node_modules/next/dist/bin/next start -p 3100`

| Route | Status | Metadata result |
|---|---:|---|
| `/` | 200 | canonical `https://boilabin.com`, no noindex, Organization/WebSite/OnlineStore JSON-LD |
| `/category` | 200 | page rendered successfully |
| `/category/electronics` | 200 | canonical `https://boilabin.com/category/electronics`, indexable, BreadcrumbList/ItemList JSON-LD |
| `/category/electronics?sort=price_asc` | 200 | canonical base category, noindex/follow |
| `/category/electronics?minPrice=1000&maxPrice=5000` | 200 | canonical base category, noindex/follow |
| `/search?q=sony&sort=popular` | 200 | canonical `https://boilabin.com/search`, noindex/follow |
| `/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition` | 200 | absolute product canonical, Product/Breadcrumb JSON-LD |
| `/cart` | 200 | noindex present |
| `/checkout` | 307 | redirected unauthenticated user to `/auth/login?callbackUrl=/checkout&reason=checkout` |
| `/auth/login` | 200 | noindex present |
| `/admin/dashboard` | 307 | redirected unauthenticated user to login |
| `/order/BLB-DOES-NOT-EXIST/confirmation` | 404 | no delivery/phone PII present |
| `/robots.txt` | 200 | private routes disallowed; search/faceted patterns allowed |
| `/sitemap.xml` | 200 | public sitemap generated |

## Structured Data Validation Findings

Validated without external paid/live tools by parsing rendered JSON-LD from local production HTML.

| JSON-LD type | Where found | Findings |
|---|---|---|
| Organization | Homepage | Present, absolute URL/logo, no localhost |
| WebSite + SearchAction | Homepage | Present, SearchAction target uses absolute `/search?q={search_term_string}` |
| OnlineStore | Homepage | Present with Bangladesh area/currency and COD-only payment messaging |
| BreadcrumbList | Category and product pages | Present, item URLs are absolute |
| ItemList | Category page | Present, product item URLs/images are absolute when images exist |
| Product | Product detail | Present, absolute product URL/images, SKU fallback, category, Offer |
| Offer | Product detail | Present, `priceCurrency: BDT`, price string, availability mapped to schema.org URL |

Additional structured-data checks:

- JSON-LD parse errors: 0
- JSON-LD localhost/127.0.0.1/::1 references: none found
- JSON-LD `undefined` or `:null` values: none found
- Product sample availability: `https://schema.org/InStock`
- No fake review blocks were emitted in the product sample.

Note: the helper named `generateLocalBusinessJsonLd` currently emits `@type: "OnlineStore"`, not `LocalBusiness`. This was not changed in Step 5 because it is not a regression and should be confirmed in a later structured-data/Rich Results pass.

## Sitemap and Robots Findings

Sitemap findings:

- Includes homepage and category URLs.
- Includes 22 product URLs in the local dataset.
- Excludes `/search`.
- Excludes `/track-order`.
- Excludes `/cart`.
- Excludes `/checkout`.
- Excludes `/account`.
- Excludes `/auth`.
- Excludes `/admin`.
- Product sitemap query requires `product.isActive: true`, `category.isActive: true`, and `seller.status: APPROVED`.

Robots findings after Step 5 correction:

- `Disallow: /admin/`: yes
- `Disallow: /api/`: yes
- `Disallow: /account/`: yes
- `Disallow: /cart/`: yes
- `Disallow: /order/`: yes
- `Disallow: /track-order`: yes
- `Disallow: /search`: no
- Faceted wildcard disallows such as `*sort=`: no
- Sitemap line: `https://boilabin.com/sitemap.xml`

## Product Lifecycle SEO Plan

Current schema facts:

- `Product.slug` is unique.
- `Product.isActive` is the only product publish/visibility field.
- `Product.stockQuantity` supports in-stock/out-of-stock behavior.
- `Category.isActive` exists.
- `Seller.status` exists.
- No product `status` enum exists.
- No `deletedAt`, `discontinuedAt`, `publishedAt`, `unpublishedAt`, `replacementProductId`, `canonicalProductId`, or previous-slug table exists.

Recommended lifecycle policy:

| Product state | Current safe behavior | Future SEO target |
|---|---|---|
| Active, in stock | 200, index/follow, Product JSON-LD `InStock`, include in sitemap when category active and seller approved | Keep |
| Active, out of stock | 200, index/follow, Product JSON-LD `OutOfStock`, include in sitemap while still order-relevant | Keep indexable unless permanently unavailable |
| Temporarily inactive/admin-unpublished | Currently public route should not resolve when `isActive: false`; sitemap excludes | 404 or noindex while temporary; do not 410 unless permanent |
| Draft | Not modeled separately; use `isActive: false` today | Add `status: DRAFT`; never public, no sitemap, no Merchant feed |
| Rejected | Not modeled separately | Add `status: REJECTED`; never public, noindex/404, no sitemap/feed |
| Deleted hard record | No deleted state; deleted rows become 404 | Add soft-delete state if recovery/audit needed; 410 only for permanent public removals |
| Discontinued permanent removal | Not modeled | Add `status: DISCONTINUED` and `discontinuedAt`; return 410 if no replacement, or 301 to replacement if one exists |
| Slug changed | Unique current slug only; no old-slug redirect state | Add previous-slug table and 301 old slugs to the active product |
| Duplicate slug | Prevented by unique constraint | Keep unique; add admin validation messaging if needed |
| Seller-deleted later | Seller ownership routes not implemented | After seller routes exist, remove from sitemap/feed immediately; 404/noindex if temporary, 410 if permanently removed |
| Admin-unpublished later | `isActive: false` can hide it | Remove from sitemap/feed; 404/noindex while unpublished; preserve admin audit trail |

Schema decisions needed before Merchant Center or large SEO expansion:

- Product lifecycle enum: `DRAFT`, `ACTIVE`, `INACTIVE`, `REJECTED`, `DISCONTINUED`, `ARCHIVED` or equivalent.
- Publish timestamps: `publishedAt`, `unpublishedAt`.
- Permanent-removal timestamps: `deletedAt`, `discontinuedAt`.
- Replacement relation: `replacementProductId`.
- Canonical consolidation field if duplicates/variants become public: `canonicalProductId`.
- Previous slug history table for 301 redirects.
- Clear seller visibility/moderation fields before seller-owned product SEO.

## Tests Added or Updated

Updated `tests/seo-policy.test.ts`:

- Replaced the previous expectation that `/search` and faceted query patterns are disallowed.
- Added coverage that private routes remain disallowed.
- Added coverage that `/search`, `sort`, and `minPrice` faceted patterns remain allowed so noindex/canonical can be observed.

No new packages were installed.

## Validation Commands Run

- `npx tsx --test tests/seo-policy.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `node node_modules/next/dist/bin/next start -p 3100`
- Local production route and HTML spot-check script against `http://localhost:3100`

## Validation Results

| Command | Result |
|---|---|
| Focused SEO tests | Passed; 9 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 26 suites, 114 tests |
| `npm run build` | Passed |
| Local production route checks | Passed for tested routes |
| Local metadata/JSON-LD checks | Passed with findings noted above |

Production build result: passed.

## Remaining SEO Risks

- Product lifecycle remains under-modeled; no schema support exists yet for discontinued vs deleted vs temporarily inactive, so precise 404/410/301 lifecycle behavior is not possible without a future schema decision.
- Runtime product/search/category product visibility is not fully centralized. Sitemap and homepage category counts require approved seller and active category, while several buyer-facing product queries still primarily rely on `isActive: true`. This should be normalized before seller marketplace and Merchant Center work.
- Search and faceted URLs are now crawlable so crawlers can see `noindex`; this is correct for known duplicates but should be monitored for crawl-budget pressure before very large catalog scale.
- Product JSON-LD can generate review snippets, but the product page does not currently pass approved review objects into JSON-LD.
- The homepage store/business schema emits `OnlineStore`; external Rich Results validation should confirm whether this is preferable to `LocalBusiness` for the final launch target.
- No external Google Rich Results, Search Console, Merchant Center, or Lighthouse SEO validation was run.
- No Merchant Center feed exists.
- Brand pages, seller/store SEO pages, Bangla alternate pages, and hreflang are still intentionally not implemented.
- Sitemap index/pagination is still not implemented for large catalog scale.
- Product metadata descriptions can still be improved for quality, but that would be content SEO rather than this validation step.

## Whether Visuals Changed

No.

## Exact Next Recommended Roadmap Step

Before Merchant Center, seller/store SEO, brand pages, or content SEO, decide and implement the product lifecycle data model and public visibility contract: product status enum, soft deletion/discontinuation fields, replacement redirects, previous-slug redirects, and one shared buyer-visible product filter used by sitemap, search, category pages, product pages, APIs, and category counts.
