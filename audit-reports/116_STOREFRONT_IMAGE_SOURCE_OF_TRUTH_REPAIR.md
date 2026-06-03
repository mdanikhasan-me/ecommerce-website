# Step 116 - Storefront Image Source-of-Truth Repair

## 1. Scope

Emergency recovery/repair for storefront category and hero/banner image source-of-truth drift after manual local visual replacement work.

This step was allowed to touch category image assets and hero/banner source references only. It did not redesign the storefront and did not modify footer, newsletter, payment-logo, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app, auth/admin flow, product lifecycle, Prisma schema, or migrations.

## 2. Initial Git State And Latest Commit

- Initial `git status --short`: clean before Step 116 edits.
- Initial staged set: empty.
- Latest verified commit before this step: `32d5588 fix: improve browser runtime and accessibility readiness`.

## 3. Step 115 Verification

- Step 115 remained the latest committed technical baseline before this repair.
- The local browser runtime helper and accessibility readiness changes from Step 115 were still present.

## 4. Flash Deals Removal Verification

Flash Deals remained removed from active routes/source.

- `/deals`: still a removed storefront route in smoke/browser checks.
- `/api/admin/flash-sales`: still a removed API route in smoke/browser checks.
- Text scans found only migration/test references for Flash Deals terms and `/deals`.

## 5. User Clarification Summary

The user clarified that the category JPGs had been manually replaced with the desired images, and the website preview showed those desired images, but source files appeared to drift or become unclear in the editor. The Galaxy/home hero image was also manually changed in the visible website, but its source-of-truth was unclear.

This step treats the currently displayed storefront preview images as the canonical source where recoverable.

## 6. Filesystem Inventory, Hashes, And Dimensions

Existing category assets were already valid local JPEG files and were not overwritten:

| File | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `public/assets/categories/electronics.jpg` | 1200x1600 | 84710 | `bef479336a1c170eb8e97a33b1759e61453e7b3362a746be3c89b32acccf2cdc` |
| `public/assets/categories/fashion.jpg` | 1200x1800 | 88204 | `a5683a8ac3f41ec9b4962e5c31bd34df8bf841b87775c0b2f875a576b750d974` |
| `public/assets/categories/home-appliances.jpg` | 1200x800 | 90722 | `00cbb37c940ab5ccf3d5928f5dcc132ba36707052d3dbbacf70ce957f0f4c974` |
| `public/assets/categories/beauty-health.jpg` | 1200x1600 | 243138 | `6b51753345a8bee3129975b0d696954c31ab9ab98561b9ad31097e1a177d0023` |
| `public/assets/categories/sports-fitness.jpg` | 1200x1800 | 82169 | `7d20f27f622069136b518d371d2946b90d01455357b4e922035b4fc7b164941b` |
| `public/assets/categories/books-stationery.jpg` | 1200x900 | 38796 | `bfcb7755db6338d32a7e88bbfc2c4028c47070d375ffa4753fcdf11e68f8ca53` |
| `public/assets/categories/gaming.jpg` | 1200x800 | 44990 | `44e4e5405970e0b343ea01df8de08b348ffe0b5abc5483b38cfa86e776b65c40` |

New canonical local files added:

| File | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `public/assets/categories/toys-collectibles.jpg` | 1200x800 | 44990 | `44e4e5405970e0b343ea01df8de08b348ffe0b5abc5483b38cfa86e776b65c40` |
| `public/assets/banners/home-hero-iphone-15-pro.jpg` | 1600x1067 | 52884 | `fa8314b6a484f9d6fda7f939f0ad514d9c3180177edc1de24c20f339a79c3687` |
| `public/assets/banners/home-hero-galaxy-s24-ultra.jpg` | 1536x642 | 48673 | `3ed73a7b7b4600771e723a5755ceffebee1561f914dcc32f008197f1d13bcaf3` |

## 7. Local DB Category/Banner Source Table

The DB was inspected through the local DB safety loader. Full DB URLs were not printed.

Current parent categories:

| Slug | Active | Image |
| --- | --- | --- |
| `electronics` | true | `/assets/categories/electronics.jpg` |
| `fashion` | true | `/assets/categories/fashion.jpg` |
| `home-appliances` | true | `/assets/categories/home-appliances.jpg` |
| `beauty-health` | true | `/assets/categories/beauty-health.jpg` |
| `sports-fitness` | true | `/assets/categories/sports-fitness.jpg` |
| `books-stationery` | true | `/assets/categories/books-stationery.jpg` |
| `gaming` | true | `/assets/categories/gaming.jpg` |
| `toys-collectibles` | true | `/assets/categories/toys-collectibles.jpg` |

Current active hero banners:

