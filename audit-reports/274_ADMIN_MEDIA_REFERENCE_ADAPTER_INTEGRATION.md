# Step 274 - Admin Media Reference Adapter Integration

## 1. Scope and Starting State

Step 274 added a read-only Prisma-compatible media reference adapter/query planner for admin media deletion safety.

Starting commit:

```text
50ec1a6 test: add admin media shared-reference guard
```

Step 273 had already added the shared-reference guard and field map, but the guard was not wired into runtime cleanup.

This step did not delete real files, did not mutate the database, and did not integrate runtime cleanup behavior.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
50ec1a6 test: add admin media shared-reference guard
ef1df3b chore: add dry-run admin media orphan audit
11082db test: add admin media deletion safety contracts
```

## 3. Files Inspected

- `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
- `audit-reports/273-admin-media-shared-reference-guard/reference-field-map.json`
- `audit-reports/274_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-reference-guard.test.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `prisma/schema.prisma`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`

## 4. Risk-Agent Decisions

Read-only lanes agreed on the same boundary:

- add the injected read-only adapter/query planner now;
- test scalar and array query shapes with mocked Prisma-like delegates;
- treat missing delegates, unconfigured fields, invalid counts, thrown errors, and partial checks as incomplete fail-safe results;
- keep route response shapes unchanged;
- defer runtime helper integration to a dedicated route-preservation step;
- avoid real file deletion, DB mutation, provider work, and private env reads.

Runtime integration was considered possible later, but only with non-throwing cleanup wrappers and explicit route/helper tests around post-mutation cleanup.

## 5. Prisma Reference Adapter/Query Planner Changes Made

Added:

- `src/backend/admin/media-reference-adapter.ts`

Exports:

- `ADMIN_MEDIA_PRISMA_REFERENCE_QUERIES`
- `AdminMediaPrismaDelegate`
- `AdminMediaPrismaDelegateName`
- `AdminMediaPrismaLikeClient`
- `AdminMediaPrismaReferenceQuery`
- `buildAdminMediaReferenceWhere()`
- `createPrismaAdminMediaReferenceSource()`
- `planAdminMediaDeletionUsingPrismaReferences()`

The adapter:

- accepts an injected Prisma-like client with count-only delegates;
- imports no global `db`;
- performs read-only `count({ where })` calls only;
- returns field counts, completeness, and sanitized error strings;
- returns no matched records, no user/order/customer details, and no PII;
- delegates the final deletion decision to `planAdminMediaDeletionWithReferences()`.

Evidence file:

- `audit-reports/274-admin-media-reference-adapter-integration/query-plan.json`

## 6. Reference Field Coverage Result

The adapter covers every Step 273 field:

- `ProductImage.url`
- `ProductVariant.image`
- `Category.image`
- `Brand.logo`
- `Brand.banner`
- `Seller.storeLogo`
- `Seller.storeBanner`
- `Banner.imageUrl`
- `Banner.mobileImageUrl`
- `OrderItem.imageUrl`
- `ReturnRequest.images`
- `Review.images`
- `User.image`

Seller media fields remain included.

Historical evidence fields remain counted separately by the shared-reference guard:

- `OrderItem.imageUrl`
- `ReturnRequest.images`
- `Review.images`
- `User.image`

## 7. Scalar/Array Query Behavior

Scalar fields use exact equality:

```ts
{ [fieldName]: candidateUrl }
```

Array/list fields use Prisma array containment:

```ts
{ [fieldName]: { has: candidateUrl } }
```

Operation-specific exclusions are field-and-value exact:

```ts
{
  [fieldName]: candidateUrl,
  NOT: { id: { in: [matchingExcludedIds] } },
}
```

An exclusion applies only when `model`, `id`, `field`, and `value` all match. Same-record retained fields are still counted.

## 8. Operation-Specific Exclusion/Integration Decision

Implemented at adapter/query-planner level:

- field-aware exclusions for update/delete contexts;
- scalar and array query shape generation;
- wrapper from Prisma-like source into the Step 273 shared-reference planner.

Deferred at runtime level:

- banner delete cleanup;
- banner update replacement cleanup;
- category hard-delete cleanup;
- product update removed-image cleanup;
- product hard-delete cleanup;
- product variant physical cleanup.

Deferral reason:

- current routes perform cleanup after DB mutation;
- product delete currently groups DB delete and cleanup in one catch/archive fallback;
- adding reference checks into live helpers requires tests proving cleanup failures/skips do not alter status codes, response bodies, redirects, or archive behavior;
- variant images are counted by the adapter, but current product cleanup candidates only include `ProductImage.url`.

## 9. Runtime Integration Result or Deferral Reason

Runtime integration was deferred.

