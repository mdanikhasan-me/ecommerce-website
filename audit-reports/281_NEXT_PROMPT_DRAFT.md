# Step 281 Next Prompt Draft

## Recommended Next Step

Step 281 should convert the Step 280 provider-ready schema plan into a migration-safe implementation checklist and DB-backed test plan, still without creating migrations unless the owner explicitly approves a later schema step.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Step 281 title:
Migration-safe MediaAsset and deletion-ledger implementation checklist

Latest completed step:

* Step 280: `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
* Step 280 commit: `<fill after Step 280 commit>`
* Step 280 designed future provider-ready `MediaAsset` and `MediaDeletionLedger` schema plans.
* Step 280 added docs, pure policy constants, no-DB tests, and aggregate evidence only.
* Step 280 did not edit Prisma schema, create migrations, mutate DB, add deletion, change runtime cleanup, add provider cleanup, delete files, or touch assets.

Current media safety baseline:

* default orphan audit is no-DB, no-delete, no-filenames, aggregate-only;
* local read-only audit requires explicit `--db-aware-readonly-local`;
* local read-only audit is guarded, count-only, and aggregate-only;
* `unreferencedManagedCandidate` is still not deletion approval.

Goal:

Create a migration-safe implementation checklist for future `MediaAsset` and `MediaDeletionLedger` work, including local DB prerequisites, migration ordering, rollback gates, DB-backed tests, and manual approval checkpoints.

This is still planning and readiness only.

Do not edit Prisma schema.
Do not create migrations.
Do not run migrations.
Do not mutate DB.
Do not add deletion.
Do not change runtime cleanup.
Do not add provider cleanup.
Do not touch assets.

Read first:

* `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
* `audit-reports/280-provider-ready-media-metadata-schema-plan/media-schema-plan-evidence.json`
* `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
* `docs/MEDIA_UPLOAD_POLICY.md`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-reference-adapter.ts`
* `scripts/audit-admin-media-orphans.mjs`
* `prisma/schema.prisma`
* related admin media tests

Allowed files:

* `docs/MEDIA_UPLOAD_POLICY.md`
* `tests/admin-media-storage-policy.test.ts`
* `audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md`
* `audit-reports/282_NEXT_PROMPT_DRAFT.md`
* optional evidence under `audit-reports/281-media-asset-migration-safe-implementation-checklist/`

Allowed only if directly needed:

* `src/backend/admin/media-lifecycle.ts`
* new no-DB tests under `tests/`

Strict guardrails:

* Do not delete real files.
* Do not add a deletion mode.
* Do not mutate DB.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, filenames, candidate URLs, full local paths, or uploaded private file contents.
* Do not edit Prisma schema.
* Do not create migrations.
* Do not run migrations.
* Do not run `prisma db push`.
* Do not run seed/reset/destructive SQL.
* Do not run Docker setup.
* Do not run provider CLI.
* Do not run package updates.
* Do not deploy.
* Do not change route response shapes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not use `git add .` or `git add -A`.

Stop conditions:

* Stop if the implementation checklist requires a schema edit in this step.
* Stop if a migration would be created.
* Stop if a test would require DB mutation.
* Stop if runtime cleanup, routes, provider APIs, or assets would need changes.
* Stop if private env values or raw media identifiers would need to be printed.
* Stop if the staged set contains any file outside the exact allowed list.

Tasks:

1. Convert the Step 280 schema plan into a migration checklist.
2. Define exact manual approvals needed before a schema step.
3. Define local DB prerequisites and stop conditions.
4. Define the first migration shape in prose only.
5. Define migration rollback gates.
6. Define backfill dry-run requirements.
7. Define DB-backed tests required before creating a migration.
8. Define what remains blocked until provider/storage choice.
9. Add no-DB docs/tests only if useful.
10. Create the Step 281 report and Step 282 next prompt draft.

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
* targeted media policy tests if changed
* targeted media safety tests if relevant
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:

Create:

* `audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md`

The report must include:

1. Scope and starting state.
2. Latest commit verification.
3. Files inspected.
4. Migration-safe checklist.
5. Manual approval checklist.
6. Local DB prerequisite checklist.
7. First migration shape in prose only.
8. Rollback gates.
9. Backfill dry-run requirements.
10. DB-backed tests required before migration.
11. Provider/storage blockers.
12. Confirmation no schema/migration/runtime/provider/deletion behavior was added.
13. Validation results.
14. Exact files changed/staged.
15. Remaining risks.
16. Recommended next step.

Create:

* `audit-reports/282_NEXT_PROMPT_DRAFT.md`

Staging and commit:

Stage exact files only. Do not use broad staging.

Commit message:

```text
docs: plan media metadata migration checklist
```

Final response format:

1. Summary of Step 281 work.
2. Whether this included docs/test/helper changes or was report-only.
3. Files changed/staged/committed.
4. Migration-safe checklist result.
5. Manual approval/local DB prerequisite result.
6. Rollback/backfill/test planning result.
7. Default/local read-only audit validation result.
8. Tests added/updated.
9. Validation results.
10. Commit hash/oneline, or reason no commit happened.
11. Confirmation no real files/prohibited files were touched.
12. Remaining risks.
13. Recommended next step.
```