| Sort | Title | Image |
| ---: | --- | --- |
| 1 | The New iPhone 15 Pro | `/assets/banners/home-hero-iphone-15-pro.jpg` |
| 2 | Galaxy S24 Ultra | `/assets/banners/home-hero-galaxy-s24-ultra.jpg` |
| 3 | Sony WH-1000XM5 | `https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1600&auto=format` |

## 8. Seed/Source Reference Inventory

Updated seed/source references so future local seed/repair work does not reintroduce stale remote storefront sources:

- `prisma/seed.ts` category image fields now use canonical `/assets/categories/*.jpg` paths.
- `prisma/seed.ts` iPhone and Galaxy hero banners now use canonical `/assets/banners/*.jpg` paths.
- `scripts/repair-known-broken-image-urls.mjs` now maps the known Galaxy hero remote URL to the local Galaxy banner asset.
- Product seed references may still contain remote Unsplash images outside this Step 116 storefront banner/category scope.
- Sony hero banner remains remote because no recovered local desired Sony source was identified in this step.

## 9. Browser DOM/Network CurrentSrc Tracing For Categories

Before repair, category cards resolved through the Next image optimizer to local category files, while Toys & Collectibles reused `gaming.jpg`.

After repair, browser tracing confirmed canonical category paths:

- Electronics: `/assets/categories/electronics.jpg`
- Fashion: `/assets/categories/fashion.jpg`
- Home & Appliances: `/assets/categories/home-appliances.jpg`
- Beauty & Health: `/assets/categories/beauty-health.jpg`
- Sports & Fitness: `/assets/categories/sports-fitness.jpg`
- Books & Stationery: `/assets/categories/books-stationery.jpg`
- Gaming: `/assets/categories/gaming.jpg`
- Toys & Collectibles: `/assets/categories/toys-collectibles.jpg`

## 10. Hero Tracing

Before repair:

- First hero slide used the remote `photo-1695048133142-1a20484d2569` Unsplash source.
- Galaxy had a local uploaded banner asset available under `public/uploads/admin/banners/...`, but the app/DB did not use a stable canonical source path for it.

After repair:

- The New iPhone 15 Pro: `/assets/banners/home-hero-iphone-15-pro.jpg`
- Galaxy S24 Ultra: `/assets/banners/home-hero-galaxy-s24-ultra.jpg`

## 11. Direct Public URL Vs Browser Displayed Hash Comparison

Category assets:

- Direct source-file hashes matched the expected local files.
- Next optimizer output differed only because of optimizer resizing/re-encoding, not because of a stale or wrong source.

Hero/banner assets:

- iPhone was recovered from the currently displayed/optimized remote source and saved as a stable local canonical file.
- Galaxy was recovered from the existing tracked uploaded banner file and copied to a stable local canonical file.

## 12. Root Cause Classification

Category mismatch root cause:

- The active homepage category component already preferred local `src/shared/category-media.ts` mappings over stale DB category image fields for known slugs.
- Existing category JPGs were not actually overwritten during this step; they were already the source used by the browser preview.
- Ambiguity remained because DB/seed category image fields still pointed at remote Unsplash URLs, and Toys & Collectibles reused `gaming.jpg` instead of having its own canonical source file.

Hero/banner mismatch root cause:

- Active local DB banner rows and seed/source references still allowed remote Unsplash/upload paths for storefront hero images.
- The iPhone hero depended on a remote Unsplash URL that Step 115 identified as broken/intermittent.
- The Galaxy hero had a desired local uploaded file, but no canonical stable storefront asset path.

Cache involvement:

- `.next/cache/images` was cleared once after recovery to remove stale image optimizer output.
- The initial production smoke failure after dev smoke was caused by `next dev` rewriting `.next`, not by image source mismatch. Rebuilding before `next start` fixed it.

## 13. Recovered Image Sources

- iPhone hero: recovered from the currently displayed/optimized hero source and saved locally.
- Galaxy hero: recovered from existing tracked upload `public/uploads/admin/banners/banners-mnyz4sgc-f0051b3e.jpg` and saved locally.
- Toys & Collectibles: copied from the current displayed Gaming source to a slug-specific canonical file, preserving visual behavior while avoiding alias ambiguity.

## 14. Category Asset Files Repaired

- Added `public/assets/categories/toys-collectibles.jpg`.
- Did not overwrite the seven existing category JPG files because evidence showed they already matched the current browser source paths.
- Did not restore `baby-kids.jpg`; no active category/source-of-truth required it in this step.

## 15. Hero/Banner Repaired

- Added `public/assets/banners/home-hero-iphone-15-pro.jpg`.
- Added `public/assets/banners/home-hero-galaxy-s24-ultra.jpg`.
- Updated seed/repair logic to use those local banner paths for iPhone and Galaxy.
- Left Sony remote banner untouched.

