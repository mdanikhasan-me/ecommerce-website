# Step 282 Next Prompt Draft

## Recommended Next Step

Step 282 should pause media lifecycle implementation and return to the public claims/copy correction backlog. The media lifecycle pipeline now has enough planning to avoid rushing into schema work without explicit owner approval.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Step 282 title:
Public claims and marketing copy correction pass

Latest completed step:

* Step 281: `audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md`
* Step 281 commit: `<fill after Step 281 commit>`
* Step 281 created a migration-safe implementation readiness package for future `MediaAsset` and `MediaDeletionLedger` work.
* Step 281 did not edit Prisma schema, create migrations, mutate DB, add deletion, change runtime cleanup, add provider cleanup, delete files, or touch assets.

Media lifecycle status:

* default orphan audit remains no-DB/no-delete/no-filenames/aggregate-only;
* local read-only audit remains explicit, guarded, count-only, and aggregate-only;
* `unreferencedManagedCandidate` remains an audit finding, not deletion approval;
* `MediaAsset` and `MediaDeletionLedger` remain unimplemented;
* a future schema/migration step requires explicit owner approval.

Goal:

Fix high-risk public claims and marketing copy that could mislead users before launch, without changing runtime architecture, database schema, media lifecycle behavior, payment/tracking/seller features, or visual design.

Read first:

* `audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md`
* `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
* `docs/CONTENT_QUALITY_GUIDELINES.md`
* `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md`
* `README.md`
* `prisma/seed.ts`
* `node scripts/audit-ai-marketing-copy.mjs` output
* relevant visible copy source files identified by the audit

Allowed work:

* Edit factual documentation/copy only.
* Update seed/demo product copy only if it removes unsupported claims and does not change schema or product lifecycle behavior.
* Add/update no-DB tests if useful to prevent unsupported public claims from returning.
* Create Step 282 report and Step 283 next prompt draft.

Strict guardrails:

* Do not edit Prisma schema.
* Do not create migrations.
* Do not run migrations.
* Do not mutate DB.
* Do not run seed/reset/db push/destructive SQL.
* Do not change API response shapes, status codes, redirects, auth, checkout, payment, tracking, seller, media lifecycle, CSP, rate-limit, mobile, SEO architecture, or product lifecycle behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals restoration.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, filenames, candidate URLs, full local paths, or private uploaded file contents.
* Do not use `git add .` or `git add -A`.

Stop conditions:

* Stop if claim correction would require business/legal proof the repo does not contain.
* Stop if copy changes would alter runtime behavior or product data semantics.
* Stop if changes would touch prohibited visual/media/schema/runtime files.
* Stop if validation fails for a task-caused reason.
* Stop if staged files fall outside the exact allowed list.

Validation:

* `git status --short`
* `git log -3 --oneline`
* `git diff --cached --name-only`
* `git diff --check -- <exact changed files>`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted content/copy tests if changed
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:

Create:

* `audit-reports/282_PUBLIC_CLAIMS_COPY_CORRECTION.md`

The report must include:

1. Scope and starting state.
2. Latest commit verification.
3. Files inspected.
4. Unsupported claims found.
5. Copy changes made.
6. Claims intentionally left unchanged and why.
7. Tests added/updated, if any.
8. Validation results.
9. Exact files changed/staged.
10. Confirmation no schema/runtime/media/payment/tracking/seller/visual behavior was changed.
11. Remaining risks.
12. Recommended next step.

Create:

* `audit-reports/283_NEXT_PROMPT_DRAFT.md`

Staging and commit:

Stage exact files only. Do not use broad staging.

Commit message:

```text
docs: correct unsupported prelaunch claims
```

Final response format:

1. Summary of Step 282 work.
2. Whether this included docs/copy/test changes or was report-only.
3. Files changed/staged/committed.
4. Unsupported claims corrected.
5. Claims left unchanged.
6. Tests added/updated.
7. Validation results.
8. Commit hash/oneline, or reason no commit happened.
9. Confirmation no prohibited files were touched.
10. Remaining risks.
11. Recommended next step.
```
