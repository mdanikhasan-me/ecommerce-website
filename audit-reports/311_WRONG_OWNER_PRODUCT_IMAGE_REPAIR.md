# Step 311: Wrong-Owner Product Image Repair

## Summary
Step 311 repaired one local DB `ProductImage.url` row for `iphone-15-pro-128gb`.

The product image row incorrectly pointed at the homepage banner source asset:

```txt
/assets/banners/home-hero-iphone-15-pro.jpg
```

It now points at the correct product catalog source asset:

```txt
/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg
```

This was a bounded DB repair only. No media files were changed, moved, created, or deleted.

## Root Cause
Earlier local media repair work left `iphone-15-pro-128gb` with a valid but wrong-owner image path. Step 310 restored the banner file, so the reference was no longer broken, but the product image row still used a banner-owned asset instead of the iPhone catalog product asset.

## Exact DB Row Changed
- Product slug: `iphone-15-pro-128gb`
- Product active before update: `true`
- `ProductImage.id`: `cmpxdfphp001o5jm03s6qzfm7`
- `ProductImage.productId`: `cmpxdfphp001n5jm0h8q80qgv`
- Before URL: `/assets/banners/home-hero-iphone-15-pro.jpg`
- After URL: `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`
- Fields preserved:
  - `alt`: `null`
  - `isPrimary`: `true`
  - `sortOrder`: `0`
  - `productId`: `cmpxdfphp001n5jm0h8q80qgv`

Exactly one DB row was updated.

## Precheck Evidence Summary
Evidence file:

```txt
audit-reports/311-wrong-owner-product-image-repair/precheck.json
```

Precheck result:
- DB URL safety passed: `DATABASE_URL` local, `SHADOW_DATABASE_URL` local, shadow DB separate.
- Product exists: `true`.
- Product active: `true`.
- Current wrong-owner URL found on product image row: `/assets/banners/home-hero-iphone-15-pro.jpg`.
- Target local product image exists: `true`.
- Banner asset exists before update: `true`.
- Matching active product image rows to update: `1`.
- Precheck passed: `true`.

The DB update was not attempted until this evidence existed and passed.

## Postcheck Evidence Summary
Evidence file:

```txt
audit-reports/311-wrong-owner-product-image-repair/postcheck.json
```

Postcheck result:
- DB rows updated: `1`.
- Product rows still using the banner URL after update: `0`.
- Product rows using the target catalog URL after update: `1`.
- Banner asset remains available: `true`.
- Target product catalog asset remains available: `true`.
- Postcheck passed: `true`.

The postcheck confirms the iPhone product no longer has a `ProductImage.url` pointing at `/assets/banners/home-hero-iphone-15-pro.jpg`.

## Media Audit After Repair
Command:

```bash
node scripts/audit-public-media-source-of-truth.mjs --out-dir audit-reports/311-wrong-owner-product-image-repair
```

Evidence files:
- `audit-reports/311-wrong-owner-product-image-repair/media-file-inventory.json`
- `audit-reports/311-wrong-owner-product-image-repair/media-reference-inventory.json`

Media file summary:
- Total public media entries: `119`.
- Existing entries: `119`.
- Deleted tracked entries: `0`.
- Managed upload entries: `11`.
- Source asset entries: `108`.
- Possible QA/temp media entries: `0`.
- Possible QA/temp directories: `24`.

Reference summary:
- DB media references: `39`.
- DB product image reference for `iphone-15-pro-128gb`: `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`.
- The iPhone DB product image reference no longer uses `/assets/banners/home-hero-iphone-15-pro.jpg`.
- Audit ran read-only with `deletionPerformed: false` and `dbMutationPerformed: false`.

Managed upload orphan summary remained unchanged:
- Existing managed upload files: `11`.
- Referenced managed upload files: `7`.
- Unreferenced managed upload candidate files: `4`.

