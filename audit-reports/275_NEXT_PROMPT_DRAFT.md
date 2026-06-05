# Step 275 Next Prompt Draft

## Recommended Next Step

Step 275 should safely wire the read-only Prisma media reference adapter into admin/product cleanup wrappers while preserving route response behavior.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 274: `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
* Step 274 added `src/backend/admin/media-reference-adapter.ts`.
* Step 274 added mocked no-DB tests in `tests/admin-media-reference-adapter.test.ts`.
* Step 274 updated the orphan dry-run audit to state DB-aware reference checking is not enabled by default.
* Runtime cleanup integration was deferred.
* No real files were deleted.
* No DB mutation, Prisma schema/migration, route response, or runtime cleanup behavior was changed.

Goal for Step 275:
Wire the Prisma-compatible media reference adapter into non-throwing admin/product cleanup wrappers only if route response behavior remains unchanged and physical deletion remains fail-safe.

Read first:

* `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
* `audit-reports/274-admin-media-reference-adapter-integration/query-plan.json`
* `src/backend/admin/media-reference-adapter.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `tests/admin-media-reference-adapter.test.ts`
* `tests/admin-media-reference-guard.test.ts`
* `tests/admin-media-lifecycle.test.ts`
* `src/app/api/admin/banners/[id]/route.ts`
* `src/app/api/admin/categories/[id]/route.ts`
* `src/app/api/admin/products/[id]/route.ts`
* `prisma/schema.prisma`

Primary goals:

1. Add non-throwing cleanup wrappers
   * Use the adapter and shared-reference guard before physical deletion.
   * Keep classifier as first gate.
   * Skip physical deletion on incomplete reference checks, adapter errors, active references, or historical evidence references.
   * Do not expose plan metadata to route responses.

2. Preserve route response behavior
   * Banner update remains `{ banner }`.
   * Banner delete remains `{ success: true }`.
   * Category update remains `{ category }`.
   * Category archive/delete response shapes remain unchanged.
   * Product update remains `{ product }`.
   * Product delete/archive response shapes remain unchanged.
   * Cleanup skip/failure must not turn a successful DB mutation into an error response.

3. Add focused tests
   * Mock Prisma-like delegates only; no live DB required.
   * Use temp filesystem fixtures only if testing physical deletion.
   * Prove referenced files are skipped.
   * Prove unreferenced temp fixtures can be deleted in temp context.
   * Prove adapter failure skips deletion.
   * Prove route-level source contracts are unchanged if route files are edited.
   * Prove product delete cleanup failure does not trigger archive fallback.

Allowed files:

* `src/backend/admin/media-reference-adapter.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `tests/admin-media-reference-adapter.test.ts`
* `tests/admin-media-reference-guard.test.ts`
* `tests/admin-media-lifecycle.test.ts`
* new focused tests under `tests/`
* `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
* `audit-reports/276_NEXT_PROMPT_DRAFT.md`
* optional evidence under `audit-reports/275-admin-media-runtime-reference-guard/`

Allowed route files only if absolutely necessary and route response preservation is tested:

* `src/app/api/admin/banners/[id]/route.ts`
* `src/app/api/admin/categories/[id]/route.ts`
* `src/app/api/admin/products/[id]/route.ts`

Strict guardrails:

* Do not delete real files.
* Do not run DB mutations.
* Do not run migrations, `prisma db push`, seed/reset, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not edit Prisma schema or migrations.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, or matched record details.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not use `git add .` or `git add -A`.

Validation:

* `git status --short`
* `git log -3 --oneline`
* `git diff --cached --name-only`
* `git diff --check -- <exact changed files>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted media runtime cleanup tests
* targeted media reference adapter tests
* targeted media reference guard tests
* targeted media lifecycle tests
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md` with:

1. Scope and starting state
2. Files inspected
3. Runtime wrapper changes made
4. Route response preservation result
5. Shared-reference deletion behavior
6. Historical evidence preservation result
7. Tests added/updated
8. Confirmation no real files were deleted
9. Confirmation no prohibited actions occurred
10. Validation results
11. Remaining risks
12. Recommended next step

Commit:
If validation passes, stage exact files only and commit with:

`fix: guard admin media deletion by shared references`

Final response format:

1. Summary of Step 275 work
2. Files changed/staged/committed
3. Runtime integration result
4. Route response preservation result
5. Shared-reference/historical evidence guard result
6. Tests added/updated
7. Validation results
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no real files/prohibited files were touched
10. Remaining risks
11. Recommended next step
```
