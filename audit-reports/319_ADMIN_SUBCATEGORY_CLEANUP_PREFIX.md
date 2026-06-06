# Step 319 Admin Subcategory Cleanup Prefix Fix

## Scope

This step fixes the Step 309 reported issue where subcategory images under `/assets/categories/subcategories/**` were classified as managed admin media but physical cleanup resolved them through the `/uploads/admin/` root.

No DB rows, media files, category SVGs, upload folders, env files, package files, Prisma schema/migrations, seed data, payment/tracking/seller code, or storefront visuals were changed.

Pre-existing dirty files intentionally left untouched:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Read-First Evidence

- `audit-reports/309-media-source-of-truth/admin-upload-destination-map.md`
- `audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-paths.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`

## Baseline Classification

Classification: real helper bug, narrow source-code fix.

Root cause:

- `classifyAdminMediaPath()` correctly allows `/assets/categories/subcategories/**` as the approved managed subcategory exception.
- `resolveReferenceSafeAdminDeletion()` also allowed that managed prefix.
- After the reference guard approved deletion, the helper called `resolveManagedMediaFilePath(..., '/uploads/admin/', ...)` unconditionally.
- Therefore an unreferenced subcategory managed image could pass classification and reference checks but still fail physical path resolution.

## Fix

Changed `src/backend/admin/admin-utils.ts` so `resolveReferenceSafeAdminDeletion()` resolves with `classification.managedPrefix` instead of hardcoding `/uploads/admin/`.

This preserves all existing gates:

- candidate must still be classifier-approved;
- candidate must still be either `/uploads/admin/**` or `/assets/categories/subcategories/**`;
- reference checks must still complete;
- active and historical references still block deletion;
- unsafe paths, query strings, fragments, traversal, remotes, data URLs, and protected source assets are still refused.

## Tests Added/Updated

- `tests/admin-media-lifecycle.test.ts`
  - verifies `/assets/categories/subcategories/mobile-phones.webp` resolves inside `public/assets/categories/subcategories`.
  - verifies subcategory root and query-string variants are refused.
- `tests/admin-media-runtime-cleanup.test.ts`
  - verifies an unreferenced temp subcategory fixture is deleted only after a complete zero-reference check.

Focused evidence:

- `audit-reports/319-admin-subcategory-cleanup-prefix/focused-tests.txt`

Result:

- 25 tests passed, 0 failed.

## Validation

Focused and full validation results:

- `npm exec -- tsx --test tests/admin-media-lifecycle.test.ts tests/admin-media-runtime-cleanup.test.ts --test-reporter=spec` passed: 25 tests, 0 failures.
- `npm run db:url:safety` passed.
- `npm run db:prisma:local:validate` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 553 tests, 83 suites, 0 failures.
- `npm run build` passed.

Prisma generate:

- `npm run db:prisma:local:generate` reached Prisma generate but failed with the known Windows engine lock:
  `EPERM: operation not permitted, rename ... query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node`
- Candidate Node processes were listed in `audit-reports/319-admin-subcategory-cleanup-prefix/prisma-generate-locking-processes.txt`.
- No processes were killed.

## Files To Stage

Stage only:

- `src/backend/admin/admin-utils.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`
- `audit-reports/319_ADMIN_SUBCATEGORY_CLEANUP_PREFIX.md`
- `audit-reports/319_NEXT_PROMPT_DRAFT.md`
- `audit-reports/319-admin-subcategory-cleanup-prefix/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- This does not add ownership metadata, deletion ledger, recycle window, or provider storage behavior.
- Physical deletion remains deliberately guarded by current reference checks.
- Existing dirty category SVG and upload-directory changes remain outside this step.

## Recommended Next Step

Run full validation and commit this Step 319 fix if validation passes. Then continue with the next narrow prelaunch closure pass from the audit queue.
