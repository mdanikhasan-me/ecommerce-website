# 306 Product Remote To Local Image Replacement

## Summary

Step 306 audited the active product image source-of-truth pipeline and replaced safe local-development `ProductImage.url` rows that still pointed at remote Unsplash product images while a matching committed catalog image already existed.

The repair updated only verified local DB `ProductImage.url` rows. It did not delete assets, copy remote images, run seed/reset, run migrations, or touch category UI/icon work.

## Root Cause

The active local database had drifted from the current seed/catalog source of truth. `prisma/seed.ts` and `src/shared/product-media.ts` already point seeded product images at `/assets/products/catalog/**`, but the local DB still contained 12 `ProductImage.url` rows using `https://images.unsplash.com/...`.

Storefront product cards, product details, Open Graph metadata, and JSON-LD all read from `Product.images`, so stale DB rows made admin and storefront surfaces prefer remote product images even though source-controlled local catalog assets existed.

## Inventory Of Remote Product Images

Required plan file:

- `audit-reports/306-product-local-image-replacement/product-image-localization-plan.json`

Pre-mutation plan result:

- Products queried: 19.
- Product image rows queried: 19.
- Local catalog product assets inventoried: 21.
- Remote `ProductImage.url` rows with safe local matches: 12.
- Ambiguous matches: 0.
- Missing local matches: 0.
- Already local/non-remote rows kept: 7.

Remote rows replaced:

- `apple-airpods-pro-2nd-gen`
- `apple-watch-series-9-41mm`
- `dell-xps-15-9520-i7-oled`
- `nike-air-max-270-running-shoes`
- `samsung-55-neo-qled-qn90c`
- `samsung-galaxy-watch-6-classic-44mm`
- `sony-alpha-a7-iv-mirrorless-body`
- `sony-playstation-5-slim`
- `sony-wh-1000xm5`
- `xiaomi-buds-4-pro`
- `xiaomi-mi-smart-band-8`
- `xiaomi-pad-6-128gb-wifi`

## Inventory Of Matching Local Catalog Images

The inventory found 21 committed local catalog product image files under:

- `public/assets/products/catalog/**`

Every inventoried catalog image file was git-tracked and mapped cleanly to a product slug. The Bose asset exists and is tracked:

- `/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`

## Replacement Plan

The new resolver chooses a replacement only when:

- the current DB image URL is remote HTTP(S);
- a matching local catalog asset maps cleanly to the product slug;
- the local asset exists under `/assets/products/catalog/**`;
- the match is not ambiguous;
- apply mode re-reads the DB row and confirms the row still matches the saved plan.

The script refuses apply mode unless `--plan-in` is provided, so the saved mapping report exists before mutation.

## DB Mutation

DB mutation was performed after `npm run db:url:safety` passed.

Command:

```txt
npx tsx scripts/replace-remote-product-images-with-local-catalog.ts --apply --plan-in audit-reports/306-product-local-image-replacement/product-image-localization-plan.json --evidence-out audit-reports/306-product-local-image-replacement/product-image-localization-apply-evidence.json
```

Result:

- Updated `ProductImage.url` rows: 12.
- Skipped rows: 0.
- Remaining `ProductImage.url` rows starting with `https://images.unsplash.com`: 0.
- Preserved `alt`, `isPrimary`, `sortOrder`, and product relation by updating only `url`.

Postcheck:

- `audit-reports/306-product-local-image-replacement/product-image-localization-postcheck.json`
- Remote replacement count after apply: 0.
- Already local/non-remote rows after apply: 19.

## Bose Before/After

Step 305 recorded a Bose DB row with:

```txt
https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format
```

Step 306's safety-gated plan queried the current local DB and did not find a `bose-quietcomfort-45-headphones` product row. Therefore no Bose DB row was updated in Step 306.

Bose-specific postcheck:

- `audit-reports/306-product-local-image-replacement/bose-db-local-asset-postcheck.json`
- Bose product present in current local DB: false.
- Bose catalog asset exists: true.
- Bose expected local path remains available: `/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`.

## Source/Seed Files

No active seed/catalog product source file needed product-image URL changes:

- `prisma/seed.ts` product image URLs already use `/assets/products/catalog/**`.
- `src/shared/product-media.ts` already declares the catalog source assets, including Bose.

