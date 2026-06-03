# Step 117 - Storefront Media Stability And Remaining Remote-Media Audit

## Scope

Post-repair audit for Step 116 storefront media stability and remaining remote media dependencies.

This step did not replace, download, generate, redesign, optimize, delete, or rename images. It added a dependency-free inventory script and a no-network test guardrail so the accepted remaining remote media risk stays visible without blocking current development.

## Latest Commit Verified

- Latest commit before edits: `0e07b39 fix: restore storefront image source of truth`
- Initial `git status --short`: clean.
- Initial staged files: none.

## Files Changed

Added:

- `scripts/audit-storefront-media-sources.mjs`
- `tests/storefront-media-remote-policy.test.ts`
- `audit-reports/117_STOREFRONT_MEDIA_STABILITY_REMOTE_MEDIA_AUDIT.md`

No runtime app/source behavior was changed.

## Step 116 Stability Verdict

Step 116 media source-of-truth remained stable.

- Canonical category local assets still exist.
- iPhone and Galaxy local banner assets still exist.
- `public/assets/categories/baby-kids.jpg` is still absent.
- Toys & Collectibles still uses `/assets/categories/toys-collectibles.jpg`.
- Retired iPhone/Galaxy hero remote URLs are not present in active seed hero banner references.
- Flash Deals remains removed; `/deals` and `/api/admin/flash-sales` both returned 404 in dev and production smoke/browser checks.

## Category Asset Verification

The inventory guardrail confirmed these public assets exist:

- `/assets/categories/electronics.jpg`
- `/assets/categories/fashion.jpg`
- `/assets/categories/home-appliances.jpg`
- `/assets/categories/beauty-health.jpg`
- `/assets/categories/sports-fitness.jpg`
- `/assets/categories/books-stationery.jpg`
- `/assets/categories/gaming.jpg`
- `/assets/categories/toys-collectibles.jpg`

Direct local asset-resolution probe returned `200 image/jpeg` for each category asset.

## Hero/Banner Asset Verification

The inventory guardrail confirmed these public assets exist:

- `/assets/banners/home-hero-iphone-15-pro.jpg`
- `/assets/banners/home-hero-galaxy-s24-ultra.jpg`

Direct local asset-resolution probe returned `200 image/jpeg` for both banner assets.

## Baby-Kids Deletion Verification

`public/assets/categories/baby-kids.jpg` was not restored.

The new test explicitly asserts this file remains absent and that the legacy `baby-kids` slug does not silently point back to `/assets/categories/baby-kids.jpg`.

## Toys & Collectibles Status

Toys & Collectibles has its own slug-specific source path:

- `/assets/categories/toys-collectibles.jpg`

Current accepted risk: it still shares the same pixels as Gaming until the user provides or approves distinct Toys & Collectibles artwork.

## Remaining Remote Media Inventory

Source/seed/script inventory from `scripts/audit-storefront-media-sources.mjs`:

- Active storefront hero/banner remote dependency: 1 Sony hero seed URL on `images.unsplash.com`.
- Product seed remote images: 21 `images.unsplash.com` product image URLs.
- Promotional seed remote image: 1 `images.unsplash.com` promo/category-style image URL.
- Brand/logo seed placeholders: 9 `placehold.co` URLs.
- Repair script remote references: exact-match mappings for known broken product/banner URLs; these are repair policy references, not active UI replacements.
- Retired storefront repair references: old iPhone/Galaxy hero remotes remain only in repair mappings so existing stale DB rows can be corrected.
- Next/Image allowed remote patterns: `images.unsplash.com`, `uploadthing.com`, `utfs.io`, `lh3.googleusercontent.com`.
- Category media source: local canonical files for known storefront categories; no active category remote dependency found.

Safe local DB read-only media summary:

- Categories: 8 present, 8 local, 0 remote.
- Banners: 3 present, 2 local, 1 remote (`images.unsplash.com`).
- Active hero banners: iPhone local, Galaxy local, Sony remote.
- Product images: 21 present, 21 remote (`images.unsplash.com`).
- Brand logo/banner fields: 9 present, 9 remote (`placehold.co`).
- Order item images: 1 present, 1 remote (`images.unsplash.com`); values were not printed to avoid exposing order/customer context.
- Return request images: 0 present.

No full DB URLs, secrets, credentials, cookies, tokens, auth headers, or PII were printed.

## Sony Hero Remote Status

Sony hero remains an active storefront remote dependency:

- Status: accepted for now, should be localized before launch if a stable local Sony hero asset is approved.
- Current DB classification: active hero banner, remote, host `images.unsplash.com`.
- Current seed classification: active storefront hero remote.

