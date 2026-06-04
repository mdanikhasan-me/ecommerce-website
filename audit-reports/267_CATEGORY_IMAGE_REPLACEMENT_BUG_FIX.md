# Step 267 - Category Image Replacement Bug Fix

## 1. Scope

Step 267 fixed the category image replacement bug where the owner replaced same-named JPG files under `public/assets/categories/`, desktop/tablet showed the new files, but phone/mobile still showed stale category images.

This step did not replace, generate, download, rename, or edit the image pixels. The owner-provided modified JPG files were treated as the intended source of truth.

## 2. Latest Commit Verification

- Latest starting commit: `cde3aea fix: localize remaining storefront product images`
- Starting staged set: empty.
- Private env files were not read.

## 3. Working Tree Status

Before implementation, the only tracked dirty source-of-truth assets were the eight owner-replaced category JPG files. After implementation, dirty files are limited to those eight assets, the category media helper, two focused tests, and Step 267 report/QA artifacts.

## 4. Category Asset File Table

| Category slug | Filename | Exists | Size bytes | Dimensions | SHA-256 | Git status | Modified from tracked |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| `beauty-health` | `beauty-health.jpg` | yes | 169933 | 928x1152 | `5709ce7f5817ccaa06fbf3de56d85b20674c2e6c6522ed36160acb49c8be7276` | `M` | yes |
| `books-stationery` | `books-stationery.jpg` | yes | 135578 | 896x1152 | `9b0fa704b0cb97453ce7fbfef614e1902047e64a9c7ea1d36a417814cff02ed6` | `M` | yes |
| `electronics` | `electronics.jpg` | yes | 73367 | 1086x1448 | `75b478cf761d743fcd63e56e17f91c867c94caa063eaa215f8b74fdc117e2ab8` | `M` | yes |
| `fashion` | `fashion.jpg` | yes | 116357 | 1086x1448 | `50f7092c1d2dc2ca3959c44017e4913477e8eb391a416228e958d7f3085fe001` | `M` | yes |
| `gaming` | `gaming.jpg` | yes | 101254 | 1031x1289 | `1ec2f8930d9a833fbf474d02beb69f16741e9d6fb461b490ea0f245f3c573430` | `M` | yes |
| `home-appliances` | `home-appliances.jpg` | yes | 82979 | 928x1152 | `4ea4173c04ae05614dbbd5f6e68da20a41112f296db98cd56f55759445ad5ce0` | `M` | yes |
| `sports-fitness` | `sports-fitness.jpg` | yes | 200472 | 1086x1448 | `f91b7397630a881ae114abc0812a2d9215998f40dd8e43bd80cc8b776ac59fbf` | `M` | yes |
| `toys-collectibles` | `toys-collectibles.jpg` | yes | 175892 | 1086x1448 | `11993afd8f624de30501ea2a88ad171da8817224657ae0356528862514bf7971` | `M` | yes |

Direct HTTP checks confirmed all eight `/assets/categories/*.jpg` files serve bytes matching the filesystem hashes.

## 5. Category Image Code-Path Trace

- Homepage route: `src/app/(store)/page.tsx` fetches top-level categories and passes them to `FeaturedCategories`.
- Homepage category renderer: `src/frontend/components/home/FeaturedCategories.tsx`.
- Mobile path: `MobileCategoryTile`, visible only below `sm`, renders `next/image` with `sizes="(max-width: 640px) 46vw, 172px"` and `quality={82}`.
- Tablet/desktop path: `CategoryTile`, visible at `sm` and above, renders `next/image` with `sizes="(max-width: 640px) 40vw, (max-width: 1280px) 20vw, 16vw"` and `quality={84}`.
- Both mobile and desktop call `getCategoryMediaPath(category)` from `src/shared/category-media.ts`.
- `/category` renders text accordion rows only; no category photos.
- `/category/[slug]` renders product grids and filters; no category hero/card image.
- DB/seed category images do not override known public slugs because `getCategoryMediaPath()` prefers the local slug map before `category.image`.
- No CSS background image category card path was found.

## 6. Mobile Vs Desktop Loaded URL Evidence

Pre-fix, both mobile and desktop used the same unversioned source file, but different `next/image` optimizer variants:

- Mobile 390 `electronics.jpg`: `/_next/image?url=%2Fassets%2Fcategories%2Felectronics.jpg&w=384&q=82`
- Desktop 1366 `electronics.jpg`: `/_next/image?url=%2Fassets%2Fcategories%2Felectronics.jpg&w=256&q=84`

Post-fix, both mobile and desktop still use the same category source file, but the optimizer cache key now includes the deterministic file version:

- Mobile 390 `electronics.jpg`: `/_next/image?url=%2Fassets%2Fcategories%2Felectronics.jpg%3Fv%3D75b478cf761d&w=384&q=82`
- Tablet 768 `electronics.jpg`: `/_next/image?url=%2Fassets%2Fcategories%2Felectronics.jpg%3Fv%3D75b478cf761d&w=256&q=84`
- Desktop 1366 `electronics.jpg`: `/_next/image?url=%2Fassets%2Fcategories%2Felectronics.jpg%3Fv%3D75b478cf761d&w=256&q=84`

All eight category images passed the versioned URL check at 390, 768, and 1366.

## 7. Cache/Source Investigation Result

`.next/cache/images` existed and contained 272 files during investigation. 193 optimizer cache files were older than the owner-updated `electronics.jpg` timestamp.

