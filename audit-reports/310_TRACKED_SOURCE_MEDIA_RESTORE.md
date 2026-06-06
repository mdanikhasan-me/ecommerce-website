# Step 310: Tracked Source Media Restore

## Summary
Step 310 restored the tracked source media files that Step 309 proved were still referenced by the local DB and/or seed data.

This was a restore-only safety pass. No DB rows were mutated. No files were deleted or moved. No upload/orphan cleanup was performed. No category SVG files were edited or staged.

## Why Restore Was Needed
Step 309 found:
- 14 active DB local references pointing to missing files.
- 23 seed product/banner source references pointing to missing files.
- 27 tracked source/catalog/banner entries deleted from the working tree.
- Existing tests failing because source media files were missing.

The deleted files were tracked source assets under `public/assets/**`, not runtime upload orphan files.

## Restored Source Asset Paths
Restored exact tracked paths:
- `public/assets/banners/home-hero-galaxy-s24-ultra.jpg`
- `public/assets/banners/home-hero-iphone-15-pro.jpg`
- `public/assets/products/catalog/beauty-health/.gitkeep`
- `public/assets/products/catalog/books-stationery/.gitkeep`
- `public/assets/products/catalog/electronics/audio/apple-airpods-pro-2nd-gen/main.avif`
- `public/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`
- `public/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif`
- `public/assets/products/catalog/electronics/audio/xiaomi-buds-4-pro/main.avif`
- `public/assets/products/catalog/electronics/general/anker-511-nano-pro-65w-charger/main.jpg`
- `public/assets/products/catalog/electronics/general/anker-737-power-bank-24000mah/main.webp`
- `public/assets/products/catalog/electronics/general/samsung-galaxy-tab-s9-128gb/main.jpg`
- `public/assets/products/catalog/electronics/general/sony-alpha-a7-iv-mirrorless-body/main.avif`
- `public/assets/products/catalog/electronics/general/xiaomi-pad-6-128gb-wifi/main.avif`
- `public/assets/products/catalog/electronics/laptops/dell-ultrasharp-27-4k-usb-c-u2723de/main.jpg`
- `public/assets/products/catalog/electronics/laptops/dell-xps-15-9520-i7-oled/main.avif`
- `public/assets/products/catalog/electronics/laptops/hp-spectre-x360-14/main.avif`
- `public/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`
- `public/assets/products/catalog/electronics/mobile-phones/samsung-galaxy-s24-ultra-256gb/main.jpg`
- `public/assets/products/catalog/electronics/mobile-phones/xiaomi-redmi-note-13-pro-256gb/main.webp`
- `public/assets/products/catalog/electronics/wearables/apple-watch-series-9-41mm/main.avif`
- `public/assets/products/catalog/electronics/wearables/samsung-galaxy-watch-6-classic-44mm/main.avif`
- `public/assets/products/catalog/electronics/wearables/xiaomi-mi-smart-band-8/main.avif`
- `public/assets/products/catalog/fashion/.gitkeep`
- `public/assets/products/catalog/gaming/general/sony-playstation-5-slim/main.avif`
- `public/assets/products/catalog/home-appliances/general/samsung-55-neo-qled-qn90c/main.avif`
- `public/assets/products/catalog/sports-fitness/general/nike-air-max-270-running-shoes/main.avif`
- `public/assets/products/catalog/toys-collectibles/.gitkeep`

Because these were tracked files restored back to `HEAD`, the media files are clean after restore rather than new diffs.

## Before And After Reference Counts
Baseline from Step 309:
- Active DB local broken refs: 14.
- Seed product/banner missing local refs: 23.
- Deleted tracked public media entries: 27.

After Step 310 restore:
- Active DB local broken refs: 0.
- Seed product/banner missing local refs: 0.
- Deleted tracked public media entries: 0.
- Existing public media entries: 119/119.

Evidence:
- `audit-reports/310-media-restore-evidence/media-file-inventory.json`
- `audit-reports/310-media-restore-evidence/media-reference-inventory.json`

## Upload And Orphan Files
Upload/orphan files were untouched.

The same four managed upload files remain orphan candidates only:
- `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwup-3e5876b0.jpg`
- `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwur-d1ec829a.jpg`
- `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwus-7bd162dd.jpg`
- `/uploads/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition-mnzwh3r1-3aeefbd8.webp`

