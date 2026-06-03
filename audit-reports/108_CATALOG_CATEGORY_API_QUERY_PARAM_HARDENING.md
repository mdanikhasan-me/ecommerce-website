# Step 108 Catalog Category API Query Param Hardening

## 1. Initial Git State

- `git status --short` before edits: clean.
- `git diff --cached --name-only` before edits: no staged files.
- Latest commit before Step 108: `7367d52 fix: harden public search query params`.

## 2. Step 107 Commit Verification

Step 107 was verified as the latest completed commit:

- `7367d52 fix: harden public search query params`

## 3. Authenticated Admin Blocker Handling

Authenticated admin desktop/mobile QA was not retried. Steps 102-104 already established that the secure credential-entry path is externally blocked, so this step kept admin auth QA out of scope.

## 4. Flash Deals Removal Verification

Flash Deals removal remains intact.

- Active source scan found no revived Flash Deals storefront/admin implementation.
- Remaining Flash references are historical migrations or removal/negative tests.
- `/deals` returned `404` in dev and production smoke.
- `/api/admin/flash-sales` returned `404` in dev and production smoke.

## 5. Buyer-Facing Query-Param Surface Inventory

Inventoried public query-param parsing surfaces with `rg` across `src/app`, `src/backend`, `src/frontend`, and `tests`.

Classified findings:

- Already hardened by Step 107: public `/search` page via `src/backend/catalog/search-params.ts`.
- Hardened in Step 108: public `/api/products` route and public `/category/[slug]` listing page.
- Out of scope: admin/private list filters, account/auth params, order APIs, report exports, and authenticated flows.
- Safe/no-action: static homepage/new-arrivals/product-detail server queries without public pagination/filter params, tests, constants, and SEO helpers.

## 6. Root Causes Found

`src/app/api/products/route.ts` parsed public params inline:

- `parseInt(page)` could become `NaN`.
- `parseInt(limit)` could become `NaN`.
- `limit=999999` was capped only when parse succeeded; malformed limit could pass `NaN` to Prisma `take`.
- Raw `category`, `q`, and `ids` were not bounded or normalized before Prisma filters.

`src/app/(store)/category/[slug]/page.tsx` parsed public params inline:

- `parseInt(page)` could become `NaN`.
- `skip = (page - 1) * limit` could become `NaN`.
- Rating/price/category/sort filters were handled separately from the Step 107 parser.

## 7. Hardening Implementation

Extended `src/backend/catalog/search-params.ts` into a shared no-DB catalog parser for:

- Search page params.
- Category listing params.
- Public product API params.

Added safe handling for:

- Malformed, zero, negative, decimal, infinity-like, and huge page values.
- Malformed or huge API `limit` values.
- Unsupported sort values.
- Malformed, negative, or huge prices.
- Malformed ratings.
- Invalid category slug filters.
- Repeated URL params, using first values deterministically.
- Extremely long text and product ID values.
- Unsafe product ID tokens.

Updated:

- `/api/products` to consume parsed API params before Prisma query construction.
- `/category/[slug]` to consume parsed category params for filters, sorting, pagination, UI filter state, and pagination URLs.
- Category metadata still uses raw faceted-param presence for noindex behavior, preserving SEO policy for faceted URLs.

## 8. Valid Behavior Preservation

Preserved:

- `/api/products` JSON response shape: `{ items, total, page, limit, totalPages }`.
- Buyer-visible product filtering policy.
- Valid category page rendering.
- Valid search behavior from Step 107.
- Existing category filter UI and sort controls.
- Existing product cards and visuals.
- Existing sitemap/robots policy.

## 9. Malformed Category Route Results

Dev smoke:

- `/category/electronics?page=not-a-number&minPrice=bad` -> `200`, noindex present, canonical category URL present.
- `/category/electronics?page=0` -> `200`, canonical category URL present.
- `/category/electronics?page=-5` -> `200`, canonical category URL present.
- `/category/electronics?sort=unknown` -> `200`, noindex present, canonical category URL present.
- `/category/electronics?sort=price_asc` -> `200`, noindex present, canonical category URL present.
- `/category/electronics?minPrice=50000&maxPrice=1000` -> `200`, noindex present, canonical category URL present.
- `/category/toys-collectibles?page=not-a-number` -> `200`.

Production smoke:

- `/category/electronics?page=not-a-number&minPrice=bad` -> `200`, noindex present, canonical category URL present.
- `/category/electronics?sort=unknown` -> `200`, noindex present, canonical category URL present.

