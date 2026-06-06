# Step 309: Media Source Of Truth And Upload Pipeline Audit

## Scope
Step 309 audited public media ownership, active DB/source references, admin upload destinations, missing files, orphan candidates, and QA/temp upload leftovers.

This was a report-first, no-mutation step. No media files were deleted, moved, restored, copied, or rewritten. No DB rows were mutated. No Prisma schema, migration, seed/reset, DB push, package, env, payment, tracking, seller, category SVG, navbar, Help page, footer, homepage UI, category page, product card, or product listing files were changed.

## Architecture Verdict
The user's proposed architecture is correct for this project:

- `public/assets/**` should be treated as bundled, source-controlled static assets.
- `public/uploads/**` should be treated as local/self-hosted runtime/admin upload storage.
- Product images uploaded from admin should go to `/uploads/products/**`.
- Banner and parent category images uploaded from admin should go to `/uploads/admin/**`.
- The current approved exception is subcategory media at `/assets/categories/subcategories/**`; it behaves like managed category media even though it lives under `/assets`.
- Admin runtime cleanup must not blindly delete source assets under `/assets/**`.

Production caveat:
- Local `public/uploads/**` is acceptable for development and pre-launch local/self-hosted mode.
- It is not durable on many serverless hosts. Production should eventually use object storage such as S3, R2, Supabase Storage, or a persistent volume, with explicit ownership metadata, backups, and deletion ledger/recycle-window rules.

## Evidence Created
- `audit-reports/309-media-source-of-truth/media-file-inventory.json`
- `audit-reports/309-media-source-of-truth/media-reference-inventory.json`
- `audit-reports/309-media-source-of-truth/admin-upload-destination-map.md`
- `audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md`

Supporting script:
- `scripts/audit-public-media-source-of-truth.mjs`

Focused tests:
- `tests/media-source-of-truth-audit.test.ts`