## Guardrails Observed
- No media files were changed, copied, moved, created, or deleted.
- No upload/orphan cleanup was performed.
- No QA/temp upload directories were removed.
- No category SVG files were edited or staged.
- No seed/reset/db push/destructive SQL was run.
- No Prisma schema or migration file was edited.
- No upload destinations were changed.
- No product image lifecycle/admin cleanup source files were edited.
- No navbar, Help page, footer, homepage, category page, product-card, listing UI, payment, tracking, seller, env, package, `/deals`, flash sale, or collection files were touched.
- No remote images were added or hotlinked.
- Exactly one DB row was changed.

## Validation Results
- `git status --short`: pre-stage status showed only pre-existing category SVG edits, Step 311 files, and the focused Step 311 test.
- `npm run db:url:safety`: passed; `DATABASE_URL` local, `SHADOW_DATABASE_URL` local, shadow DB separate.
- `npm run db:prisma:local:validate`: passed; Prisma schema valid.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` while renaming Prisma's generated query engine file in `node_modules/.prisma/client`.
- `npm run typecheck`: passed.
- `npm run lint`: passed; no ESLint warnings or errors, Next lint deprecation notice only.
- `npm test -- tests/media-source-of-truth-audit.test.ts`: passed; 530 passed, 0 failed. This command appends to the repo's default test glob, so it effectively ran the suite with the focused file also named explicitly.
- `npm test`: passed; 530 passed, 0 failed.
- `npm run build`: passed; Next.js production build completed.

## Prisma Generate Status
Blocked by a known Windows local-process file lock:

```txt
EPERM: operation not permitted, rename 'P:\Projects\E-commers\boilabin-marketplace\node_modules\.prisma\client\query_engine-windows.dll.node.tmp16452' -> 'P:\Projects\E-commers\boilabin-marketplace\node_modules\.prisma\client\query_engine-windows.dll.node'
```

Lock context:
- Port 3108: `OwningProcess 29140`.
- Project-local `next start -p 3108`: PID 28032 (`npm run start -- -p 3108`), PID 35216 (`cmd /c next start -p 3108`), PID 29140 (`next start -p 3108`).
- Project-local `next dev`: PID 36468 (`npm run dev`), PID 20072 (`cmd /c next dev`), PID 22932 (`next dev`), PID 37080 (`next start-server.js`).

These processes were identified only. No processes were killed or modified.

## Exact Files Staged And Committed
Exact Step 311 files selected for staging and commit:
- `audit-reports/311_WRONG_OWNER_PRODUCT_IMAGE_REPAIR.md`
- `audit-reports/311_NEXT_PROMPT_DRAFT.md`
- `audit-reports/311-wrong-owner-product-image-repair/precheck.json`
- `audit-reports/311-wrong-owner-product-image-repair/postcheck.json`
- `audit-reports/311-wrong-owner-product-image-repair/media-file-inventory.json`
- `audit-reports/311-wrong-owner-product-image-repair/media-reference-inventory.json`
- `tests/media-source-of-truth-audit.test.ts`

Explicitly excluded from staging:
- Pre-existing category SVG edits under `public/assets/icons/ui/categories/*.svg`.
- Media files under `public/assets/**`.
- Upload/orphan files under `public/uploads/**`.
- DB files, env files, package files, and unrelated working-tree changes.

Commit hash is recorded in the final response after commit creation.

## Remaining Risks
- The four managed upload files identified in Steps 309 and 310 remain orphan candidates only; they were intentionally untouched.
- Empty QA/temp-looking upload directories remain present and were intentionally untouched.
- Brand placeholder logo remotes remain unchanged.
- Historical order evidence image remotes remain unchanged.
- Subcategory managed media path resolution remains a dedicated future source-code cleanup-readiness task.

## Recommended Next Step
Run Step 312 as a bounded subcategory managed media cleanup-readiness source-code fix: verify and, if needed, repair admin cleanup path resolution for the approved `/assets/categories/subcategories/**` managed category-media prefix, with focused tests and no DB mutation, media deletion, upload cleanup, seed/reset, schema/migration, payment, tracking, seller, or UI redesign work.
