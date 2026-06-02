# Step 88 Dev-Only Storefront DB Fallback

## Scope

Step 88 added a narrow development-only fallback for the storefront homepage so `npm run dev` can render `/` when local PostgreSQL is unavailable at `localhost:5432`.

This is not a production/staging fallback. It does not fake production readiness and does not change admin, checkout, order, auth, payment, tracking, seller, account, mobile API, product lifecycle, or database schema behavior.

## Root Cause

The local dev homepage crashed because `src/app/(store)/page.tsx` loaded homepage data through Prisma calls in `getHomeData`, including `db.category.findMany()`, `db.banner.findMany()`, product queries, and flash-sale queries.

When local PostgreSQL was unavailable, Prisma raised `PrismaClientInitializationError: Can't reach database server at localhost:5432` before the homepage shell could render.

## Files Changed

- `src/app/(store)/page.tsx`
- `src/backend/storefront/homepage-dev-fallback.ts`
- `tests/homepage-dev-fallback.test.ts`
- `audit-reports/88_DEV_ONLY_STOREFRONT_DB_FALLBACK.md`

## Fallback Behavior Added

- Added `src/backend/storefront/homepage-dev-fallback.ts`.
- Added narrow Prisma connectivity-error detection.
- Added a development-only local TCP reachability preflight for local `DATABASE_URL` host/port.
- If `NODE_ENV === 'development'` and the configured local DB endpoint is unreachable, the homepage returns safe empty/static storefront data before Prisma queries run.
- If the preflight says the local DB port is reachable but Prisma still raises a recognized DB connectivity error, the homepage can still fallback in development.
- Production/test behavior stays strict: the same errors are not swallowed outside development.
- Non-DB coding errors are not swallowed.
- Fallback data includes static category shell data only; it does not create fake products, users, orders, payments, sellers, or tracking data.

## Why Development-Only

- `shouldUseHomepageDevFallbackBeforeDb` returns `false` unless `NODE_ENV === 'development'`.
- `shouldUseHomepageDevFallback` returns `false` for production and test mode.
- `npm run build` still runs production-mode static generation and fails if PostgreSQL is unreachable.
- This keeps production/staging DB failures loud and prevents accidental launch masking.

## What Still Fails Without Real PostgreSQL

- Production build/static generation still fails when DB-backed routes need PostgreSQL.
- DB-backed category/search/product/admin/account/checkout/order pages still require a real local DB.
- Full browser visual QA remains incomplete until DB-backed pages can be rendered or each visual area is isolated safely.
- The homepage fallback shows empty/default data, not real product/category counts from the database.

## Homepage Dev Smoke Result

Controlled `npm run dev` smoke check:

- Requested `http://localhost:3000/`.
- Response status: `200`.
- Response contained no `PrismaClientInitializationError`, `Can't reach database server`, or `localhost:5432` text.
- Dev stdout contained no Prisma reachability error text.
- Dev stderr contained the sanitized fallback warning: `Development storefront fallback active...`.
- Dev server was stopped after the smoke check.

Observed non-blocking dev warnings:

- Next.js warned that category image `quality` values `82` and `84` are not configured in `images.qualities` and will be required starting in Next.js 16. This was not changed in Step 88.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted. DB URLs classify local and separate by URL shape.
- `npm run db:prisma:local:validate` - passed. Prisma schema is valid through the local env guardrail.
- `npm run db:prisma:local:generate` - passed. Prisma Client generated through the local env guardrail.
- `npm run typecheck` - passed after tightening helper env typings.
- `npm run lint` - passed. Next.js reported no ESLint warnings or errors.
- `npm test` - passed. 182 tests passed, 0 failed.
- `npm run build` - failed only because production-mode static generation could not reach PostgreSQL at `localhost:5432`.

## Build Result Classification

`npm run build` compiled successfully, then failed during DB-backed static generation because PostgreSQL is unreachable at `localhost:5432`.

This is expected and intentional for Step 88 because the fallback is development-only.

## Tests Added / Updated

Added `tests/homepage-dev-fallback.test.ts` covering:

- Prisma DB-unreachable error triggers fallback in development.
- The same error is not swallowed in production/test mode.
- Non-DB coding errors are not swallowed.
- Local DB endpoint preflight is development-only.
- Remote-looking DB endpoints do not trigger the preflight fallback.
- Fallback categories do not reference `/assets/categories/baby-kids.jpg`.
- Toys & Collectibles fallback remains mapped safely.
- The fallback warning is sanitized and logged once.

## Paused Visual/Assets Confirmation

Paused visual/assets files were not edited, staged, committed, restored, regenerated, optimized, compressed, normalized, renamed, or deleted by Step 88:

- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

## Baby & Kids Confirmation

- `public/assets/categories/baby-kids.jpg` was not restored.
- Toys & Collectibles remains the replacement direction from Step 85.
- `toys-collectibles` continues to use `/assets/categories/gaming.jpg` as a temporary safe fallback image.

## DB / Migration / Deployment Confirmation

- No database schema mutation was made.
- No Prisma migration command was run.
- No `prisma db push` command was run.
- No seed command was run.
- No reset/destructive SQL command was run.
- No Docker setup command was run.
- No deployment command was run.
- No secrets, full database URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.

## Remaining Dirty Files

Expected paused visual/assets files remain dirty:

- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

## Remaining Blocker

Local PostgreSQL service readiness remains blocked:

- Docker unavailable
- Docker Compose unavailable
- `psql` unavailable
- PostgreSQL unreachable at `localhost:5432`

The homepage can now render in `npm run dev` with fallback data, but DB-backed production build and full DB-backed route testing still require a real local database.

## Recommended Next Step

Use `npm run dev` for limited local homepage browsing while DB tooling is unavailable. Next, either resolve the paused visual/assets work with exact-file revert/QA steps, or install local PostgreSQL tooling outside Codex before returning to DB-backed testing and migration work.