## Read-First Context
Read before implementation:
- `audit-reports/306_PRODUCT_REMOTE_TO_LOCAL_IMAGE_REPLACEMENT.md`
- `audit-reports/306-product-local-image-replacement/product-image-localization-plan.json`
- `audit-reports/306-product-local-image-replacement/product-image-localization-postcheck.json`
- `audit-reports/307_HELP_PAGE_AND_GLOBAL_NAVBAR_REDESIGN.md`
- `audit-reports/308_NAVBAR_BANNER_FOOTER_POLISH.md`
- `audit-reports/308-navbar-banner-footer-polish/browser-polish-evidence.json`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-paths.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/banner-editor.ts`
- `src/frontend/components/home/HeroBanner.tsx`
- `src/app/(store)/page.tsx`
- Admin product, banner, and category API routes/forms.

## Inventory Results

File inventory summary:
- Total public media entries: 119.
- Existing entries: 92.
- Tracked deleted entries: 27.
- Existing managed upload media files: 11.
- Source asset entries: 108.
- Possible QA/temp media files: 0.
- Possible QA/temp directories: 24.

Folder owner counts:
- Banner source: 2.
- Product catalog source: 25.
- Category source: 8.
- Icons: 59.
- Payment logos: 5.
- Other source assets: 9.
- Managed uploads: 11.

Git status counts:
- Deleted: 27.
- Tracked: 84.
- Modified: 8.

The 8 modified files are the pre-existing user-owned category SVG edits and were not touched or staged by this step.

## Reference Results

DB reference summary:
- Product image refs: 19.
- Banner image refs: 1.
- Category image refs: 8.
- Brand image refs: 9.
- Historical order item image refs: 2.
- DB local references missing files: 14.
- DB remote references: 11.

Source/seed scan:
- `prisma/seed.ts` references 23 product/banner source paths currently deleted in the worktree.
- The broad active-source/test/script scan intentionally excludes `audit-reports/**` from active conclusions, but records tests and scripts in the raw inventory for traceability.

## Admin Upload Destination Summary

Product admin uploads:
- Current output: `/uploads/products/<category>/<subcategory>/<product>/<image-id>-<timestamp>-<random>.webp`.
- DB field: `ProductImage.url`.
- Cleanup: `deleteRemovedProductImages()`, `cleanupManagedUploads()`, and `deleteManagedUpload()` refuse source assets and remote media.
- Verdict: admin-uploaded product media is correctly wired to `/uploads/products/**`.

Banner admin uploads:
- Current output: `/uploads/admin/banners/<banner-owner>/<desktop-or-mobile>-<timestamp>-<random>.webp`.
- DB fields: `Banner.imageUrl`, `Banner.mobileImageUrl`.
- Homepage source: DB active hero banners in `src/app/(store)/page.tsx`.
- Cleanup: `deleteReplacedAdminUploads()` and `cleanupManagedAdminUploads()` refuse source assets and remote media.
- Verdict: admin-uploaded banner media is correctly wired to `/uploads/admin/banners/**`.

Category and subcategory uploads:
- Parent category admin uploads output to `/uploads/admin/categories/<category>/image-<timestamp>-<random>.webp`.
- Subcategory admin uploads output to `/assets/categories/subcategories/<subcategory>.webp`.
- DB field: `Category.image`.
- Verdict: parent category uploads are correctly separated; subcategory media uses an approved `/assets` exception and has a cleanup-resolution bug to fix later.

Generic admin files:
- No active route/helper was found creating `/uploads/admin/files/**`.
- No media files currently exist under that folder.

## Broken References

Active DB broken references:
- 13 active product image rows point to missing source files.
- 1 active hero banner row points to a missing source banner.

Most important examples:
- Product `iphone-15-pro-128gb` points to `/assets/banners/home-hero-iphone-15-pro.jpg`; this is a wrong-owner product-to-banner reference and the file is currently deleted.
- Active hero banner `Galaxy S24 Ultra` points to `/assets/banners/home-hero-galaxy-s24-ultra.jpg`; this file is currently deleted.
- 12 active product rows point to `/assets/products/catalog/**` files currently deleted from the worktree.

Full details are in:
- `audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md`

## Orphan And QA Findings

Existing managed upload files:
- 7 are referenced by DB/source scan.
- 4 appear unreferenced and are candidates only:
  - `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwup-3e5876b0.jpg`
  - `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwur-d1ec829a.jpg`
  - `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwus-7bd162dd.jpg`
  - `/uploads/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition-mnzwh3r1-3aeefbd8.webp`

QA/temp directories:
- 24 Step 285 QA/temp-looking directories exist under `public/uploads/**`.
- They currently contain 0 media files in the inventory.
- No directory deletion was performed or staged.

## Remote References

Current DB remotes:
- 9 active brand logo placeholders on `placehold.co`.
- 2 historical order item image URLs on `images.unsplash.com`.

Seed/source remotes:
- `prisma/seed.ts` still contains brand placeholder URLs, one remote Unsplash seed hero/sample row, and one remote sample order image.
- CSP/preconnect/source-code remote URLs also exist for security/provider allowlists and are not all media assets.

Recommendation:
- Brand placeholders should be localized in a future brand-media step.
- Historical order item image URLs should be treated as evidence and not rewritten without a dedicated order evidence policy.

## User-Deleted Asset Verdict
The deleted `public/assets/products/catalog/**` and `public/assets/banners/**` files are risky to leave deleted.

They are not orphaned runtime uploads because:
- They are tracked source assets.
- Current DB rows still reference 14 deleted source files.
- `prisma/seed.ts` still references 23 deleted product/banner source files.
- Admin cleanup policy intentionally protects `/assets/**`.

Step 309 did not stage or revert those deletions. They remain user-owned working-tree changes.

## Cleanup Bug To Fix Later
Subcategory media at `/assets/categories/subcategories/**` is classified as managed and can be considered for cleanup, but `deleteManagedAdminUpload()` likely resolves the physical file path with `/uploads/admin/` instead of the actual managed prefix.

Impact:
- Parent category uploads under `/uploads/admin/categories/**` should clean up normally.
- Subcategory files under `/assets/categories/subcategories/**` may not physically delete even after safe reference checks.

This was not fixed in Step 309 because the step is report-only.

## Guardrails Observed
- No media files were deleted, moved, restored, copied, or rewritten.
- No DB rows were created, updated, deleted, seeded, reset, pushed, or migrated.
- No Prisma schema/migration was changed.
- No category SVGs were edited, staged, or reverted.
- No product image lifecycle/admin cleanup source files were changed.
- No navbar, Help page, footer, homepage UI, category page, product card, or listing UI was changed.
- No packages or env files were changed.
- No fake remote images, hotlinked images, or restored Unsplash product images were added.

## Validation Results
- `git status --short`: showed only user-owned source asset deletions, pre-existing category SVG edits, and Step 309 files before staging.
- `node scripts/audit-public-media-source-of-truth.mjs --out-dir audit-reports/309-media-source-of-truth`: passed; read-only; deletion/mutation flags false.
- `npx tsx --test tests/media-source-of-truth-audit.test.ts`: passed, 4/4.
- `npm run db:url:safety`: passed before DB-sensitive read and during validation.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` renaming Prisma query engine DLL.
- Likely locking processes: project-local `next start -p 3108` on PID `29140` with npm/cmd parents, plus project-local `next dev` on PID `6768` / `27964`.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next lint deprecation notice only.
- `npm test`: failed, 513/529 passed and 16 failed. Failures were asset-presence/source-of-truth tests caused by the pre-existing user-deleted tracked source catalog/banner files, including Bose/product catalog, homepage hero source asset, Step 308 banner source, and media readiness tests.
- `npm run build`: passed.

## Commit Status
Prepared for exact-file staging. Final commit hash is recorded in the assistant final response.

## Recommended Next Step
Step 310 should be restore-only and approval-gated: restore the tracked deleted source catalog/banner assets from git without staging category SVG edits or touching DB rows. After source assets are present again, a later dedicated step can choose between keeping source/catalog DB references or running an approved source-to-managed-upload DB/file reconciliation.
