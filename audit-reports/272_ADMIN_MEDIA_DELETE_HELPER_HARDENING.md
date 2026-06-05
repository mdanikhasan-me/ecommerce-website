# Step 272 - Admin Media Delete Helper Hardening

## Scope and Starting State

Step 272 hardened the existing admin media cleanup helper layer after Step 271 added the media path classifier and deletion safety tests.

Latest completed commit before this step:

```text
11082db test: add admin media deletion safety contracts
```

This step did not change route response shapes, did not edit route files, did not run database mutations, and did not delete real project assets.

## Latest Commit Verification

`git log -3 --oneline` at the start of the work:

```text
11082db test: add admin media deletion safety contracts
c1555f3 docs: audit public storefront content and media readiness
a3bfa21 docs: add public storefront visual acceptance qa
```

## Files Inspected

- `audit-reports/271_ADMIN_MEDIA_UPLOAD_DELETE_LIFECYCLE_AUDIT.md`
- `audit-reports/271-admin-media-upload-delete-lifecycle/admin-media-lifecycle-evidence.json`
- `audit-reports/272_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/media-lifecycle.ts`
- `tests/admin-media-lifecycle.test.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/category-editor.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `docs/MEDIA_UPLOAD_POLICY.md`
- existing upload/media tests

## Risk-Agent Decisions

Read-only lanes confirmed these decisions:

- Keep route files untouched; harden the helper layer underneath existing routes.
- Preserve existing exported helper names used by banner/category/product routes.
- Do not use generic deletion eligibility alone in runtime helpers; admin cleanup must remain `/uploads/admin/*` only, and product cleanup must remain `/uploads/products/*` only.
- Do not perform DB-backed shared-reference checks in this step.
- Do not delete real project files.
- Treat local `public/uploads` as pre-launch/local storage only.
- Keep `/assets/*`, `/images/*`, remote URLs, data URLs, upload roots, traversal, query/hash, null-byte, and unknown paths non-deletable.
- Record that tracked seed/upload-like media under `/uploads/products/*` remains a production risk until ownership/reference checks exist.

## Runtime Cleanup Helper Changes Made

`src/backend/admin/admin-utils.ts`:

- `isManagedAdminUpload()` now uses `classifyAdminMediaPath()`.
- `resolveManagedPublicUploadPath()` now delegates to `resolveManagedMediaFilePath()`.
- `deleteManagedAdminUpload()` now resolves through the classifier-backed resolver before `fs.rm`.
- Existing route-facing helper names remain unchanged.

`src/backend/admin/product-editor.ts`:

- product-only `isManagedUpload()` now uses `classifyAdminMediaPath()` and requires the `/uploads/products/` managed prefix.
- `deleteManagedUpload()` now resolves through `resolveManagedMediaFilePath()` before `fs.rm`.
- Existing product route-facing helper names remain unchanged.

`src/backend/admin/media-lifecycle.ts`:

- `resolveManagedMediaFilePath()` now accepts an optional public root for temp-fixture tests.
- `resolveManagedMediaFilePath()` refuses arbitrary future prefixes outside the approved managed upload prefixes.
- Added pure no-DB shared-reference helpers:
  - `countRemainingAdminMediaReferences()`
  - `planAdminMediaLocalDeletion()`

## Classifier Reuse Result

Runtime cleanup eligibility now flows through the Step 271 classifier/resolver for both admin and product cleanup.

The final deletion sinks still preserve strict prefix boundaries:

- admin banner/category cleanup can delete only classifier-approved `/uploads/admin/*` files;
- product cleanup can delete only classifier-approved `/uploads/products/*` files.

## Banner/Category/Product Cleanup Parity Result

The helper/test contract now verifies that banner/category/product cleanup refuses:

- `/assets/*`
- `/images/*`
- remote `http(s)` URLs
- data URLs
- upload root directories
- traversal paths
- Windows-style traversal
- query strings
- fragments
- null-byte paths
- unknown paths
- wrong managed root paths

## Shared-Reference Safety Result

Step 272 added a pure helper-level shared-reference plan:

```text
planAdminMediaLocalDeletion(candidate, remainingActiveReferences)
```

This helper refuses deletion when a classifier-approved candidate is still present in the caller-supplied remaining active references.

Runtime routes do not yet call DB-backed shared-reference checks. The unresolved production risk is intentional and documented for Step 273.

## Orphan Dry-Run Audit Result

Added:

- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-orphan-audit.test.ts`

The script is read-only and emits a summary only:

- `dryRun: true`
- `deletionPerformed: false`
- `privateEnvRead: false`
- `databaseUsed: false`
- `canDetermineOrphansWithoutDbReferences: false`

It inventories `/uploads/admin/` and `/uploads/products/` by count/extension only. It does not print filenames and does not claim true orphan status without DB references.

Evidence is summarized in:

- `audit-reports/272-admin-media-delete-helper-hardening/admin-media-orphan-dry-run-evidence.json`

## Tests Added/Updated

Updated:

- `tests/admin-media-lifecycle.test.ts`

Added:

- `tests/admin-media-orphan-audit.test.ts`

Coverage added:

- admin helper deletes only temp `/uploads/admin/...` fixtures;
- product helper deletes only temp `/uploads/products/...` fixtures;
- admin helper refuses product upload paths;
- product helper refuses admin upload paths;
- source-code assets remain untouched;
- root/traversal/query/fragment/remote/data inputs are refused;
- shared-reference helper refuses still-referenced candidates;
- resolver refuses arbitrary managed prefixes;
- dry-run script does not delete files and does not print filenames.

## Confirmation Route Response Behavior Was Preserved

No route files were edited.

Existing route callers continue to call the same exported helpers:

- `cleanupManagedAdminUploads`
- `deleteManagedAdminUpload`
- `deleteReplacedAdminUploads`
- `cleanupManagedUploads`
- `deleteManagedUpload`
- `deleteRemovedProductImages`

No API response shape, status code, redirect behavior, or business flow was changed.

## Confirmation No Real Assets Were Deleted

Confirmed:

- No real project media was deleted.
- Tests used isolated temporary directories under the OS temp folder.
- No files under `public/assets`, `public/images`, or real `public/uploads` were deleted.
- The dry-run script only read public upload directories and emitted aggregate counts.

## Confirmation No Prohibited Files/Actions Occurred

Confirmed:

- no private env files read;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, or customer/order PII printed;
- no Prisma schema or migrations edited;
- no migrations, `db push`, seed, reset, SQL, Docker, provider, package update, or deployment commands run;
- no checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior changed;
- no footer/newsletter/payment-logo/category/product/PromoSection visual assets touched;
- no Flash Deals restoration;
- no broad staging.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` | Only Step 272 allowed files were changed before staging. |
| `git log -3 --oneline` | Latest starting commit verified as `11082db test: add admin media deletion safety contracts`. |
| `git diff --cached --name-only` | Empty before staging. |
| `git diff --check -- <tracked exact changed files>` | Passed; only normal Windows LF/CRLF warnings were emitted. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed. |
| `node scripts/boilabin-advisor-state.mjs` | Passed. |
| `npm run db:url:safety` | Passed; no database connection attempted. |
| `npm run db:prisma:local:validate` | Passed; Prisma schema valid. |
| `npm run db:prisma:local:generate` | Passed; Prisma Client generated. |
| `npx tsx --test tests/admin-media-lifecycle.test.ts` | Passed; 12/12 targeted lifecycle tests. |
| `npx tsx --test tests/admin-media-orphan-audit.test.ts` | Passed; 1/1 dry-run inventory test. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; emitted dry-run summary counts only. |
| `node scripts/audit-ai-marketing-copy.mjs` | Completed with exit 0; 231 files scanned and 51 known content findings reported. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed; 402/402 tests. |
| `npm run build` | Passed; 72 static pages generated. |

## Exact Files Changed/Staged

Step 272 changed:

- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `tests/admin-media-lifecycle.test.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-orphan-audit.test.ts`
- `audit-reports/272-admin-media-delete-helper-hardening/admin-media-orphan-dry-run-evidence.json`
- `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`
- `audit-reports/273_NEXT_PROMPT_DRAFT.md`

## Remaining Risks

- Runtime deletion still does not query all DB media references before physical deletion.
- A shared `/uploads/**` file may still be deleted if two records reference it and the route has no DB-aware reference guard.
- Some source-controlled seed/demo media live under upload-like paths and need ownership classification before production deletion.
- The dry-run script cannot determine true orphan status without DB reference data.
- Local `public/uploads` is not final production media storage.
- Object storage/provider cleanup is not implemented.
- There is no deletion ledger, restore window, or durable cleanup job yet.

## Recommended Next Step

Step 273 should add a DB-aware shared-reference planning/check layer for banner/category/product media deletion. It should stay non-destructive in tests, avoid deleting real files, and prove that media referenced by another active/historical record is not physically deleted.