`next.config.js` sets a long image optimizer cache TTL. Because the category images were replaced in place with the same filenames, `next/image` could reuse stale optimized variants for one viewport while another viewport requested a different width/quality variant.

The direct public asset route served the current file bytes, so the owner filenames were correct.

## 8. Confirmed Root Cause

The root cause was unversioned same-filename public category assets flowing through `next/image` responsive optimization. Mobile and desktop used the same logical image source but different optimized width/quality variants, so stale mobile optimizer cache entries could survive after replacing files in place.

This was not an owner filename mistake.

## 9. Chosen Durable Fix

The fix centralizes deterministic cache-safe category image URLs in `src/shared/category-media.ts`.

Each canonical category asset now has:

- the local public path,
- a SHA-256 hash prefix version,
- a returned URL shaped like `/assets/categories/electronics.jpg?v=75b478cf761d`.

When `next/image` optimizes that URL, the encoded `url=` value changes after the owner replaces a same-named file and the version is updated. This creates a new optimizer cache key without random timestamps, renaming files, or deleting caches.

## 10. Files Changed

- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/gaming.jpg`
- `public/assets/categories/home-appliances.jpg`
- `public/assets/categories/sports-fitness.jpg`
- `public/assets/categories/toys-collectibles.jpg`
- `src/shared/category-media.ts`
- `tests/category-media.test.ts`
- `tests/storefront-image-source.test.ts`
- `audit-reports/267_CATEGORY_IMAGE_REPLACEMENT_BUG_FIX.md`
- `audit-reports/268_NEXT_PROMPT_DRAFT.md`
- `audit-reports/267-category-image-replacement-qa/`

## 11. Implementation Result

- `getCategoryMediaPath()` now returns versioned URLs for canonical category assets.
- `getCategoryMediaBasePath()` exposes the unversioned local asset path for tests and source-of-truth checks.
- Tests assert that all eight canonical category versions equal the current file SHA-256 prefix.
- Existing source-of-truth tests were updated to compare base paths where unversioned paths are required.

No category card layout/design code was changed.

## 12. Browser Evidence Result

Final browser QA result:

- failure count: `0`
- all eight category image URLs local and versioned at 390, 768, and 1366
- no old unversioned mobile-only category image URL remained
- no horizontal overflow
- no broken visible images after scroll-loading lazy images
- no console errors
- no unexpected failed requests
- `/deals`: 404
- `/api/admin/flash-sales`: 404
- footer YouTube present
- footer bKash, Nagad, Visa, Mastercard present
- footer COD absent

Routes checked at 360, 390, 430, 480, 700, 768, 1024, and 1366:

- `/`
- `/category`
- `/category/electronics`
- `/search?q=phone`
- `/deals`
- `/api/admin/flash-sales`

## 13. Screenshots Captured

Evidence was saved only under `audit-reports/267-category-image-replacement-qa/`:

- `pre-fix-category-image-evidence.json`
- `post-fix-category-image-evidence.json`
- `pre-fix-home-category-390.png`
- `pre-fix-home-category-430.png`
- `pre-fix-home-category-768.png`
- `pre-fix-home-category-1366.png`
- `post-fix-home-category-390.png`
- `post-fix-home-category-430.png`
- `post-fix-home-category-768.png`
- `post-fix-home-category-1366.png`

## 14. Validation Results

Validation completed before commit:

- `git diff --check`: passed
- `node scripts/boilabin-terminal-loop-state.mjs`: passed
- `node scripts/boilabin-advisor-state.mjs`: passed
- `npm run db:url:safety`: passed
- `npm run db:prisma:local:validate`: passed
- `npm run db:prisma:local:generate`: passed after stopping only the local project Node/Next processes that held the Prisma Windows query-engine DLL lock
- `node scripts/audit-local-auth-fixture-readiness.mjs`: passed with `manual-owner-action-required`
- `node scripts/audit-search-verification-readiness.mjs`: passed
- `node scripts/audit-ai-marketing-copy.mjs`: exited `0` with the existing `51` findings
- targeted category/media tests: passed, `11/11`
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed, `389/389`
- `npm run build`: passed
- post-fix browser QA: passed, failure count `0`

## 15. Confirmation No Prohibited Behavior Changed

Confirmed:

- no product, cart, checkout, order, payment, auth, backend/API, product visibility, pricing, stock, filtering, sorting, SEO, sitemap, robots, search-verification, seller, lifecycle, CSP, rate-limit, mobile app, or admin behavior was changed,
- no footer, newsletter, payment-logo, `PromoSection`, product image, or banner image file was changed,
- Flash Deals, `/deals`, and `/api/admin/flash-sales` were not restored,
- no Prisma schema or migration file was touched,
- no migration, db push, seed/reset, destructive SQL, Docker setup, provider CLI, package update, or deployment command was run,
- private env files and secrets were not printed.

## 16. Remaining Risks

- Future same-named category image replacements must update the version value in `src/shared/category-media.ts`; tests will fail if the hash prefix is stale.
- Browser/device caches outside the app can still cache HTML or optimized images, but versioned image URLs make new category pixels addressable and reliable for fresh renders.
- The all-categories page still has no category photos by design; this step did not redesign it.

## 17. Recommended Next Step

Step 268 should perform final human-facing homepage/category image visual acceptance QA using the versioned category URLs and the owner-provided images.
