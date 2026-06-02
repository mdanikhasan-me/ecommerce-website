# Step 87 Remaining Visual Assets Decision Package

## Scope

Step 87 is an audit/report-only decision package for the remaining dirty visual files:

- category JPG replacements
- payment-logo SVG replacements
- footer/newsletter/PromoSection component changes

This step did not edit, stage, commit, revert, delete, optimize, regenerate, normalize, compress, rename, redesign, or otherwise modify the existing visual files.

## Current Git Status Summary

At the start of Step 87, `git status --short` showed only the expected paused visual/assets files:

```text
 M public/assets/categories/beauty-health.jpg
 M public/assets/categories/books-stationery.jpg
 M public/assets/categories/electronics.jpg
 M public/assets/categories/fashion.jpg
 M public/assets/categories/sports-fitness.jpg
 M public/assets/payments/bkash.svg
 M public/assets/payments/mastercard.svg
 M public/assets/payments/nagad.svg
 M public/assets/payments/visa.svg
 M src/frontend/components/home/PromoSection.tsx
 M src/frontend/components/layout/Footer.tsx
 M src/frontend/components/layout/NewsletterForm.tsx
```

`git diff --cached --name-only` was empty at the start.

## Exact Dirty Files

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

## Category JPG Evidence

| File | Status | Current Size | Previous Tracked Size | Dimensions | Risk | Recommendation |
| --- | --- | ---: | ---: | --- | --- | --- |
| `public/assets/categories/beauty-health.jpg` | modified | 296842 bytes | 243138 bytes | 1254x1254 | Medium: larger image, buyer-facing category card. | Keep paused; needs licensing/source, crop, and mobile loading QA. |
| `public/assets/categories/books-stationery.jpg` | modified | 324069 bytes | 38796 bytes | 1254x1254 | High: large size increase from a small previous asset. | Keep paused; do not commit without visual/crop and compression review. |
| `public/assets/categories/electronics.jpg` | modified | 277495 bytes | 84710 bytes | 1254x1254 | High: large size increase on a high-traffic category. | Keep paused; needs mobile-performance and LCP-adjacent review. |
| `public/assets/categories/fashion.jpg` | modified | 384111 bytes | 88204 bytes | 1254x1254 | High: largest current dirty category image. | Keep paused; likely needs compression/format review before commit. |
| `public/assets/categories/sports-fitness.jpg` | modified | 265190 bytes | 82169 bytes | 1254x1254 | High: large size increase and buyer-facing category card. | Keep paused; needs visual and weight QA. |

Category image notes:

- These images are all square `1254x1254`.
- All are bigger than their tracked `HEAD` versions.
- They can affect low-end mobile loading if served directly without enough responsive sizing/caching behavior.
- They should not be committed without browser screenshot approval and asset provenance/licensing confidence.
- `public/assets/categories/baby-kids.jpg` was intentionally deleted in Step 85 and was not restored.
- A dedicated `toys-collectibles` image is still missing; `toys-collectibles` currently falls back to `/assets/categories/gaming.jpg`.

## Payment SVG Evidence

| File | Current Size | Previous Tracked Size | Current Root Dimensions / ViewBox | Previous Root Dimensions / ViewBox | Risk | Recommendation |
| --- | ---: | ---: | --- | --- | --- | --- |
| `public/assets/payments/bkash.svg` | 8021 bytes | 598 bytes | `height="800" width="1200" viewBox="-37.0635 -39.1825 321.217 235.095"` | `width="124" height="114" viewBox="0 0 124 114"` | High: much larger file and changed canvas/mark composition. | Keep paused; needs brand correctness, crop, and footer render QA. |
| `public/assets/payments/mastercard.svg` | 931 bytes | 314 bytes | `height="800" width="1200" viewBox="-96 -98.908 832 593.448"` | `width="1000" height="618" viewBox="0 0 1000 618"` | Medium: changed dimensions and simplified markup. | Keep paused; verify official-looking mark, crop, and contrast. |
| `public/assets/payments/nagad.svg` | 4619 bytes | 13933 bytes | `height="800" width="1200" viewBox="-45 -32.75825 390 196.5495"` | `width="89" height="116" viewBox="0 0 89 116"` | High: smaller bytes but major canvas/shape change. | Keep paused; needs customer-trust and payment-availability review. |
| `public/assets/payments/visa.svg` | 1493 bytes | 852 bytes | `height="800" width="1200" viewBox="-74.7 -40.204 647.4 241.224"` | `viewBox="0 0 1000 324.68"` | Medium: changed canvas and likely render scale. | Keep paused; needs footer render QA before commit. |

Payment-logo notes:

- Current dirty footer code directly references these four SVGs.
- Existing shared payment assets still also reference these SVG paths.
- Dirty footer code excludes `cod.svg` from its direct footer logo list, while `src/shared/assets.ts` still contains Cash on Delivery.
- Payment logos are trust-facing; do not commit without visual approval.

## Footer / Newsletter / PromoSection Diff Summary

### `src/frontend/components/home/PromoSection.tsx`

- Removes the `Mail` import.
- Removes the `HomepageNewsletterForm` import.
- Removes the exported `NewsletterSection` component.
- Visible/content impact: the standalone homepage newsletter section is removed from this component file.
- Compile risk: low from current active-source search, because no active source references `NewsletterSection` or `HomepageNewsletterForm`.
- Product risk: medium because it removes a visible homepage content block.
- Recommendation: keep paused; screenshot-test homepage before committing or revert in a dedicated exact-file step.

### `src/frontend/components/layout/Footer.tsx`

