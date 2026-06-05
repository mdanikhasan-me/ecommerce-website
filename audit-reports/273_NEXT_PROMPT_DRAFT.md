# Step 273 Next Prompt Draft

## Recommended Next Step

Step 273 should add a DB-aware shared-reference planning/check layer for banner/category/product media deletion, without deleting real files in tests and without changing route response behavior.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 272: `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`
* Step 272 wired existing admin/product cleanup helper eligibility through the classifier.
* Step 272 added pure shared-reference planning helpers.
* Step 272 added a read-only dry-run upload inventory script.
* Runtime routes still do not perform DB-aware shared-reference checks before physical deletion.
* Local `public/uploads` is pre-launch/local storage only, not final production storage.

Goal for Step 273:
Design and add a safe DB-aware shared-reference check layer for admin media deletion planning, without deleting real files and without changing route response shapes/status codes.

Read first:

* `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`
* `audit-reports/272-admin-media-delete-helper-hardening/admin-media-orphan-dry-run-evidence.json`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `scripts/audit-admin-media-orphans.mjs`
* `tests/admin-media-lifecycle.test.ts`
* `tests/admin-media-orphan-audit.test.ts`
* `prisma/schema.prisma`
* `docs/MEDIA_UPLOAD_POLICY.md`

Primary goal:
Create a shared-reference guard that can answer whether a candidate managed upload URL is still referenced by known media fields before physical deletion.

Allowed work:

* Add a DB-query planning helper if it can be tested with mocked DB adapters only.
* Add no-DB tests using mocked reference sources.
* Update media lifecycle/admin cleanup helpers only if route behavior remains unchanged.
* Update the dry-run orphan inventory script only if it remains read-only and summary-only.
* Create `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`.
* Create `audit-reports/274_NEXT_PROMPT_DRAFT.md`.

Strict guardrails:

* Do not delete real files.
* Do not run DB mutation commands.
* Do not run migrations, `prisma db push`, seed, reset, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not edit Prisma schema or migrations.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, or private connection strings.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, or public visual design.
* Do not use `git add .` or `git add -A`.

Reference fields to consider:

* `ProductImage.url`
* `ProductVariant.image`
* `Category.image`
* `Brand.logo`
* `Brand.banner`
* `Banner.imageUrl`
* `Banner.mobileImageUrl`
* `OrderItem.imageUrl`
* `ReturnRequest.images`
* `Review.images`
* `User.image`

Implementation constraints:

* The shared-reference check must be fail-safe: if references cannot be checked, physical deletion must be refused or planned as skipped.
* Tests must use mocked DB/reference adapters only.
* Runtime physical deletion should not be broadened.
* If route integration is too risky, stop at helper plus tests and document exact integration next step.

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
* targeted media shared-reference tests
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md` with:

1. Scope and starting state
2. Files inspected
3. Reference fields mapped
4. Helper/planning changes made
5. Tests added/updated
6. Runtime integration result or deferral reason
7. Confirmation no real files were deleted
8. Confirmation no prohibited actions occurred
9. Validation results
10. Remaining risks
11. Recommended next step

Commit:
If validation passes, stage exact files only and commit with:

`fix: add admin media shared-reference guard planning`

Final response format:

1. Summary of Step 273 work
2. Files changed/staged/committed
3. Shared-reference guard result
4. Runtime integration result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no real files/prohibited files were touched
9. Remaining risks
10. Recommended next step
```
