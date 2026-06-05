# Step 274 Next Prompt Draft

## Recommended Next Step

Step 274 should add a read-only Prisma adapter/query planner for the admin media shared-reference guard, then integrate only if route response behavior remains unchanged.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 273: `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
* Step 273 added `src/backend/admin/media-reference-guard.ts`.
* Step 273 added mocked no-DB tests in `tests/admin-media-reference-guard.test.ts`.
* Step 273 mapped all known media reference fields, including Seller media fields.
* Runtime banner/category/product deletion is not yet wired through the shared-reference guard.
* No real files were deleted.
* No Prisma schema or migration changes were made.

Goal for Step 274:
Add a read-only Prisma-compatible reference adapter/query planner for admin media deletion, then integrate it into runtime cleanup only if it can preserve route response behavior and fail safe.

Read first:

* `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
* `audit-reports/273-admin-media-shared-reference-guard/reference-field-map.json`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `tests/admin-media-reference-guard.test.ts`
* `tests/admin-media-lifecycle.test.ts`
* `prisma/schema.prisma`
* `src/app/api/admin/banners/[id]/route.ts`
* `src/app/api/admin/categories/[id]/route.ts`
* `src/app/api/admin/products/[id]/route.ts`

Allowed work:

* Add a Prisma-compatible read-only adapter or query planner under `src/backend/admin/`.
* Add mocked tests for scalar and array field query shape.
* Add helper-level runtime wrappers only if route response behavior remains unchanged.
* Update admin/product cleanup helpers only if they remain fail-safe for physical deletion and fail-open to admin responses.
* Create `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`.
* Create `audit-reports/275_NEXT_PROMPT_DRAFT.md`.

Strict guardrails:

* Do not delete real files.
* Do not run DB mutations.
* Do not run migrations, `prisma db push`, seed/reset, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not edit Prisma schema or migrations.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, or private connection strings.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, or public visual design.
* Do not use `git add .` or `git add -A`.

Integration requirements:

* Classifier remains first gate.
* Reference checks must be complete before physical deletion.
* Reference check errors must skip physical deletion.
* Historical evidence references must block deletion.
* Current-record exclusions must include model, id, field, and value.
* No route response body/status changes.
* Tests must use mocked adapters; do not require a live DB.

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
Create `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md` with:

1. Scope and starting state
2. Files inspected
3. Adapter/query planner changes made
4. Runtime integration result or deferral reason
5. Tests added/updated
6. Route response preservation result
7. Confirmation no real files were deleted
8. Confirmation no prohibited actions occurred
9. Validation results
10. Remaining risks
11. Recommended next step

Commit:
If validation passes, stage exact files only and commit with one of:

* `test: add admin media reference adapter planning`
* `fix: guard admin media deletion by shared references`

Final response format:

1. Summary of Step 274 work
2. Files changed/staged/committed
3. Adapter/query planner result
4. Runtime integration result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no real files/prohibited files were touched
9. Remaining risks
10. Recommended next step
```
