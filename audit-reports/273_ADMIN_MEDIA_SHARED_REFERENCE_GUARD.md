# Step 273 - Admin Media Shared-Reference Guard

## 1. Scope and Starting State

Step 273 added a DB-aware, injected shared-reference planning layer for admin media deletion. The new helper does not delete files and does not query the real database by itself; callers must provide a reference source/adapter.

Latest completed commit before this step:

```text
ef1df3b chore: add dry-run admin media orphan audit
```

This step did not wire the guard into runtime deletion routes. Runtime integration was deferred because current cleanup occurs after DB mutation and needs a dedicated fail-safe integration step.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
ef1df3b chore: add dry-run admin media orphan audit
11082db test: add admin media deletion safety contracts
c1555f3 docs: audit public storefront content and media readiness
```

## 3. Files Inspected

- `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`
- `audit-reports/272-admin-media-delete-helper-hardening/admin-media-orphan-dry-run-evidence.json`
- `audit-reports/273_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `prisma/schema.prisma`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`

## 4. Risk-Agent Decisions

Read-only lanes confirmed:

- Physical deletion must be skipped unless a complete reference check reports zero references.
- Historical evidence fields must always preserve media.
- Reference lookup failures, incomplete results, missing fields, or adapter errors must fail safe.
- Current-record exclusions must be field-aware, not just model/id-wide.
- Runtime route responses must not change.
- No tests may delete real project media.
- Source assets and tracked upload-like files must not be treated as owned without explicit ownership proof.
- Object storage/provider behavior remains out of scope.

## 5. Reference Fields Mapped From Prisma Schema

The Step 273 field map includes every known media-like DB field found during schema inspection:

| Key | Kind | Protection | Schema evidence |
| --- | --- | --- | --- |
| `User.image` | scalar | historical evidence | `prisma/schema.prisma:90` |
| `Seller.storeLogo` | scalar | active record | `prisma/schema.prisma:184` |
| `Seller.storeBanner` | scalar | active record | `prisma/schema.prisma:185` |
| `Category.image` | scalar | active record | `prisma/schema.prisma:214` |
| `Brand.logo` | scalar | active record | `prisma/schema.prisma:234` |
| `Brand.banner` | scalar | active record | `prisma/schema.prisma:235` |
| `ProductImage.url` | scalar | active record | `prisma/schema.prisma:330` |
| `ProductVariant.image` | scalar | active record | `prisma/schema.prisma:346` |
| `OrderItem.imageUrl` | scalar | historical evidence | `prisma/schema.prisma:513` |
| `ReturnRequest.images` | array | historical evidence | `prisma/schema.prisma:554` |
| `Review.images` | array | historical evidence | `prisma/schema.prisma:575` |
| `Banner.imageUrl` | scalar | active record | `prisma/schema.prisma:622` |
| `Banner.mobileImageUrl` | scalar | active record | `prisma/schema.prisma:623` |

Evidence file:

- `audit-reports/273-admin-media-shared-reference-guard/reference-field-map.json`

## 6. Helper/Planning Changes Made

Added:

- `src/backend/admin/media-reference-guard.ts`

Exports:

- `ADMIN_MEDIA_REFERENCE_FIELDS`
- `AdminMediaReferenceSource`
- `AdminMediaReferenceCheckInput`
- `AdminMediaReferenceCheckResult`
- `AdminMediaReferenceExclusion`
- `planAdminMediaDeletionWithReferences()`

The helper:

- calls `classifyAdminMediaPath()` before any reference lookup;
- skips lookup for non-managed, source, remote, data, traversal, root, query/hash, or unknown paths;
- accepts an injected reference source;
- requires field-aware exclusions with `model`, `id`, `field`, and `value`;
- fails safe on thrown lookup errors;
- fails safe on incomplete reference results;
- redacts database URLs from thrown and returned error strings;
- returns a plan only.

## 7. Shared-Reference Guard Behavior

The guard returns `shouldDeleteLocalFile: false` when:

- the candidate is not classifier-approved;
- reference checking throws;
- reference checking is incomplete;
- required fields are missing from the result;
- adapter errors are returned;
- any active record still references the candidate;
- any historical evidence field references the candidate.

It returns `shouldDeleteLocalFile: true` only when:

- the candidate is a classifier-approved `/uploads/admin/*` or `/uploads/products/*` file;
- the injected reference source completes successfully;
- all mapped fields are checked;
- active reference count is zero;
- protected historical evidence count is zero.

## 8. Historical Evidence Preservation Behavior

The following fields are treated as historical evidence and block physical deletion:

- `OrderItem.imageUrl`
- `ReturnRequest.images`
- `Review.images`
- `User.image`

Tests prove scalar and array historical references block deletion planning.

## 9. Runtime Integration Result or Deferral Reason

Runtime integration was deferred.

Reason:

- banner, category, and product delete flows currently perform DB mutation before physical cleanup;
- update flows perform post-update replacement cleanup;
- route responses must remain unchanged;
- cleanup failures must not turn successful admin mutations into response drift;
- field-aware exclusion data must be operation-specific;
- a runtime adapter should be read-only, complete, non-throwing to clients, and tested separately.

No route files were edited.

## 10. Dry-Run Orphan Audit Result

The Step 272 dry-run script was rerun unchanged:

- `scripts/audit-admin-media-orphans.mjs`

Result:

- read-only;
- no deletion;
- no private env read;
- no DB usage;
- summary counts/extensions only;
- cannot determine true orphan status without DB references.

## 11. Tests Added/Updated

Added:

- `tests/admin-media-reference-guard.test.ts`

Coverage:

- field map includes all known schema media fields, including `Seller.storeLogo` and `Seller.storeBanner`;
- unreferenced classifier-approved admin/product uploads can be planned as deletable in mocked context;
- active record references block deletion;
- historical evidence references block deletion;
- remote/source/unknown/unsafe paths are refused before adapter lookup;
- thrown reference lookup errors fail safe and redact DB URLs;
- incomplete/partial reference checks fail safe;
- field-aware current-record exclusion does not ignore same-record retained fields;
- array fields are handled safely.

## 12. Validation Results

Validation passed.

Commands run:

- `npx tsx --test tests/admin-media-reference-guard.test.ts` - passed, 8/8 tests.
- `npx tsx --test tests/admin-media-lifecycle.test.ts` - passed, 12/12 tests.
- `npx tsx --test tests/admin-media-orphan-audit.test.ts` - passed, 1/1 test.
- `node scripts/audit-admin-media-orphans.mjs` - passed as read-only dry run; no deletion, no private env read, no DB usage.
- `node scripts/boilabin-terminal-loop-state.mjs` - passed, ready.
- `node scripts/boilabin-advisor-state.mjs` - passed, ready.
- `npm run db:url:safety` - passed; URL-shape readiness local, no DB connection attempted.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `node scripts/audit-ai-marketing-copy.mjs` - completed with existing content-quality findings.
- `node scripts/audit-search-verification-readiness.mjs` - passed.
- `npm run typecheck` - passed after a type-only map annotation fix in the new helper.
- `npm run lint` - passed.
- `npm test` - passed, 410/410 tests.
- `npm run build` - passed.

## 13. Exact Files Changed/Staged

Step 273 changed:

- `src/backend/admin/media-reference-guard.ts`
- `tests/admin-media-reference-guard.test.ts`
- `audit-reports/273-admin-media-shared-reference-guard/reference-field-map.json`
- `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
- `audit-reports/274_NEXT_PROMPT_DRAFT.md`

## 14. Confirmation No Real Files Were Deleted

Confirmed:

- no real project files or media were deleted;
- no filesystem deletion was added by the new reference-guard tests;
- no files under `public/assets`, `public/images`, or `public/uploads` were modified or deleted.

## 15. Confirmation No Prohibited Files/Actions Occurred

Confirmed:

- no private env files were read;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, or private connection strings were printed;
- no migrations, `prisma db push`, seed/reset, SQL, Docker, provider CLI, package updates, or deployment commands were run;
- no Prisma schema or migration files were edited;
- no route response behavior was changed;
- no checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior was changed;
- no visual, footer, newsletter, payment-logo, category image, product image, or PromoSection files were touched;
- no Flash Deals restoration;
- no broad staging.

## 16. Remaining Risks

- The shared-reference guard is not yet wired into runtime deletion helpers/routes.
- No real Prisma adapter exists yet.
- Runtime integration needs operation-specific, field-aware exclusions.
- Tracked seed/upload-like media under `/uploads/products/*` still need ownership classification.
- Local `public/uploads` remains pre-launch/local storage only.
- Object storage/provider deletion is not implemented.
- No media deletion ledger, restore window, or durable cleanup job exists.

## 17. Recommended Next Step

Step 274 should add a read-only Prisma adapter/query planner for the shared-reference guard and then wire it into admin/product cleanup only if route response behavior remains unchanged. If runtime integration is still too risky, Step 274 should stop at adapter tests and a precise integration plan.