No route files were edited.
No exported cleanup helper names were changed.
No route response behavior was changed.

Step 275 should wire the adapter into non-throwing helper-level cleanup wrappers and add route-preservation tests before physical deletion behavior changes.

## 10. Orphan Dry-Run Audit Result

Updated:

- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-orphan-audit.test.ts`

The dry-run orphan audit remains:

- read-only;
- no deletion;
- no filenames;
- no private env reads;
- no DB usage.

It now reports that a DB-aware reference adapter exists, but DB-aware reference checking is not enabled by default.

## 11. Tests Added/Updated

Added:

- `tests/admin-media-reference-adapter.test.ts`

Updated:

- `tests/admin-media-orphan-audit.test.ts`

Coverage added:

- all guard fields are represented by the adapter query map;
- Seller media fields are included;
- scalar fields produce exact equality count filters;
- array fields use Prisma `has` containment filters;
- field-and-value exact exclusions produce `NOT id in [...]`;
- mocked delegates return counts only;
- missing delegates fail safe;
- unconfigured fields fail safe;
- invalid count results fail safe;
- thrown adapter errors are redacted;
- integration with `planAdminMediaDeletionWithReferences()` requires no live DB.

## 12. Route Response Preservation Result

Route response behavior was preserved by not editing runtime route files.

Existing response contracts remain untouched:

- banner update returns `{ banner }`;
- banner delete returns `{ success: true }`;
- category update returns `{ category }`;
- category archive/delete returns the existing success shape;
- product update returns `{ product }`;
- product delete/archive returns the existing success/archive shape.

## 13. Confirmation No Real Files Were Deleted

Confirmed:

- no real files were deleted;
- no real project media files were modified;
- tests used mocks and existing temp-only media lifecycle fixtures;
- no files under `public/assets`, `public/images`, or `public/uploads` were changed.

## 14. Confirmation No Prohibited Files/Actions Occurred

Confirmed:

- no private env files were read;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, or matched record details were printed;
- no DB mutations were run;
- no migrations, `prisma db push`, seed/reset, destructive SQL, Docker setup, provider CLI, package updates, or deployment commands were run;
- no Prisma schema or migration files were edited;
- no route response behavior was changed;
- no checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior was changed;
- no footer, newsletter, payment-logo, category image, product image, PromoSection, or public visual design files were touched;
- no Flash Deals restoration occurred;
- no broad staging was used.

## 15. Validation Results

Validation passed.

Commands run:

- `git status --short` - showed only Step 274 allowed files changed/untracked.
- `git log -3 --oneline` - confirmed latest starting commit `50ec1a6`.
- `git diff --cached --name-only` - empty before staging.
- `git diff --check -- <exact changed files>` - passed, with Git line-ending warnings only.
- `node scripts/boilabin-terminal-loop-state.mjs` - passed, ready.
- `node scripts/boilabin-advisor-state.mjs` - passed, ready.
- `npm run db:url:safety` - passed; no DB connection attempted.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npx tsx --test tests/admin-media-reference-adapter.test.ts` - passed, 9/9 tests.
- `npx tsx --test tests/admin-media-reference-guard.test.ts` - passed, 8/8 tests.
- `npx tsx --test tests/admin-media-lifecycle.test.ts` - passed, 12/12 tests.
- `npx tsx --test tests/admin-media-orphan-audit.test.ts` - passed, 1/1 test.
- `node scripts/audit-admin-media-orphans.mjs` - passed as read-only dry run; no deletion, no private env read, no DB usage.
- `node scripts/audit-ai-marketing-copy.mjs` - completed with existing content-quality findings.
- `node scripts/audit-search-verification-readiness.mjs` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 419/419 tests.
- `npm run build` - passed.

## 16. Exact Files Changed/Staged

Step 274 changed:

- `src/backend/admin/media-reference-adapter.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/admin-media-reference-adapter.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `audit-reports/274-admin-media-reference-adapter-integration/query-plan.json`
- `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
- `audit-reports/275_NEXT_PROMPT_DRAFT.md`

## 17. Remaining Risks

- Runtime cleanup is not yet wired through the adapter.
- Product delete cleanup still needs route-preservation testing because cleanup currently shares the DB delete catch/archive path.
- Product variant image physical cleanup remains a separate design decision.
- DB-aware orphan confirmation is not enabled by default.
- Local `public/uploads` remains pre-launch/local storage only.
- Object storage/provider deletion remains unimplemented and out of scope.
- No durable media deletion ledger, restore window, or background cleanup job exists.

## 18. Recommended Next Step

Step 275 should wire the Prisma-compatible adapter into non-throwing admin/product cleanup wrappers with route response preservation tests. If that integration proves too broad, it should stop at wrapper tests and produce a DB-aware orphan audit integration plan.