No QA/temp upload directories were deleted or staged.

## Category SVGs
The pre-existing category SVG edits remain user-owned and unstaged:
- `public/assets/icons/ui/categories/beauty-health.svg`
- `public/assets/icons/ui/categories/books-stationery.svg`
- `public/assets/icons/ui/categories/electronics.svg`
- `public/assets/icons/ui/categories/fashion.svg`
- `public/assets/icons/ui/categories/gaming.svg`
- `public/assets/icons/ui/categories/home-appliances.svg`
- `public/assets/icons/ui/categories/sports-fitness.svg`
- `public/assets/icons/ui/categories/toys-collectibles.svg`

## Guardrails Observed
- No DB mutation was performed.
- No seed/reset/db push/destructive SQL was run.
- No Prisma schema or migration file was edited.
- No upload files were deleted, moved, staged, or cleaned.
- No source lifecycle, admin cleanup, payment, tracking, seller, package, env, navbar, Help page, footer, homepage UI, category page, product card, or listing UI files were changed.
- No remote Unsplash product images were restored or added.

## Validation Results
- `git status --short`: clean for restored source media; only pre-existing category SVG edits plus new Step 310 report/evidence files remain in the working tree.
- `node scripts/audit-public-media-source-of-truth.mjs --out-dir audit-reports/310-media-restore-evidence`: passed; read-only; deletion/mutation flags false.
- `npm run db:url:safety`: passed; `DATABASE_URL` local, `SHADOW_DATABASE_URL` local, shadow DB separate.
- `npm run db:prisma:local:validate`: passed; Prisma schema valid.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` while renaming Prisma's generated query engine file in `node_modules/.prisma/client`.
- `npm run typecheck`: passed.
- `npm run lint`: passed; Next lint deprecation notice only.
- `npm test`: passed; 529 passed, 0 failed.
- `npm run build`: passed; Next.js production build completed.

Prisma generate blocker details:
- Failure: `EPERM: operation not permitted, rename 'P:\Projects\E-commers\boilabin-marketplace\node_modules\.prisma\client\query_engine-windows.dll.node.tmp34560' -> 'P:\Projects\E-commers\boilabin-marketplace\node_modules\.prisma\client\query_engine-windows.dll.node'`.
- Port 3108 lock context: `OwningProcess 29140`.
- Project-local `next start -p 3108`: PID 28032 (`npm run start -- -p 3108`), PID 35216 (`cmd /c next start -p 3108`), PID 29140 (`next start -p 3108`).
- Project-local `next dev`: PID 36468 (`npm run dev`), PID 20072 (`cmd /c next dev`), PID 22932 (`next dev`), PID 37080 (`next start-server.js`).
- These processes were identified only; none were killed or modified.

## Exact Files Staged And Committed
Exact Step 310 files selected for staging and commit:
- `audit-reports/310_TRACKED_SOURCE_MEDIA_RESTORE.md`
- `audit-reports/310_NEXT_PROMPT_DRAFT.md`
- `audit-reports/310-media-restore-evidence/media-file-inventory.json`
- `audit-reports/310-media-restore-evidence/media-reference-inventory.json`

Restored source media paths are clean against `HEAD` after restore, so there are no media-file diffs to stage.

Explicitly excluded from staging:
- Pre-existing category SVG edits under `public/assets/icons/ui/categories/*.svg`.
- Upload/orphan files under `public/uploads/**`.
- QA/temp upload directories.

## Remaining Risks
- Product `iphone-15-pro-128gb` still points at `/assets/banners/home-hero-iphone-15-pro.jpg`; the file now exists, so it is no longer broken, but it remains a wrong-owner product image reference.
- Existing product DB rows still mix `/assets/products/catalog/**` source references and `/uploads/products/**` managed uploads by history.
- Four managed upload files remain orphan candidates only; they were not deleted.
- Subcategory cleanup path resolution bug from Step 309 remains unfixed.
- Brand placeholder logos and historical order evidence remote URLs remain unchanged.

## Recommended Next Step
Run a bounded local DB repair for the single wrong-owner iPhone product image row: plan first, safety-check local DB, update only that `ProductImage.url` from `/assets/banners/home-hero-iphone-15-pro.jpg` to `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`, and do not touch uploads, source files, category SVGs, seed/reset, schema/migrations, payment, tracking, or seller work.
