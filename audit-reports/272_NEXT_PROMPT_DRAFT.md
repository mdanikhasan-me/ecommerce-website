# Step 272 Next Prompt Draft

## Recommended Next Step

Step 272 should safely harden existing admin media cleanup helpers by routing deletion eligibility through the tested classifier, without deleting real assets or changing route response behavior.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 271: `audit-reports/271_ADMIN_MEDIA_UPLOAD_DELETE_LIFECYCLE_AUDIT.md`
* Step 271 audited admin media upload/delete behavior and added a pure classifier/test contract for admin-managed media deletion candidates.
* Current banner deletion already attempts to remove local `/uploads/admin/...` files after deleting the banner row.
* Runtime cleanup is still not wired through the new classifier.
* Cross-record/shared-media reference checks are still missing.
* Local `public/uploads` remains pre-launch/local storage only, not final production storage.

Goal for Step 272:
Safely harden existing admin media cleanup helpers by routing deletion eligibility through the tested classifier, without changing route response behavior or deleting any real assets during the step.

Read first:

* `audit-reports/271_ADMIN_MEDIA_UPLOAD_DELETE_LIFECYCLE_AUDIT.md`
* `audit-reports/271-admin-media-upload-delete-lifecycle/admin-media-lifecycle-evidence.json`
* `src/backend/admin/media-lifecycle.ts`
* `tests/admin-media-lifecycle.test.ts`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `src/app/api/admin/banners/[id]/route.ts`
* `src/app/api/admin/categories/[id]/route.ts`
* `src/app/api/admin/products/[id]/route.ts`
* `docs/MEDIA_UPLOAD_POLICY.md`

Allowed work:

* Update `src/backend/admin/admin-utils.ts` only to reuse the classifier for admin upload deletion eligibility/path resolution.
* Update `src/backend/admin/product-editor.ts` only to reuse the classifier for product upload deletion eligibility/path resolution.
* Add/update tests for helper-level cleanup decisions using temp test fixtures only.
* Add a report: `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`.
* Add the next prompt draft if useful.

Strict guardrails:

* Do not change API route response shapes, status codes, or business behavior.
* Do not delete real project assets.
* Do not delete anything under `public/assets/**`, `public/images/**`, committed category images, banner images, payment logos, footer/newsletter assets, or PromoSection assets.
* Do not run cleanup against live `public/uploads`.
* Do not create an orphan cleanup script yet unless it is dry-run only and explicitly approved by the coordinator after tests.
* Do not modify Prisma schema or migrations.
* Do not run migrations, `prisma db push`, seed, reset, SQL, Docker, provider, or deployment commands.
* Do not touch checkout, payment, orders, auth, tracking, seller marketplace, CSP enforcement, rate-limit storage, mobile app code, footer, newsletter, payment logos, category images, or public visual design.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.
* Do not use `git add .` or `git add -A`.

Implementation constraints:

* Deletion eligibility must call `canDeleteAdminMediaLocalFile`, `classifyAdminMediaPath`, or `resolveManagedMediaFilePath`.
* `/assets/*`, `/images/*`, remote URLs, data URLs, unknown paths, query/hash paths, traversal, and upload-root directories must remain non-deletable.
* Product cleanup must still only consider `/uploads/products/*`.
* Admin banner/category cleanup must still only consider `/uploads/admin/*`.
* Shared-reference checks can be planned/documented, but do not add DB-backed reference queries unless they are no-op/testable without touching real DB state.

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
* targeted tests for admin media lifecycle/helper cleanup
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md` with:

1. Scope of Step 272
2. Files changed
3. Runtime helper changes made
4. Classifier reuse result
5. Tests added/updated
6. Confirmation route behavior was preserved
7. Confirmation no real assets were deleted
8. Confirmation no prohibited files/actions were touched
9. Validation results
10. Remaining shared-reference/storage risks
11. Recommended next step

Commit:
If validation passes, stage exact files only and commit with:

`fix: harden admin media cleanup eligibility`

Final response format:

1. Summary of Step 272 work
2. Files changed/staged/committed
3. Helper hardening result
4. Tests added/updated
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no real assets/prohibited files were touched
8. Remaining risks
9. Recommended next step
```
