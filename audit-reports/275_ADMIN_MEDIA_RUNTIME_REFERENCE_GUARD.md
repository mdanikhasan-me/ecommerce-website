# Step 275 - Admin Media Runtime Reference Guard

## 1. Scope and Starting State

Step 275 wired the DB-aware media reference guard into non-throwing admin/product cleanup helpers.

Starting commit:

```text
e9a6ac2 test: add admin media reference adapter planning
```

Step 274 had added the read-only Prisma-compatible adapter/query planner, but runtime cleanup helpers still physically deleted files without DB-aware shared-reference checks.

This step integrated at helper level only. Route files were not edited.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
e9a6ac2 test: add admin media reference adapter planning
50ec1a6 test: add admin media shared-reference guard
ef1df3b chore: add dry-run admin media orphan audit
```

## 3. Files Inspected

- `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
- `audit-reports/274-admin-media-reference-adapter-integration/query-plan.json`
- `audit-reports/275_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-reference-adapter.test.ts`
- `tests/admin-media-reference-guard.test.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `prisma/schema.prisma`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`

## 4. Risk-Agent Decisions

Read-only lanes agreed:

- keep integration helper-level;
- preserve existing route-facing helper names;
- keep classifier as first gate;
- require complete reference checks before physical deletion;
- skip deletion on active references, historical evidence references, incomplete checks, adapter errors, invalid paths, or wrong helper scope;
- make cleanup non-throwing so admin route responses do not drift;
- use mocked reference sources and temp filesystem fixtures in tests;
- do not edit route files in this step;
- keep product variant physical cleanup as a separate design decision.

The product delete route remains the sharpest response-risk area because DB delete and cleanup are in one route-level `try`. Step 275 mitigates that by making product cleanup helpers return `false` rather than throw on cleanup/reference/delete failures.

## 5. Runtime Wrapper/Helper Changes Made

Updated:

- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`

Preserved exported helper names:

- `deleteManagedAdminUpload`
- `cleanupManagedAdminUploads`
- `deleteReplacedAdminUploads`
- `deleteManagedUpload`
- `cleanupManagedUploads`
- `deleteRemovedProductImages`

Added optional helper options:

- `referenceSource`
- `exclude`
- `publicRoot`

Runtime helpers default to the Prisma-compatible adapter using the existing `db` client. Tests inject mocked reference sources.

The helpers now return boolean deletion results. Existing route callers ignore those return values, so response bodies are not widened.

## 6. Admin Banner/Category Cleanup Behavior

Admin cleanup scope remains:

- `/uploads/admin/*`

Admin cleanup refuses:

- `/uploads/products/*`
- `/assets/*`
- `/images/*`
- remote URLs
- data URLs
- roots
- traversal
- query/hash paths
- unknown paths

Behavior:

- unreferenced admin-managed temp fixtures can be deleted after complete reference checks;
- active references block deletion;
- protected historical evidence references block deletion;
- adapter failures/incomplete checks skip deletion;
- physical deletion failures return `false` and log sanitized warning metadata.

Category archive remains route-level and was not changed; it still returns before physical cleanup.

## 7. Product Cleanup Behavior

Product cleanup scope remains:

- `/uploads/products/*`

Product cleanup refuses:

- `/uploads/admin/*`
- `/assets/*`
- `/images/*`
- remote URLs
- data URLs
- roots
- traversal
- query/hash paths
- unknown paths

Behavior:

- unreferenced product-managed temp fixtures can be deleted after complete reference checks;
- active product/image/variant-style references block deletion through the shared field map;
- protected historical evidence references block deletion;
- adapter failures/incomplete checks skip deletion;
- physical deletion failures return `false` and do not throw.

Product variant physical cleanup was not added. The adapter counts `ProductVariant.image`, but current route cleanup candidates still come from `ProductImage.url`.

## 8. Shared-Reference Deletion Behavior

Deletion is physically attempted only when:

1. classifier approves the path;
2. helper scope matches the managed prefix;
3. the reference source completes successfully;
4. all required reference fields are checked;
5. active reference count is zero;
6. protected historical evidence count is zero;
7. `resolveManagedMediaFilePath()` resolves inside the approved public upload root.

If any condition fails, the helper skips physical deletion.

Evidence file:

- `audit-reports/275-admin-media-runtime-reference-guard/runtime-cleanup-scope.json`

## 9. Historical Evidence Preservation Behavior

Historical evidence fields still block physical deletion:

- `OrderItem.imageUrl`
- `ReturnRequest.images`
- `Review.images`
- `User.image`

Tests prove admin and product cleanup both skip deletion when the mocked reference source reports historical evidence references.

## 10. Route Response Preservation Result

Route files were not edited.

Existing route-facing response shapes remain:

- banner update: `{ banner }`
- banner delete: `{ success: true }`
- category update: `{ category }`
- category delete/archive: existing `{ success, deleted/archived }` shapes
- product update: `{ product }`
- product delete/archive: existing `{ success, deleted/archived }` shapes

Added source-contract test coverage confirming these response-shape strings remain present and product cleanup helper remains non-throwing.

Cleanup/reference/delete failures now return `false` from helper calls instead of throwing into route responses.

## 11. Orphan Dry-Run Audit Result

`scripts/audit-admin-media-orphans.mjs` was rerun unchanged from Step 274.

Result:

- read-only;
- no deletion;
- no filenames;
- no private env read;
- no DB usage;
- DB-aware reference adapter available;
- DB-aware reference checking remains disabled by default.

## 12. Tests Added/Updated

Added:

- `tests/admin-media-runtime-cleanup.test.ts`

Updated:

- `tests/admin-media-lifecycle.test.ts`

Coverage:

- referenced `/uploads/admin/*` candidates are not deleted;
- unreferenced `/uploads/admin/*` temp fixtures can be deleted;
- adapter failure skips admin deletion;
- historical evidence skips admin deletion;
- referenced `/uploads/products/*` candidates are not deleted;
- unreferenced `/uploads/products/*` temp fixtures can be deleted;
- adapter failure skips product deletion;
- historical evidence skips product deletion;
- admin cleanup refuses product upload paths;
- product cleanup refuses admin upload paths;
- protected, remote, root, traversal, query/hash, data, and unknown paths are refused before reference lookup;
- replaced-image cleanup helpers remain reference-safe;
- batch cleanup helpers are non-fatal;
- product cleanup failure does not throw from the helper;
- route-facing response strings remain unchanged.

## 13. Validation Results

Validation passed.

Commands run:

- `git status --short` - showed only Step 275 allowed files changed/untracked.
- `git log -3 --oneline` - confirmed latest starting commit `e9a6ac2`.
- `git diff --cached --name-only` - empty before staging.
- `git diff --check -- <exact changed files>` - passed, with Git line-ending warnings only.
- `node scripts/boilabin-terminal-loop-state.mjs` - passed, ready.
- `node scripts/boilabin-advisor-state.mjs` - passed, ready.
- `npm run db:url:safety` - passed; no DB connection attempted.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - initially hit a Windows Prisma client DLL file-lock while a local dev server was running; the project dev server process was stopped and the command then passed.
- `npx tsx --test tests/admin-media-runtime-cleanup.test.ts` - passed, 9/9 tests.
- `npx tsx --test tests/admin-media-reference-adapter.test.ts` - passed, 9/9 tests.
- `npx tsx --test tests/admin-media-reference-guard.test.ts` - passed, 8/8 tests.
- `npx tsx --test tests/admin-media-lifecycle.test.ts` - passed, 12/12 tests after the fixture was updated to inject a mocked reference source.
- `npx tsx --test tests/admin-media-orphan-audit.test.ts` - passed, 1/1 test.
- `node scripts/audit-admin-media-orphans.mjs` - passed as read-only dry run; no deletion, no private env read, no DB usage.
- `node scripts/audit-ai-marketing-copy.mjs` - completed with existing content-quality findings.
- `node scripts/audit-search-verification-readiness.mjs` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 428/428 tests.
- `npm run build` - passed.

Interim validation note:

- An initial targeted lifecycle test run exposed an old temp-fixture test that called the newly DB-aware helpers without a mocked reference source. That produced a read-only Prisma count attempt and failed. No DB mutation was performed. The test was corrected to inject a mocked zero-reference source before final validation.

## 14. Exact Files Changed/Staged

Step 275 changed:

- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`
- `audit-reports/275-admin-media-runtime-reference-guard/runtime-cleanup-scope.json`
- `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
- `audit-reports/276_NEXT_PROMPT_DRAFT.md`

## 15. Confirmation No Real Files Were Deleted

Confirmed:

- no real project media files were deleted;
- tests deleted only temp fixtures under OS temp directories;
- no files under repo `public/assets`, `public/images`, or `public/uploads` were modified or deleted.

## 16. Confirmation No Prohibited Files/Actions Occurred

Confirmed:

- no private env files were read intentionally;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, or uploaded private file contents were printed;
- no DB mutations were run;
- no migrations, `prisma db push`, seed/reset, destructive SQL, Docker setup, provider CLI, package updates, or deployment commands were run;
- no Prisma schema or migration files were edited;
- no route files were edited;
- no checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior was changed;
- no footer, newsletter, payment-logo, category image, product image, PromoSection, public visual design, or Flash Deals files were touched;
- no broad staging was used.

Interim note:

- One early targeted test run attempted a read-only reference count through the default Prisma adapter before the legacy temp-fixture test was patched to inject a mock source. The final validation path uses mocked reference sources for cleanup tests and no DB mutation occurred.

## 17. Remaining Risks

- Product variant physical cleanup remains a separate design decision.
- Route-level mocked integration tests were not added because route files were not edited.
- DB-aware orphan confirmation remains disabled by default.
- Local `public/uploads` remains pre-launch/local storage only.
- Object storage/provider deletion remains unimplemented.
- No durable media deletion ledger, restore window, or background cleanup job exists.

## 18. Recommended Next Step

Step 276 should add a read-only DB-aware orphan-media audit mode or, if product variant media is the sharper risk, specifically audit/design product variant media cleanup before enabling broader orphan detection.