Search still finds remote URLs in expected non-product-image or historical/reference contexts:

- brand placeholder logos in seed;
- active hero/sample order seed data;
- old repair-map `from` URLs;
- test fixtures;
- security allowlist/preconnect policy.

Those were not changed because Step 306 was scoped to product image rows and active product seed/catalog preference.

## Frontend/API/SEO Behavior

No frontend code change was needed.

The relevant surfaces read `Product.images`:

- admin product editor loads editable product images from `Product.images`;
- public product cards use the primary `ProductImage.url`;
- product detail gallery uses `Product.images`;
- product metadata and JSON-LD use `Product.images`.

After DB repair, those surfaces receive the local catalog path for the replaced products.

## Tests Added

Added:

- `tests/product-local-image-replacement.test.ts`

Coverage:

- resolver finds the Bose catalog AVIF;
- resolver refuses ambiguous and missing matches;
- plan maps a Bose remote URL to the local catalog path;
- plan preserves `alt`, `isPrimary`, and `sortOrder`;
- already-local rows are not changed;
- remote rows with no local asset are not changed;
- active seeded product images do not prefer Unsplash when local media exists;
- Step 305 cleanup still refuses `/assets/products/catalog/**`.

Focused command:

```txt
npx tsx --test tests/product-local-image-replacement.test.ts tests/catalog-product-media-localization.test.ts tests/admin-product-image-delete-lifecycle.test.ts
```

Result: pass, 20 tests.

## Browser/Read-Only QA Evidence

Evidence file:

- `audit-reports/306-product-local-image-replacement/http-qa-evidence.json`

Results:

- `GET /api/products?q=sony`: 200; `sony-wh-1000xm5` image is `/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif`.
- `GET /products/sony-wh-1000xm5`: 200; page contains the local catalog image path.
- `GET /assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif`: 200, `image/avif`.
- `GET /admin/products`: 307 redirect to `/auth/login?callbackUrl=%2Fadmin%2Fproducts`.

Authenticated admin browser QA was blocked by the auth boundary and no authenticated in-app browser tool was exposed in this turn.

## Validation Results

- `npm run db:url:safety`: pass.
- `npm run db:prisma:local:validate`: pass.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` while renaming Prisma query engine DLL.
- Likely locking process: Node PID `33696`, port `3000`, `C:\Program Files\nodejs\node.exe`, running `node_modules\next\dist\server\lib\start-server.js`.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass, 517 tests.
- `npm run build`: pass.

No Prisma schema or migration files were changed.

## Exact Files Changed

- `src/backend/catalog/product-local-image-replacement.ts`
- `scripts/replace-remote-product-images-with-local-catalog.ts`
- `tests/product-local-image-replacement.test.ts`
- `audit-reports/306-product-local-image-replacement/product-image-localization-plan.json`
- `audit-reports/306-product-local-image-replacement/product-image-localization-apply-evidence.json`
- `audit-reports/306-product-local-image-replacement/product-image-localization-postcheck.json`
- `audit-reports/306-product-local-image-replacement/bose-db-local-asset-postcheck.json`
- `audit-reports/306-product-local-image-replacement/http-qa-evidence.json`
- `audit-reports/306_PRODUCT_REMOTE_TO_LOCAL_IMAGE_REPLACEMENT.md`
- `audit-reports/306_NEXT_PROMPT_DRAFT.md`

## Commit Status

Committed with message `fix: prefer local catalog product images`. Final commit hash is recorded in the assistant final response because embedding the exact hash in this committed report would change the hash.

## Remaining Risks/Blockers

- `npm run db:prisma:local:generate` remains blocked by the active Windows DLL file lock.
- The current local DB has no Bose product row, even though the seed/source catalog contains Bose and the Bose local image exists.
- Six product image rows remain on `/uploads/products/**` and one product image row remains on a non-catalog local banner path; these were not remote URLs and were kept out of this remote-to-local replacement step.
- Admin UI visual QA needs an authenticated browser/session.

## Recommended Next Step

Stop or restart the Node/Next process locking Prisma, rerun `npm run db:prisma:local:generate`, then run a dedicated read-first product DB/seed reconciliation step to explain why the current local DB has 19 products while the seed/catalog source contains 21 product media entries, including Bose.
