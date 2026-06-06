# 305 Product Image Delete Lifecycle Fix

## Summary

This step investigated the admin product image deletion lifecycle end to end: admin form state, update payload, product API update behavior, ProductImage relation storage, managed local file cleanup, source catalog protection, and the Bose QuietComfort screenshot scenario.

The code already removed ProductImage database rows on update by deleting existing image rows and recreating only the submitted payload images. The main lifecycle gap was the physical cleanup helper: it deleted eligible managed product files but did not remove the now-empty product media folder, and it did not expose/test an explicit product-only cleanup contract for file-like managed upload paths.

Step 305 tightens that helper and adds focused lifecycle tests.

## Root Cause Found

The screenshot combined two different media sources:

- The admin image field for `Bose QuietComfort 45 Headphones` currently references a remote Unsplash URL.
- The local Bose AVIF in the repo is a source-controlled catalog asset, not the active ProductImage row.

Read-only DB query result:

- product: `Bose QuietComfort 45 Headphones`
- slug: `bose-quietcomfort-45-headphones`
- sku: `BOSE-QC45`
- current ProductImage URL: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format`

Filesystem result:

- `public/assets/products/base-quietcomfort-45-headphones/main.avif`: not present in this working tree.
- `public/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`: present, git-tracked, protected source catalog asset.

Therefore, deleting the current Bose image from admin should remove the remote DB reference only. It must not delete the tracked catalog AVIF because that file is source/static catalog media and is not the active DB image.

Evidence:

- `audit-reports/305-product-image-delete-lifecycle/bose-readonly-evidence.json`

## Admin UI Behavior

Before:

- `ProductEditorForm` initialized local image state from `product.images`.
- Clicking `Remove` filtered the selected image out of local state.
- Save payload was built from current `images` state.

After:

- No UI code change was required.
- Focused tests now lock the source behavior: removed image rows are omitted from the payload, and the payload is not rebuilt from stale `product.images`.

Browser mutation QA was not run against the active Bose admin form because it would change the real local product record. Helper and route-level tests cover the lifecycle behavior without mutating that record.

## Backend/API Behavior

Before:

- `PUT /api/admin/products/[id]` loaded existing images.
- It normalized the submitted payload images.
- It deleted all existing `ProductImage` rows inside the transaction.
- It recreated only submitted images.
- After the DB update, it called `deleteRemovedProductImages(existingImageUrls, nextImageUrls)`.
- Physical cleanup was limited to `/uploads/products/**` managed uploads, preserving remote URLs and source assets.

After:

- DB update behavior remains the same.
- Product cleanup now has explicit product-only helpers:
  - `isManagedProductMediaPath`
  - `resolvePublicProductMediaPath`
  - `removeEmptyManagedProductFolderIfSafe`
- Product cleanup accepts only file-like `/uploads/products/**` paths.
- Folder-like paths, roots, traversal, query/fragment paths, source assets, category media, admin media, remote URLs, and data URLs are refused before filesystem deletion.
- After a successful unreferenced managed product file delete, the immediate product media folder is removed only if it is empty, inside `/uploads/products/**`, and not the upload root.
- Cleanup remains fail-open: the product save succeeds if DB update succeeds, and cleanup failures are logged as sanitized warnings.

## Product Image Storage Map

- Product records store gallery images in the `ProductImage` relation:
  - `Product.images -> ProductImage[]`
  - `ProductImage.url`
  - `ProductImage.alt`
  - `ProductImage.isPrimary`
  - `ProductImage.sortOrder`
- Remote URLs remain DB references only.
- Source catalog product images live under:
  - `/assets/products/catalog/<category>/<subcategory-or-general>/<product>/main.<ext>`
- Runtime/admin product uploads live under:
  - `/uploads/products/<category>/<subcategory>/<product>/<media>-<timestamp>-<random>.<ext>`
- Category subcategory uploads remain separate:
  - `/assets/categories/subcategories/<subcategory>.webp`

## Managed Media Roots

Cleanup candidates:

- `/uploads/products/**` for product cleanup helper.
- `/uploads/admin/**` for admin/banner/category cleanup helpers.
- `/assets/categories/subcategories/**` for approved subcategory image upload behavior.

Protected from product cleanup:

- `/assets/products/catalog/**`
- all other `/assets/**` source assets unless a dedicated category helper explicitly owns the narrow subcategory path.
- `/images/**`
- remote URLs.
- inline `data:image/*` payloads.

## Cleanup Safety Rules

Product media cleanup now requires:

- path starts with `/uploads/products/`;
- path resolves inside the configured public root;
- path is not the managed upload root;
- path is file-like and has an extension;
- path has no query string, hash, null byte, traversal, or cross-root escape;
- reference check is complete;
- no active ProductImage, ProductVariant, category, brand, seller, banner, or historical evidence reference remains;
- file deletion succeeds.

Empty folder cleanup:

- runs only after successful file deletion;
- targets only the immediate parent folder of the deleted product file;
- refuses the upload root itself;
- removes the folder only when already empty.

## Bose Image/File Result

- Current DB reference: remote Unsplash URL.
- Removed from DB: no, this step did not mutate the active Bose record.
- Physical delete attempted: no.
- `public/assets/products/base-quietcomfort-45-headphones/main.avif`: not present.
- `public/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`: present, tracked, preserved as source/static catalog asset.

If an admin removes the current remote Bose URL and saves, the product should no longer reference that URL, and no filesystem delete should run for that remote URL.

## Tests Added/Updated

Added:

- `tests/admin-product-image-delete-lifecycle.test.ts`

Coverage:

- product update route deletes existing `ProductImage` rows and recreates only submitted payload images;
- admin form remove action/payload are tied to current image state;
- remote and source catalog image removals do not reach filesystem cleanup;
- only `/uploads/products/**` file-like paths are product cleanup candidates;
- unsafe traversal/root/folder-like paths are refused before reference checks;
- shared managed product files are preserved;
- unreferenced managed product files are deleted;
- empty product media folders are removed only when safe;
- non-empty product folders are preserved;
- category subcategory media behavior is not taken over by product cleanup;
- Bose catalog AVIF remains protected source media.

Focused test command:

- `npx tsx --test tests/admin-product-image-delete-lifecycle.test.ts tests/admin-media-runtime-cleanup.test.ts tests/media-path-taxonomy.test.ts tests/catalog-product-media-localization.test.ts`: pass, 29 tests.

## Browser/Manual QA

Browser mutation QA was not performed because the obvious admin action would mutate the active local Bose product record. Instead, this step used:

- read-only local DB inspection after `npm run db:url:safety`;
- filesystem inspection of the reported and actual Bose paths;
- helper-level temp-file tests that create and delete isolated files under temporary public roots;
- route/form source guardrail tests to confirm removed images are omitted from the save payload and update persistence path.

No real product image row or real product asset was deleted during this step.

## Validation Results

- `npm run db:url:safety`: pass.
- `npm run db:prisma:local:validate`: pass.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` while renaming Prisma query engine DLL.
- Likely locking process: Next server on port `3000`, PID `31396`, `C:\Program Files\nodejs\node.exe`, running `node_modules\next\dist\server\lib\start-server.js`.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass, 510 tests.
- `npm run build`: pass.

No Prisma schema or migration files were changed.

## Exact Files Changed

- `src/backend/admin/product-editor.ts`
- `tests/admin-product-image-delete-lifecycle.test.ts`
- `audit-reports/305-product-image-delete-lifecycle/bose-readonly-evidence.json`
- `audit-reports/305_PRODUCT_IMAGE_DELETE_LIFECYCLE_FIX.md`
- `audit-reports/305_NEXT_PROMPT_DRAFT.md`

## Commit Status

Committed with message `fix: clean up removed product media safely`. Final commit hash is recorded in the assistant final response because embedding the exact hash in this committed report would change the hash.

## Remaining Risks/Blockers

- Prisma generate remains blocked locally by the active Windows DLL file lock.
- Browser mutation QA against the real Bose product was intentionally skipped to avoid changing the active local record.
- The active Bose DB row still points to a remote Unsplash URL until an admin intentionally saves a different image state.
- The tracked source catalog Bose AVIF remains in the repo by design and should not be removed by admin runtime cleanup.

## Recommended Next Step

Stop or restart the local Next process that is locking Prisma, rerun `npm run db:prisma:local:generate`, then perform an approved temp-product browser QA flow that creates a disposable product with a managed `/uploads/products/**` image, removes it through admin UI, saves, refreshes, and verifies both DB and filesystem cleanup.