## Product Seed Remote Image Status

Product seed images remain remote:

- Status: accepted for now and reported by the guardrail.
- Count in source inventory: 21 product seed remote images.
- Count in local DB read-only inventory: 21 product image records, all remote.
- Recommended future action: localize or replace product images through a dedicated product-media step before production launch, with no random image generation.

## Guardrail Added

Added `scripts/audit-storefront-media-sources.mjs`:

- Dependency-free.
- No network calls.
- No DB access.
- No file mutation.
- Reports canonical category/banner asset presence.
- Reports Baby Kids absence.
- Reports Toys & Collectibles slug-specific path and accepted shared-pixel status.
- Inventories remote media references by source file/classification.
- Reports accepted Sony remote and product seed remotes without failing the audit.
- Confirms retired iPhone/Galaxy hero remotes are not present in active seed hero references.

Added `tests/storefront-media-remote-policy.test.ts`:

- Keeps Step 116 category/banner local assets present.
- Keeps Baby Kids absent.
- Keeps Toys & Collectibles canonical.
- Keeps accepted Sony remote visible.
- Keeps product seed remote images visible as accepted current risk.
- Prevents retired iPhone/Galaxy hero remotes from returning to active seed hero references.

## Dev/Prod/Browser Verification Results

Dev smoke:

- `node scripts/local-runtime-smoke.mjs --mode dev --port 3110`: passed.
- Homepage, category, product detail, cart, checkout redirect, track order, products API, product view malformed ID, return request auth boundary, sitemap, and robots passed.
- `/deals`: 404 as expected.
- `/api/admin/flash-sales`: 404 as expected.

Production smoke:

- Rebuilt after dev smoke because `next dev` rewrites `.next`.
- `node scripts/local-runtime-smoke.mjs --mode start --port 3111`: passed.
- `/deals`: 404 as expected.
- `/api/admin/flash-sales`: 404 as expected.

Production browser runtime check:

- `node scripts/local-browser-runtime-check.mjs --mode start --port 3121 --cdp-port 9321`: passed.
- Homepage/category/search/new-arrivals/product/cart/track-order checks passed across mobile/tablet/desktop viewports.
- No broken visible images.
- No console/runtime errors.
- No horizontal overflow.
- Removed Flash routes remained removed.

Direct local public asset probe:

- All Step 116 canonical category and iPhone/Galaxy banner asset paths returned `200 image/jpeg`.

## Validation Results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: initially hit Windows `EPERM` because a repo-local `next dev` process was holding Prisma's query engine file; after stopping only that repo-local process tree, rerun passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 273 tests across 51 suites.
- `npm run build`: passed.
- `node scripts/local-runtime-smoke.mjs --mode dev --port 3110`: passed.
- `npm run build` after dev smoke: passed.
- `node scripts/local-runtime-smoke.mjs --mode start --port 3111`: passed.
- `node scripts/local-browser-runtime-check.mjs --mode start --port 3121 --cdp-port 9321`: passed.

## Prohibited Actions Not Performed

Did not:

- Touch footer files.
- Touch newsletter files.
- Touch payment-logo assets.
- Touch `src/frontend/components/home/PromoSection.tsx`.
- Touch payment, tracking, seller marketplace, product lifecycle, CSP enforcement/default collection, distributed rate limiting, mobile app, or authenticated admin password/session flows.
- Restore `public/assets/categories/baby-kids.jpg`.
- Undo Toys & Collectibles.
- Restore Flash Deals or Flash Sales.
- Run migrations, create migrations, edit Prisma schema, run `db push`, seed/reset, destructive SQL, deployment, package updates, GitHub fetch/pull/remote restore, or broad staging.
- Print secrets, full DB URLs, tokens, cookies, credentials, auth headers, session payloads, payment secrets, private connection strings, or PII.

## Remaining Risks

- Sony hero remains remote and should be localized before launch if a local approved asset is available.
- Product seed/product image data remains remote.
- Brand/logo seed placeholders remain remote.
- Existing order item image data may contain remote product image URLs from earlier local test data.
- Toys & Collectibles uses a slug-specific file but still shares Gaming pixels.
- Next/Image allowlist still permits planned/current external hosts for uploads/OAuth/product images; this should be narrowed only after product/admin upload policy is finalized.

## Recommended Next Step

Step 118 should be a docs-only or planning-only decision on whether to localize remaining product/Sony/brand media before launch, or to pause media work and proceed to the next non-visual technical roadmap item. Do not download or replace remote media until the exact desired assets are approved.