- Removes `'use client'`.
- Removes `PAYMENT_GATEWAYS` dependency from footer payment logo rendering.
- Adds `NewsletterForm`.
- Adds local contact, legal, social, and payment logo constants.
- Rebuilds footer layout, brand mark rendering, contact block, newsletter placement, payment logo rendering, and legal links.
- Directly references bKash, Nagad, Visa, and Mastercard SVGs with large `1200x800` image dimensions.
- Visible/content impact: high; this is a footer redesign/refactor.
- Compile risk: low/medium because it imports the renamed `NewsletterForm`, but browser/runtime visual QA is still required.
- Recommendation: keep paused; do not commit without mobile/tablet/desktop screenshot QA.

### `src/frontend/components/layout/NewsletterForm.tsx`

- Renames export from `HomepageNewsletterForm` to `NewsletterForm`.
- Adds optional `source` prop defaulting to `footer`.
- Changes submitted newsletter source from hardcoded `homepage` to prop value.
- Changes placeholder, aria label, sizing, and button/input classes for compact footer use.
- Visible/content impact: medium; this changes form layout and copy.
- Compile risk: low from current active-source search.
- Recommendation: keep paused with Footer/PromoSection as one footer/newsletter visual QA unit.

## Reference Search Results

Active source references only, excluding historical audit reports:

### Component References

- `src/app/(store)/page.tsx` imports and renders `PromoSection`.
- `src/frontend/components/layout/Footer.tsx` imports and renders `NewsletterForm`.
- `src/frontend/components/layout/NewsletterForm.tsx` defines `NewsletterForm`.
- No active source references to `HomepageNewsletterForm` or `NewsletterSection` were found.

### Payment Logo References

- `src/shared/assets.ts` references `bkash.svg`, `nagad.svg`, `visa.svg`, and `mastercard.svg`.
- Dirty `src/frontend/components/layout/Footer.tsx` directly references the same four SVG paths.
- `tests/csp.test.ts` references `/assets/payments/visa.svg` as a static asset path.

### Category Image References

- `src/shared/category-media.ts` maps:
  - `electronics` -> `/assets/categories/electronics.jpg`
  - `fashion` -> `/assets/categories/fashion.jpg`
  - `beauty-health` -> `/assets/categories/beauty-health.jpg`
  - `sports-fitness` -> `/assets/categories/sports-fitness.jpg`
  - `books-stationery` -> `/assets/categories/books-stationery.jpg`
- `toys-collectibles` remains mapped to `/assets/categories/gaming.jpg`.
- No active source maps category media to `/assets/categories/baby-kids.jpg`.

## Baby & Kids / Toys & Collectibles Confirmation

- `public/assets/categories/baby-kids.jpg` was not restored.
- Step 85's Toys & Collectibles taxonomy remains intact.
- `toys-collectibles` still uses `/assets/categories/gaming.jpg` as a safe temporary fallback.
- A dedicated Toys & Collectibles image remains a future visual asset need.

## Decision Options

### Option A: Keep All Paused

Lowest immediate risk. Leaves the worktree dirty but avoids committing unverified visuals while local DB/browser QA is blocked.

### Option B: Revert All Remaining Paused Visual/Assets

Cleanest worktree option. Should be done only in a dedicated exact-file revert step approved by the user. This would discard current footer/newsletter/payment-logo/category-image experiments.

### Option C: Split And QA Category Images First

Best first visual review if the user wants to keep some asset work. Category images are buyer-facing and several are much larger than HEAD. This still needs browser/screenshot or at least image-source/crop/performance review before commit.

### Option D: Split And QA Footer/Newsletter First

Useful if the footer redesign is the desired next visual outcome. Requires mobile/tablet/desktop screenshot QA and confirmation that homepage newsletter removal is intentional.

### Option E: Split And QA Payment Logos First

Useful only after deciding whether the footer payment display should be direct SVGs or shared `PAYMENT_GATEWAYS`/`PAYMENT_ASSETS`. Logos need brand and trust review before commit.

## Recommended Next Step

Recommended: Option A for now if local DB/browser remains blocked, or Option B if the priority is a clean technical worktree.

If the user wants to continue visual work before local DB is available, choose Option C as the first focused package, because category JPG replacements are isolated assets and have clear size/performance evidence.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted. DB URLs classify local and separate by URL shape.
- `npm run db:prisma:local:validate` - passed. Prisma schema is valid through the local env guardrail.
- `npm run db:prisma:local:generate` - passed. Prisma Client generated through the local env guardrail.
- `npm run typecheck` - passed.
- `npm run lint` - passed. Next.js reported no ESLint warnings or errors.
- `npm test` - passed. 175 tests passed, 0 failed.
- `npm run build` - failed only because Prisma could not reach local PostgreSQL at `localhost:5432` during DB-backed static generation.

## Build Result Classification

`npm run build` compiled successfully, then failed during static generation when Prisma attempted DB-backed reads and local PostgreSQL was unreachable at `localhost:5432`.

This is the known local DB service blocker from Step 86, not a new failure from Step 87's report-only work.

## Prohibited Actions Confirmation

- No existing source files were edited by Step 87.
- No visual assets were edited by Step 87.
- No visual/assets/source file was staged or committed by Step 87 at report creation time.
- No image was restored, generated, downloaded, optimized, compressed, normalized, renamed, or deleted.
- No SVG was normalized.
- No footer/newsletter/payment/category UI redesign was performed.
- No `.env` or `.env.local` file was touched.
- No secrets or full database URLs were printed.
- No Docker setup was run.
- No Prisma migration, db push, seed, reset, destructive SQL, or deployment command was run.
