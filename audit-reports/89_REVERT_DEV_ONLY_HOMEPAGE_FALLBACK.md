# Step 89 Revert Dev-Only Homepage Fallback

## Scope

Step 89 emergency-rolls back the Step 88 runtime implementation that added a development-only storefront homepage DB fallback.

The goal is to restore the real DB-backed homepage behavior and remove the fake/empty fallback path.

## Why Step 88 Was Reverted

Step 88 made `npm run dev` render the storefront homepage without local PostgreSQL by returning empty/static fallback data when the local database was unavailable.

That made the homepage usable technically, but it also removed real DB-backed homepage content from the rendered page in development, including banners, products, featured/sale content, real categories, product counts, and other storefront data. This was not acceptable because it visually misrepresented the real homepage.

## Fake / Empty Data Confirmation

The Step 88 fallback intentionally returned:

- empty banners
- empty product lists
- no flash sale
- static category shell data
- zero product counts

This behavior has now been removed.

## Runtime Files Restored / Removed

Restored to the parent of Step 88:

- `src/app/(store)/page.tsx`

Removed Step 88 fallback implementation files:

- `src/backend/storefront/homepage-dev-fallback.ts`
- `tests/homepage-dev-fallback.test.ts`

Kept as historical documentation:

- `audit-reports/88_DEV_ONLY_STOREFRONT_DB_FALLBACK.md`

## Real Homepage Behavior

The homepage data loader is restored to the real DB-backed behavior from before Step 88. It now depends on Prisma/database reads again for homepage categories, banners, products, pinned product lists, and flash-sale data.

This means `npm run dev` may again show the Prisma local DB error until PostgreSQL is installed/running/reachable.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted. DB URLs classify local and separate by URL shape.
- `npm run db:prisma:local:validate` - passed. Prisma schema is valid through the local env guardrail.
- `npm run db:prisma:local:generate` - initially failed with a Windows `EPERM` rename error because a leftover repo-local Next dev server held the Prisma DLL. The leftover repo-local Node/Next processes were stopped, then `npm run db:prisma:local:generate` passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed. Next.js reported no ESLint warnings or errors.
- `npm test` - passed. 175 tests passed, 0 failed.
- `npm run build` - failed only because production-mode static generation could not reach PostgreSQL at `localhost:5432`.

## Build Result Classification

`npm run build` compiled successfully, then failed during DB-backed static generation because PostgreSQL is unreachable at `localhost:5432`.

This is the known local DB service blocker and is expected after restoring the real DB-backed homepage behavior.

## Dev Check Result

Controlled `npm run dev` check:

- Requested `http://localhost:3000/`.
- Response status: `500`.
- Response/stdout contained the Prisma local DB reachability error.
- Error pointed to `src/app/(store)/page.tsx` in `getHomeData` at the category loading path.
- This confirms the Step 88 fallback was removed and the homepage is using the real DB-backed path again.
- Dev server was stopped after the check.

## Paused Visual/Assets Confirmation

No paused visual/assets files were intentionally edited, staged, committed, restored, regenerated, optimized, compressed, normalized, renamed, or deleted by Step 89:

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
- Step 85's Toys & Collectibles taxonomy remains the intended replacement direction.

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

## Recommended Next Step

Install/enable local PostgreSQL tooling before expecting the real homepage to render locally. Until then, continue only with non-DB technical tasks or resolve the paused visual/assets work through dedicated exact-file decisions.
