# Step 90 Restore Committed Visual Baseline

## Scope

Step 90 restored the remaining uncommitted paused visual/assets work back to the committed HEAD versions.

This was an emergency working-tree cleanup after earlier footer/newsletter/payment/category-image experiments left visual changes dirty and affecting local development.

## Files Reverted to HEAD

The following exact paths were restored:

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

## Restore Method

An exact-path `git restore -- ...` command was used for only the listed paused visual/assets files.

No broad restore/reset was used:

- No `git reset --hard`
- No broad `git restore .`
- No broad staging
- No `git add .`
- No `git add -A`

## Visual Baseline Verification

After the exact restore, `git diff --name-only -- ...` for all listed restored files returned no output.

`git status --short` was clean before this audit report was created.

## Baby & Kids / Toys & Collectibles Verification

`public/assets/categories/baby-kids.jpg` was not restored.

The Toys & Collectibles taxonomy remains intact:

- `prisma/seed.ts` still creates `toys-collectibles` with name `Toys & Collectibles`.
- `src/shared/category-media.ts` still maps `toys-collectibles` to `/assets/categories/gaming.jpg`.
- `src/frontend/components/category/category-config.tsx` still contains `toys-collectibles`.
- `tests/category-media.test.ts` still asserts the deleted Baby & Kids image is not used.

Active source search did not find active media mapping to `/assets/categories/baby-kids.jpg`.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed. 175 tests passed, 0 failed.
- `npm run build` - failed only because DB-backed static generation could not reach PostgreSQL at `localhost:5432`.

## Build Result Classification

`npm run build` compiled successfully, then failed during DB-backed static generation with Prisma `Can't reach database server at localhost:5432` errors.

This matches the known local PostgreSQL service blocker and is not classified as a new code failure.

## Dev Runtime Note

`npm run dev` still needs local PostgreSQL for the real DB-backed homepage to render. No fallback data was added.

## DB / Migration / Deployment Confirmation

- No database schema mutation was made.
- No Prisma migration command was run.
- No `prisma db push` command was run.
- No seed command was run.
- No reset/destructive SQL command was run.
- No Docker setup command was run.
- No deployment command was run.
- No secrets, full database URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.

## Remaining Blocker

Local PostgreSQL service readiness remains blocked until PostgreSQL or Docker is installed/enabled and reachable at the configured local database host/port.

## Recommended Next Step

Install or enable local PostgreSQL/Docker, then rerun the local DB readiness and production build checks. Until then, continue only non-DB tasks that do not require storefront DB-backed rendering.