## 10. Malformed Product/API Route Results

Dev smoke:

- `/api/products` -> `200`.
- `/api/products?page=not-a-number&limit=bad` -> `200`.
- `/api/products?page=-5&limit=999999` -> `200`.
- `/api/products?sort=unknown` -> `200`.
- `/api/products?minPrice=bad&maxPrice=also-bad` -> `200`.
- `/api/products?rating=not-a-number` -> `200`.
- `/api/products?category=../../bad` -> `200`.

Production smoke:

- `/api/products?page=not-a-number&limit=bad` -> `200`.
- `/api/products?sort=unknown` -> `200`.

## 11. Search Regression Result

- `/search?q=phone&page=not-a-number&minPrice=bad` returned `200` in dev and production smoke.
- Search noindex and canonical search URL remained present.

## 12. Metadata / Noindex / Canonical Result

- Search pages remained noindex with canonical `https://boilabin.com/search`.
- Category faceted URLs kept canonical category URLs.
- Category URLs with raw filter/sort params still received noindex where the existing SEO helper treats them as faceted.
- `/sitemap.xml` and `/robots.txt` returned `200` in dev and production smoke.

## 13. Image / Runtime Regression Result

No image quality warnings, Tailwind require errors, known broken Unsplash failures, or server-side runtime exceptions were observed in dev/prod smoke.

## 14. Tests Added / Updated

Updated `tests/search-params.test.ts` with no-DB coverage for:

- Valid category listing filters.
- Malformed category listing filters.
- Valid public product API params.
- Malformed public product API page/limit/sort/price/rating/category params.
- Repeated URLSearchParams behavior.
- API product ID capping and unsafe token rejection.

Full test count increased to `210` passing tests.

## 15. Validation Command Results

- `npm run db:url:safety` -> passed; no database connection attempted.
- `npm run db:prisma:local:validate` -> passed.
- `npm run db:prisma:local:generate` -> passed.
- `npm run typecheck` -> passed.
- `npm run lint` -> passed.
- `npm test` -> passed, `210` tests.
- `npm run build` -> passed.

## 16. Dev / Production Smoke Results

Dev smoke on `127.0.0.1:3137` passed:

- Public category routes returned `200`.
- Malformed category query URLs returned `200`, not `500`.
- Public product API malformed query URLs returned `200`, not `500`.
- Public search malformed URL returned `200`.
- Product detail route returned `200`.
- `/admin/dashboard` returned `307` unauthenticated redirect.
- `/deals` and `/api/admin/flash-sales` returned `404`.
- `/sitemap.xml` and `/robots.txt` returned `200`.

Production smoke on `127.0.0.1:3138` passed:

- Malformed category query URLs returned `200`.
- Malformed product API query URLs returned `200`.
- Public search malformed URL returned `200`.
- `/deals` and `/api/admin/flash-sales` returned `404`.
- `/sitemap.xml` and `/robots.txt` returned `200`.

## 17. Files Changed

- `src/backend/catalog/search-params.ts`
- `src/app/api/products/route.ts`
- `src/app/(store)/category/[slug]/page.tsx`
- `tests/search-params.test.ts`
- `audit-reports/108_CATALOG_CATEGORY_API_QUERY_PARAM_HARDENING.md`

## 18. Files Intentionally Left Untouched

- Footer/newsletter visual work.
- Payment-logo visual assets.
- Category image assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Payment, tracking, seller marketplace, product lifecycle migration, CSP enforcement, distributed rate limiting, mobile app implementation.
- Authenticated admin password/session flows.
- Prisma schema and migrations.

## 19. Prohibited Files / Actions Check

Not performed:

- No migrations, seed, reset, db push, destructive SQL, Docker setup, deploy, GitHub/fetch/pull/remote restore.
- No secrets, full DB URLs, tokens, passwords, cookies, session artifacts, payment secrets, or customer/order PII printed.
- No visual/assets files staged, modified, restored, deleted, regenerated, or renamed.

## 20. Remaining Risks

- Other non-catalog public APIs may still benefit from a later scoped query-param audit, especially coupon amount parsing and review/product-id handling.
- Authenticated admin browser QA remains externally blocked.
- Product API rating params remain ignored as before; this step preserved existing behavior instead of adding a new filter.
- Category metadata intentionally uses raw query presence for faceted noindex preservation, while runtime filtering uses sanitized params.

## 21. Commit Hash

Step 108 commit hash is available after commit from:

```bash
git log -1 --oneline
```
