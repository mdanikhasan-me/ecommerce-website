# Step 276 Next Prompt Draft

## Recommended Next Step

Step 276 should audit/design product variant media cleanup before enabling broader DB-aware orphan detection.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 275: `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
* Step 275 wired DB-aware media reference checks into non-throwing admin/product cleanup helpers.
* Existing cleanup helper names were preserved.
* Route files were not edited.
* Route response shapes were preserved.
* Tests use mocked reference sources and temp fixtures only.
* Product variant physical cleanup remains a separate design decision.
* DB-aware orphan audit mode remains disabled by default.

Goal for Step 276:
Audit and design product variant media cleanup safely before any physical deletion expansion.

Read first:

* `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
* `audit-reports/275-admin-media-runtime-reference-guard/runtime-cleanup-scope.json`
* `src/backend/admin/product-editor.ts`
* `src/backend/admin/media-reference-adapter.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-lifecycle.ts`
* `src/app/api/admin/products/[id]/route.ts`
* `tests/admin-media-runtime-cleanup.test.ts`
* `tests/admin-media-reference-adapter.test.ts`
* `tests/admin-media-reference-guard.test.ts`
* `prisma/schema.prisma`

Primary goals:

1. Map current product variant image behavior
   * identify where variant images can be supplied;
   * identify where existing variants are loaded;
   * identify whether variant image files are persisted as managed uploads;
   * identify whether route cleanup currently includes `ProductVariant.image`.

2. Decide safe cleanup policy
   * do not broaden physical deletion unless ownership is clear;
   * preserve historical evidence;
   * preserve shared-reference guard behavior;
   * document whether variant cleanup should be implemented now, deferred, or handled by DB-aware orphan audit later.

3. Add tests only if safe
   * no live DB required;
   * mocked adapters only;
   * temp filesystem fixtures only;
   * no real public media deletion.

Allowed files:

* `audit-reports/276_PRODUCT_VARIANT_MEDIA_CLEANUP_AUDIT.md`
* `audit-reports/277_NEXT_PROMPT_DRAFT.md`
* optional evidence under `audit-reports/276-product-variant-media-cleanup-audit/`
* `src/backend/admin/product-editor.ts` only if a tiny safe helper/test extraction is needed
* `tests/admin-media-runtime-cleanup.test.ts`
* new focused tests under `tests/`

Strict guardrails:

* Do not delete real files.
* Do not run DB mutations.
* Do not run migrations, `prisma db push`, seed/reset, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not edit Prisma schema or migrations.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, or uploaded private file contents.
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
* targeted product variant/media cleanup tests if added
* targeted media runtime cleanup tests
* targeted media reference adapter tests
* targeted media reference guard tests
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/276_PRODUCT_VARIANT_MEDIA_CLEANUP_AUDIT.md` with:

1. Scope and starting state
2. Files inspected
3. Current variant image behavior
4. Cleanup policy decision
5. Tests added/updated, if any
6. Confirmation no real files were deleted
7. Confirmation no prohibited actions occurred
8. Validation results
9. Remaining risks
10. Recommended next step

Commit:
If validation passes, stage exact files only and commit with one of:

* `docs: audit product variant media cleanup`
* `test: cover product variant media cleanup policy`

Final response format:

1. Summary of Step 276 work
2. Files changed/staged/committed
3. Product variant media behavior result
4. Cleanup policy result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no real files/prohibited files were touched
9. Remaining risks
10. Recommended next step
```
