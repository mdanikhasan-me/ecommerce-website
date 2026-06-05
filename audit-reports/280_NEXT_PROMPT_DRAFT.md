# Step 280 Next Prompt Draft

## Recommended Next Step

Step 280 should design provider-ready media metadata schema and migration planning without creating migrations or changing runtime deletion behavior.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Step 280 title:
Provider-ready media metadata schema and migration planning

Latest completed step:

* Step 279: `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
* Step 279 commit: `<fill after Step 279 commit>`
* Step 279 designed future media ownership metadata, deletion ledger statuses, hard refusal rules, and recycle-window policy.
* Step 279 did not implement deletion, schema changes, migrations, runtime cleanup changes, provider cleanup, or asset changes.
* Step 278 remains the current read-only audit baseline:
  * default orphan audit is no-DB/no-delete/no-filenames/aggregate-only;
  * `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` is guarded, local-only, count-only, and aggregate-only.

Goal:

Design the future provider-ready media metadata and deletion-ledger schema/migration plan without editing Prisma schema or creating migrations.

This is a planning/report/test-readiness step only.

Read first:

* `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
* `audit-reports/279-media-deletion-ledger-recycle-window-policy/media-deletion-ledger-policy-evidence.json`
* `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
* `audit-reports/278-local-db-aware-orphan-media-audit-execution/local-db-aware-orphan-audit-evidence.json`
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
* `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
* `audit-reports/281_NEXT_PROMPT_DRAFT.md`
* optional evidence under `audit-reports/280-provider-ready-media-metadata-schema-plan/`

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
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not use `git add .` or `git add -A`.

Stop conditions:

* Stop if a schema edit or migration would be required.
* Stop if a test would require DB mutation.
* Stop if implementation would touch runtime cleanup, routes, provider APIs, or assets.
* Stop if private env values or raw media identifiers would need to be printed.
* Stop if the staged set contains any file outside the exact allowed list.

Design requirements:

1. Propose future `MediaAsset` style schema fields without editing schema.
2. Propose future deletion-ledger model fields without editing schema.
3. Map existing scattered media URL fields into future ownership metadata.
4. Plan safe backfill phases.
5. Plan constraints/indexes.
6. Plan rollback strategy.
7. Plan DB-backed tests required later.
8. Identify migration blockers and required manual approvals.
9. Keep product variant media ownership separate and deferred unless fully designed.
10. Keep provider/object-storage deletion disabled.

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

* `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`

The report must include:

1. Scope and starting state.
2. Latest commit verification.
3. Files inspected.
4. Proposed future media metadata model fields.
5. Proposed future deletion-ledger model fields.
6. Existing media field mapping.
7. Backfill and migration phases.
8. Constraints/indexes proposal.
9. Rollback strategy.
10. DB-backed tests required later.
11. Manual approval and blocker list.
12. Confirmation no schema/migration/runtime/provider/deletion behavior was added.
13. Validation results.
14. Exact files changed/staged.
15. Remaining risks.
16. Recommended next step.

Create:

* `audit-reports/281_NEXT_PROMPT_DRAFT.md`

Staging and commit:

Before staging:

* run `git status --short`;
* confirm changed files are only allowed;
* confirm no schema/migration/runtime/provider/deletion/assets files changed;
* confirm no DB mutation occurred;
* confirm default and local read-only orphan audits still run safely.

Stage exact files only.

Commit message:

```text
docs: plan provider-ready media metadata schema
```

Final response format:

1. Summary of Step 280 work.
2. Whether this included docs/test/helper changes or was report-only.
3. Files changed/staged/committed.
4. Media metadata schema plan result.
5. Deletion-ledger schema plan result.
6. Backfill/migration planning result.
7. Default/local read-only audit validation result.
8. Tests added/updated.
9. Validation results.
10. Commit hash/oneline, or reason no commit happened.
11. Confirmation no real files/prohibited files were touched.
12. Remaining risks.
13. Recommended next step.
```
