# Step 107 Search Param Hardening

## Scope

Hardened public `/search` query parameter parsing so malformed buyer-controlled params cannot pass `NaN`, unsafe page offsets, unsupported sort values, or invalid filter values into Prisma.

## Step 106 Verification

- Latest commit before Step 107 work: `5d16b4b docs: add public search and buyer interaction qa`.
- Step 106 report identified malformed `/search` params as the remaining public-storefront regression.

## Flash Deals Removal Verification

Active Flash Deals route/code removal remains intact.

- Flash terms outside audit reports matched only Flash-removal tests and historical Prisma migrations.
- `/deals` returned `404` in dev and production smoke.
- `/api/admin/flash-sales` returned `404` in dev and production smoke.

## Authenticated Admin Blocker Handling

No authenticated admin/browser login work was attempted in this step. Existing authenticated admin QA blockers remain outside scope and should be handled only after the approved auth/session setup path is available.

## Root Cause

`src/app/(store)/search/page.tsx` parsed untrusted query params inline:

- `parseInt(params.page ?? '1')` could produce `NaN`.
- `skip = (page - 1) * limit` could therefore become `NaN`.
- `parseFloat(params.rating)` could produce `NaN`.
- Unsupported sort/page/price/category values were not centrally bounded before Prisma query construction.

The Step 106 example `/search?q=phone&page=not-a-number&minPrice=bad` could trigger a server failure because invalid pagination reached Prisma.

## Fix

Added `src/backend/catalog/search-params.ts` with a no-DB parser that:

- Defaults malformed, zero, negative, decimal, or unsafe page values to page `1`.
- Caps very large page values at `1000`.
- Accepts only known sort values and falls back to `popular`.
- Parses finite non-negative prices only and caps very large price values.
- Ignores malformed ratings and allows only ratings from `1` through `5`.
- Trims/caps search text to a bounded length.
- Accepts safe slug-like category filters only.
- Treats `inStock` and `featured` as enabled only when exactly `true`.
- Produces sanitized `queryParams` for filter UI, pagination URLs, and search metadata.

Updated the search page to use the parsed values for Prisma filters, sorting, pagination, filter UI state, pagination links, and metadata.

## Tests Added

Added `tests/search-params.test.ts` covering:

- Valid buyer search params preserved.
- Malformed `page`, `minPrice`, `maxPrice`, `rating`, and `sort` safely defaulted or ignored.
- Huge page and price values bounded.
- Zero, negative, and decimal pages rejected.
- Inverted price ranges remain safe without rewriting buyer intent.
- Long query text capped.
- Invalid category slug ignored.
- Repeated params use the first value.

## Dev Smoke Results

Dev server on `127.0.0.1:3127`:

- `/search` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&page=not-a-number&minPrice=bad` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&page=0` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&page=-5` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&sort=unknown` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&sort=price_asc` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&minPrice=50000&maxPrice=1000` -> `200`, search `noindex` present, canonical search URL present.
- `/deals` -> `404`.
- `/api/admin/flash-sales` -> `404`.
- `/sitemap.xml` -> `200`.
- `/robots.txt` -> `200`.

## Production Smoke Results

Production build/start on `127.0.0.1:3128`:

- `/search?q=phone&page=not-a-number&minPrice=bad` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&sort=unknown` -> `200`, search `noindex` present, canonical search URL present.
- `/search?q=phone&minPrice=50000&maxPrice=1000` -> `200`, search `noindex` present, canonical search URL present.
- `/deals` -> `404`.
- `/api/admin/flash-sales` -> `404`.
- `/sitemap.xml` -> `200`.
- `/robots.txt` -> `200`.

The production smoke wrapper exited nonzero during cleanup after route responses were captured, but no route failure was observed.

## Validation Results

- `npm run db:url:safety` -> passed; no database connection attempted; app and shadow URL shapes classify local and separate.
- `npm run db:prisma:local:validate` -> passed.
- `npm run db:prisma:local:generate` -> passed.
- `npm run typecheck` -> passed.
- `npm run lint` -> passed.
- `npm test` -> passed, `204` tests.
- `npm run build` -> passed.

## Files Changed

- `src/app/(store)/search/page.tsx`
- `src/backend/catalog/search-params.ts`
- `tests/search-params.test.ts`
- `audit-reports/107_SEARCH_PARAM_HARDENING.md`

## Files Intentionally Untouched

- Footer/newsletter/payment-logo/category image assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Prisma schema and migrations.
- Payment, tracking, seller marketplace, product lifecycle, mobile app, CSP enforcement, and distributed rate-limiting code.
- Auth/session/admin password setup.

## Remaining Risks

- Search still depends on database-backed runtime data; this step hardens query parsing but does not add DB-backed authenticated tests.
- `/api/products` and category route query parsing still have separate inline parsing surfaces and should be reviewed in a later scoped step.
- The production smoke wrapper should be made more robust later, although the route responses were captured successfully.

## Recommended Next Step

Proceed with a focused public catalog/category/API query-param hardening audit for other buyer-facing listing surfaces, or pause for manual review before staging Step 107.
