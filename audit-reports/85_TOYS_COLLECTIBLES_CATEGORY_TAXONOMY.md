# Step 85 Toys & Collectibles Category Taxonomy

## Scope

Step 85 replaces the old Baby & Kids category direction with a new Toys & Collectibles main-category direction where this can be done safely without database access. This is a focused category taxonomy and media-reference step.

This step is not a footer redesign, payment-logo step, DB migration step, seed execution step, broad visual-assets commit, payment/tracking/seller step, or deployment step.

## User Decision

- `public/assets/categories/baby-kids.jpg` should not be restored.
- The old Baby & Kids category direction is intentionally being replaced.
- Preferred new main category: `Toys & Collectibles`
- Preferred slug: `toys-collectibles`

## Category Source-Of-Truth Findings

The repo currently has multiple category-related sources:

- `prisma/seed.ts` provides default seed categories and subcategories for local/dev setup, but it was not executed in this step.
- `src/shared/category-media.ts` is the shared storefront media resolver used by category cards and category pages.
- `src/frontend/components/category/category-config.tsx` provides category page presentation metadata such as icon, eyebrow, summary, and accent colors.
- Storefront category lists are DB-backed at runtime. Existing database rows cannot be renamed or deleted safely until local PostgreSQL is available and a DB-backed migration/admin plan exists.

## Old Category References Found

Active source references before implementation:

- `prisma/seed.ts` created `Baby & Kids` with slug `baby-kids`.
- `src/shared/category-media.ts` mapped `baby-kids` to `/assets/categories/baby-kids.jpg`.
- `src/frontend/components/category/category-config.tsx` had a `baby-kids` presentation config using the Baby icon and Baby & Kids copy.

Historical audit reports also mention `baby-kids` and `baby-kids.jpg`; those are audit history, not runtime source.

## Files Changed

- `prisma/seed.ts`
- `src/frontend/components/category/category-config.tsx`
- `src/shared/category-media.ts`
- `tests/category-media.test.ts`
- `audit-reports/85_TOYS_COLLECTIBLES_CATEGORY_TAXONOMY.md`

The pre-existing intentional deletion of `public/assets/categories/baby-kids.jpg` was adopted for this category replacement decision. The file was not restored.

## New Category Name / Slug / Subcategories

Main category:

- Name: `Toys & Collectibles`
- Slug: `toys-collectibles`

Default future seed subcategories:

- `Hot Wheels` / `hot-wheels`
- `LEGO Sets` / `lego-sets`
- `Diecast Models` / `diecast-models`
- `Action Figures` / `action-figures`
- `Collectible Cards` / `collectible-cards`

## Image / Media Mapping Decision

No dedicated `public/assets/categories/toys-collectibles.jpg` asset exists in the working tree, and this step did not generate, download, restore, optimize, compress, or rename image assets.

To avoid a broken buyer-facing image path:

- `toys-collectibles` now resolves to the existing non-missing `/assets/categories/gaming.jpg` fallback.
- legacy `baby-kids` compatibility also resolves to `/assets/categories/gaming.jpg`.
- active source no longer maps category media to `/assets/categories/baby-kids.jpg`.

This is a safe temporary fallback, not final visual approval for Toys & Collectibles imagery.

## Old `baby-kids` Compatibility

Compatibility remains only as a safe fallback in source:

- `src/shared/category-media.ts` keeps `baby-kids` mapped to the non-missing gaming image fallback.
- `src/frontend/components/category/category-config.tsx` keeps a legacy `baby-kids` presentation fallback with Toys & Collectibles-oriented copy.

This avoids broken rendering if an existing local database still contains a `baby-kids` category row. Full DB cleanup remains blocked until local PostgreSQL is available.

## Missing Image Asset

A dedicated `toys-collectibles` image remains missing. A later visual asset step should provide a properly licensed, compressed, responsive-friendly category image for Toys & Collectibles.

## Tests Added / Updated

Added `tests/category-media.test.ts` covering:

- `toys-collectibles` resolves to a non-missing local image fallback.
- `toys-collectibles` does not resolve to `/assets/categories/baby-kids.jpg`.
- legacy `baby-kids` compatibility does not resolve to `/assets/categories/baby-kids.jpg`.
- legacy `baby-kids` compatibility resolves to an existing local image path.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted. Both DB URLs classify local, separate, and URL-shape ready.
- `npm run db:prisma:local:validate` - passed. Prisma schema is valid through the local env guardrail.
- `npm run db:prisma:local:generate` - passed. Prisma Client generated through the local env guardrail.
- `npm run typecheck` - passed.
- `npm run lint` - passed. Next.js reported no ESLint warnings or errors.
- `npm test` - passed. 175 tests passed, 0 failed.
- `npm run build` - failed only because Prisma could not reach PostgreSQL at `localhost:5432` during DB-backed static generation.

## Build Result Classification

`npm run build` compiled successfully, then failed while prerendering DB-backed pages because local PostgreSQL is unreachable at `localhost:5432`.

This matches the known environment blocker. No new build failure was found from the Toys & Collectibles taxonomy/media-reference changes.

## Paused Files Confirmation

Footer/newsletter/payment-logo paused files were not modified by Step 85:

- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`

The other paused category JPG replacements were not modified by Step 85 and should remain paused unless explicitly reviewed later.

## DB / Migration / Seed / Deployment Confirmation

- No database connection was intentionally attempted.
- No seed command was run.
- No Prisma migration command was run.
- No `prisma db push` command was run.
- No reset/destructive SQL command was run.
- No Docker setup command was run.
- No deployment command was run.

## Remaining Dirty Files

Expected remaining dirty files after committing this Step 85 package:

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

Those files remain paused visual/assets work and should not be staged as part of Step 85.

## Recommended Next Step

After this taxonomy/media-reference commit, run a focused visual asset step for a proper `toys-collectibles` category image. Keep footer/newsletter/payment-logo changes paused until their own visual QA step.