## 16. Local DB Repair Performed

Ran the new local-only guarded repair script after `npm run db:url:safety` confirmed local DB URL-shape readiness.

The repair updated:

- Category image fields for the active storefront category slugs.
- Banner image URLs for the recovered iPhone and Galaxy hero records.

The script refuses to run unless the DB safety checker reports local app and shadow DB URLs as safe. No remote DB connection was attempted.

## 17. Cache Cleanup

- Removed generated `.next/cache/images` once during verification.
- Removed temporary trace folder `.tmp-step116-image-trace`.
- No generated cache/temp files were staged.

## 18. Tests Added/Updated

- Added `tests/storefront-image-source.test.ts`.
- Updated `tests/runtime-stability.test.ts`.

Coverage added:

- Category media maps to existing canonical local assets.
- Toys & Collectibles uses its own canonical local file.
- Baby & Kids image is not silently restored.
- Banner seed no longer includes the recovered broken/stale iPhone/Galaxy remote hero URLs.
- Storefront repair script update plan is constrained to `Category.image` and `Banner.imageUrl`.
- Browser helper ignores intentionally hidden responsive image variants when detecting broken visible images.

## 19. Dev/Prod/Browser Verification

Dev smoke:

- `node scripts/local-runtime-smoke.mjs --mode dev --port 3110`: passed.

Production smoke:

- First attempt failed because `next dev` had rewritten `.next` and removed production build artifacts.
- Re-ran `npm run build`.
- `node scripts/local-runtime-smoke.mjs --mode start --port 3111`: passed.

Production browser/CDP-style verification:

- `node scripts/local-browser-runtime-check.mjs --mode start --port 3121 --cdp-port 9321`: passed.
- No broken visible images.
- No console/runtime errors.
- No relevant image warnings.
- No horizontal overflow.
- `/deals` and `/api/admin/flash-sales` remained removed.

Focused browser currentSrc tracing after repair:

- Categories resolved to canonical local `/assets/categories/*.jpg` paths.
- iPhone hero resolved to `/assets/banners/home-hero-iphone-15-pro.jpg`.
- Galaxy hero resolved to `/assets/banners/home-hero-galaxy-s24-ultra.jpg`.

## 20. Validation Results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed after stopping a repo-local `next dev` process that was holding the Prisma query engine file on Windows.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 271 tests across 50 suites.
- `npm run build`: passed.
- Dev runtime smoke: passed.
- Production runtime smoke: passed after rebuilding after dev smoke.
- Production browser runtime check: passed.

## 21. Files Changed

Added:

- `public/assets/banners/home-hero-iphone-15-pro.jpg`
- `public/assets/banners/home-hero-galaxy-s24-ultra.jpg`
- `public/assets/categories/toys-collectibles.jpg`
- `scripts/repair-storefront-image-sources.mjs`
- `tests/storefront-image-source.test.ts`
- `audit-reports/116_STOREFRONT_IMAGE_SOURCE_OF_TRUTH_REPAIR.md`

Modified:

- `prisma/seed.ts`
- `scripts/local-browser-runtime-check.mjs`
- `scripts/repair-known-broken-image-urls.mjs`
- `src/shared/category-media.ts`
- `tests/runtime-stability.test.ts`

Deleted:

- No tracked files deleted.

## 22. Intentionally Left Untouched

- Footer files.
- Newsletter visual files.
- Payment logo assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Payment backend.
- Tracking API.
- Seller marketplace implementation.
- Product lifecycle schema/status behavior.
- Prisma schema and migrations.
- CSP enforcement/default report collection.
- Distributed rate limiting.
- Mobile app implementation.
- Sony hero remote image.
- Baby & Kids category image.

## 23. Prohibited Check

No secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.

No migrations, `db push`, seed/reset, destructive SQL, deployment, payment/tracking/seller/lifecycle enablement, or broad visual redesign was performed.

## 24. Remaining Risks

- Sony hero still depends on a remote Unsplash source.
- Product seed images still include remote image references outside this category/hero source-of-truth scope.
- Toys & Collectibles intentionally uses the same pixels as Gaming until a distinct desired Toys image is provided.
- Browser cache outside the automated check may still need a normal hard refresh on a developer machine after asset changes.
- Local DB was updated safely, but future machines still need to run the guarded repair/seed path to align DB rows.

## 25. Whether User Still Needs Original Desired Image Files

No additional original files are needed for the recovered iPhone/Galaxy hero images or the current category images verified in this step.

The user only needs to provide original desired files later if they want a distinct Toys & Collectibles image, a Baby & Kids image, or a local Sony hero/banner replacement.

## 26. Commit

Commit was pending at report creation time and should be recorded after staging and commit.
