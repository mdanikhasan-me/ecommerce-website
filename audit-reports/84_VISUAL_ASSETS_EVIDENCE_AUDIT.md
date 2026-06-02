# Step 84 Visual Assets Evidence Audit

## Scope

Step 84 is an audit-only evidence pass for the remaining paused visual/assets work in the working tree. It does not approve, reject, stage, commit, revert, delete, regenerate, optimize, normalize, rename, or redesign any visual asset or component.

## Audit-Only Confirmation

- No runtime/source behavior was intentionally changed by this step.
- No paused visual/assets files were edited by this step.
- No files were staged or committed by this step.
- No Docker, SQL, Prisma migration, seed, reset, db push, deployment, image optimization, SVG normalization, or visual redesign command was run.

## Files Changed By Step 84

- `audit-reports/84_VISUAL_ASSETS_EVIDENCE_AUDIT.md`

## Starting Git Status Summary

`git status --short` showed only the expected paused visual/assets tracked files:

```text
 D public/assets/categories/baby-kids.jpg
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

`git diff --cached --name-only` was empty at the beginning of the audit.

## Exact Remaining Dirty Files

### Paused Category Images

- `public/assets/categories/baby-kids.jpg` - deleted
- `public/assets/categories/beauty-health.jpg` - modified
- `public/assets/categories/books-stationery.jpg` - modified
- `public/assets/categories/electronics.jpg` - modified
- `public/assets/categories/fashion.jpg` - modified
- `public/assets/categories/sports-fitness.jpg` - modified

### Paused Payment Logo SVGs

- `public/assets/payments/bkash.svg` - modified
- `public/assets/payments/mastercard.svg` - modified
- `public/assets/payments/nagad.svg` - modified
- `public/assets/payments/visa.svg` - modified

### Paused Footer/Newsletter/Promo Components

- `src/frontend/components/home/PromoSection.tsx` - modified
- `src/frontend/components/layout/Footer.tsx` - modified
- `src/frontend/components/layout/NewsletterForm.tsx` - modified

## Staged Files Status

No files were staged at the start of Step 84. No files were staged during Step 84.

## Footer/Newsletter/PromoSection Diff Summary

### `src/frontend/components/layout/Footer.tsx`

- Removed the `'use client'` directive.
- Removed the previous `PAYMENT_GATEWAYS` import/use.
- Added `NewsletterForm` import and renders `<NewsletterForm source="footer" />`.
- Added local constants for contact items, legal links, and footer payment logos.
- Added direct payment logo paths for bKash, Nagad, Visa, and Mastercard.
- Added helper components for social links and payment logos.
- Reworked footer structure, contact area, newsletter placement, payment logo rendering, legal links, and copyright text.
- Uses direct `<img>` tags for payment logos with fixed 1200x800 intrinsic dimensions and lazy loading.
- Does not include the existing Cash on Delivery payment asset in the new direct footer logo list.

### `src/frontend/components/layout/NewsletterForm.tsx`

- Renamed exported component from `HomepageNewsletterForm` to `NewsletterForm`.
- Added a `source` prop with default value `footer`.
- Changed newsletter POST body from hardcoded homepage source to the provided `source` value.
- Changed input/button copy, sizing, spacing, and classes for compact footer use.

### `src/frontend/components/home/PromoSection.tsx`

- Removed the `Mail` icon import.
- Removed the `HomepageNewsletterForm` import.
- Removed the exported `NewsletterSection` component.
- The removed section was a standalone homepage newsletter block, so this is a visible page-content change and should remain paused until explicitly reviewed.

## Payment Logo SVG Size Summary

Current working-tree SVG file sizes:

| File | Current Size |
| --- | ---: |
| `public/assets/payments/bkash.svg` | 8021 bytes |
| `public/assets/payments/cod.svg` | 288 bytes |
| `public/assets/payments/mastercard.svg` | 931 bytes |
| `public/assets/payments/nagad.svg` | 4619 bytes |
| `public/assets/payments/visa.svg` | 1493 bytes |

Current modified SVG root dimensions:

| File | Root Dimensions / ViewBox |
| --- | --- |
| `bkash.svg` | `width="1200" height="800" viewBox="-37.0635 -39.1825 321.217 235.095"` |
| `nagad.svg` | `width="1200" height="800" viewBox="-45 -32.75825 390 196.5495"` |
| `visa.svg` | `width="1200" height="800" viewBox="-74.7 -40.204 647.4 241.224"` |
| `mastercard.svg` | `width="1200" height="800" viewBox="-96 -98.908 832 593.448"` |

Payment asset diff stat:

```text
public/assets/payments/bkash.svg      | 2 +-
public/assets/payments/mastercard.svg | 6 +-----
public/assets/payments/nagad.svg      | 2 +-
public/assets/payments/visa.svg       | 2 +-
```

## Category JPG Size / Status Summary

Current working-tree JPG file sizes:

| File | Current Status / Size |
| --- | ---: |
| `public/assets/categories/baby-kids.jpg` | deleted from working tree |
| `public/assets/categories/beauty-health.jpg` | 296842 bytes |
| `public/assets/categories/books-stationery.jpg` | 324069 bytes |
| `public/assets/categories/electronics.jpg` | 277495 bytes |
| `public/assets/categories/fashion.jpg` | 384111 bytes |
| `public/assets/categories/gaming.jpg` | 44990 bytes |
| `public/assets/categories/home-appliances.jpg` | 90722 bytes |
| `public/assets/categories/sports-fitness.jpg` | 265190 bytes |

Category image diff stat:

```text
public/assets/categories/baby-kids.jpg        | Bin 74211 -> 0 bytes
public/assets/categories/beauty-health.jpg    | Bin 243138 -> 296842 bytes
public/assets/categories/books-stationery.jpg | Bin 38796 -> 324069 bytes
public/assets/categories/electronics.jpg      | Bin 84710 -> 277495 bytes
public/assets/categories/fashion.jpg          | Bin 88204 -> 384111 bytes
public/assets/categories/sports-fitness.jpg   | Bin 82169 -> 265190 bytes
```

## Reference / Import Search Results

### Newsletter Component Names

Active source references:

- `src/frontend/components/layout/NewsletterForm.tsx` defines `NewsletterForm`.
- `src/frontend/components/layout/Footer.tsx` imports and renders `NewsletterForm`.

No active source references to `HomepageNewsletterForm` or `NewsletterSection` were found. Historical audit reports still mention both old names.

### Category Images

Active source references in `src/shared/category-media.ts`:

- `electronics` -> `/assets/categories/electronics.jpg`
- `fashion` -> `/assets/categories/fashion.jpg`
- `beauty-health` -> `/assets/categories/beauty-health.jpg`
- `sports-fitness` -> `/assets/categories/sports-fitness.jpg`
- `books-stationery` -> `/assets/categories/books-stationery.jpg`
- `baby-kids` -> `/assets/categories/baby-kids.jpg`

`baby-kids.jpg` is still referenced by active code while deleted from the working tree.

### Payment Logos

Active source references:

- `src/shared/assets.ts` references `bkash.svg`, `nagad.svg`, `visa.svg`, and `mastercard.svg`.
- `src/frontend/components/layout/Footer.tsx` directly references `bkash.svg`, `nagad.svg`, `visa.svg`, and `mastercard.svg`.
- CSP tests reference `/assets/payments/visa.svg` as a static asset path.

## Risk Findings

### `baby-kids.jpg` Deletion

Dangerous. `src/shared/category-media.ts` still maps the `baby-kids` category slug to `/assets/categories/baby-kids.jpg`, and the helper returns that local asset path without checking whether the file exists. If a buyer-visible baby/kids category card or category page uses that slug, the image can 404.

### Component Export / Content Changes

Risky enough to keep paused. Active source no longer imports the old `HomepageNewsletterForm` or `NewsletterSection` names, so this does not appear to be a compile-time break from the current repo search. However, the changes remove a homepage newsletter section and move/reshape newsletter behavior into the footer, which is a visual and content-flow change requiring dedicated browser screenshot QA before commit.

### Payment Logo Changes

Moderate visual risk. The SVGs are small enough in byte size, but all four modified logos now use large 1200x800 root dimensions and need footer rendering QA for crop, scaling, sharpness, brand correctness, contrast, and customer trust. The new footer direct list also excludes the existing `cod.svg` asset, which may be an intentional design choice or a regression depending on the intended payment messaging.

### Category Image Changes

High review risk. Five category images were replaced with substantially larger binaries, and one referenced asset is deleted. These require provenance/licensing review, visual crop/fit checks, responsive image checks, compression/weight review, and an explicit decision on restoring or intentionally removing `baby-kids.jpg`.

## Recommendation

Recommended next path: keep these visual/assets changes paused and split them into dedicated visual QA decisions instead of committing them together.

Suggested order:

1. Category-image QA first, because `baby-kids.jpg` deletion has an active source reference and can produce a broken image.
2. Footer/newsletter/PromoSection browser screenshot QA, because the component changes are visible layout/content changes.
3. Payment-logo QA, because the SVG changes affect trust-facing payment messaging and logo rendering.

Do not revert or commit any of these paused files without explicit user approval for that specific visual/assets step.

## Validation Results

- `npm run db:url:safety` - passed. No database connection attempted. `DATABASE_URL` and `SHADOW_DATABASE_URL` classified local, separate, and local migration ready by URL shape.
- `npm run db:prisma:local:validate` - passed. Prisma schema is valid through the local env guardrail.
- `npm run db:prisma:local:generate` - passed. Prisma Client generated through the local env guardrail.
- `npm run typecheck` - passed.
- `npm run lint` - passed. Next.js reported no ESLint warnings or errors.
- `npm test` - passed. 173 tests passed, 0 failed.
- `npm run build` - failed only at DB-backed static generation because Prisma could not reach PostgreSQL at `localhost:5432`.

## Build Result Classification

`npm run build` compiled successfully, then failed while generating static pages because DB-backed data loaders attempted Prisma queries and the local PostgreSQL service was unreachable at `localhost:5432`.

This matches the known environment blocker from the recent local DB readiness steps. No new build failure was identified from Step 84's report-only audit work.

## Prohibited Actions Confirmation

- No paused visual/assets files were modified by Step 84.
- No file was staged.
- No file was committed.
- No broad staging command was run.
- No `.env` or `.env.local` file was touched.
- No secrets, full database URLs, tokens, passwords, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.
- No Prisma schema or migration file was touched.
- No Docker, SQL, migration, seed, reset, db push, deployment, image optimization, SVG normalization, or visual redesign command was run.

## Remaining Risks

- The working tree still contains paused visual/assets changes.
- `baby-kids.jpg` deletion remains the clearest broken-asset risk.
- Visual correctness cannot be accepted from text evidence alone; browser screenshot QA is still required before any visual commit.
- Build remains expected to fail until local PostgreSQL is reachable, unless the build is changed later to avoid DB-backed static generation during unavailable local DB conditions.

## Recommended Next Step

Run a dedicated category-image QA step that inspects current category image rendering and decides whether to restore or intentionally remove `baby-kids.jpg`. Keep footer/newsletter and payment-logo work paused until their own focused visual QA steps.
