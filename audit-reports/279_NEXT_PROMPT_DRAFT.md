# Step 279 Next Prompt Draft

## Recommended Next Step

Step 279 should design the media deletion ledger and recycle-window policy without implementing deletion, migrations, object storage, provider cleanup, or runtime behavior changes.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Step 279 title:
Media deletion ledger and recycle-window policy design

Latest completed step:

* Step 278: `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
* Step 278 added explicit local-only read-only orphan media audit mode:
  `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local`
* Default orphan audit remains no-DB, no-delete, no-filenames, aggregate-only.
* The local read-only flag is guarded by DB URL safety and uses count-only Prisma reference checks.
* Live local read-only execution ran successfully and reported aggregate classifications only.
* `unreferencedManagedCandidate` is still not safe-to-delete.

Goal:

Design a future media deletion ledger and recycle-window policy so Boilabin can eventually clean up owned managed uploads without deleting source assets, shared media, historical evidence, or files it cannot prove it owns.

This is a design/report/test-readiness step only.

Do not implement deletion.
Do not create migrations.
Do not edit Prisma schema.
Do not run migrations, db push, seed, reset, SQL, Docker, provider CLI, or deployment commands.

Read first:

* `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
* `audit-reports/278-local-db-aware-orphan-media-audit-execution/local-db-aware-orphan-audit-evidence.json`
* `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
* `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
* `scripts/audit-admin-media-orphans.mjs`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-reference-adapter.ts`
* `docs/MEDIA_UPLOAD_POLICY.md`
* `prisma/schema.prisma`
* related admin media tests

Allowed files:

* `docs/MEDIA_UPLOAD_POLICY.md`
* `tests/admin-media-storage-policy.test.ts`
* `tests/admin-media-orphan-audit.test.ts` only if a no-DB policy assertion is useful
* `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
* `audit-reports/280_NEXT_PROMPT_DRAFT.md`
* optional evidence under `audit-reports/279-media-deletion-ledger-recycle-window-policy/`

Strict guardrails:

* Do not delete real files.
* Do not add a deletion mode.
* Do not mutate DB.
* Do not create/edit Prisma schema or migrations.
* Do not run migrations, `prisma db push`, seed/reset/destructive SQL, Docker setup, provider CLI, package updates, or deployment.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, filenames, candidate URLs, full local paths, or uploaded private file contents.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not use `git add .` or `git add -A`.

Design requirements:

Document a future policy for:

1. Media ownership metadata:
   * owner type and owner id;
   * media id or storage key;
   * source system;
   * managed root or future object-storage namespace;
   * uploaded by;
   * created/replaced timestamps.

2. Deletion ledger:
   * candidate path or future storage key;
   * detected by;
   * reference-check result;
   * active reference count;
   * historical evidence count;
   * reason;
   * status such as candidate, quarantine, approved, deleted, restored, refused;
   * audit actor and timestamps;
   * sanitized error code only.

3. Recycle window:
   * minimum hold period;
   * restore path;
   * backup assumptions;
   * no immediate physical deletion;
   * manual approval requirements.

4. Safety blockers:
   * source assets protected;
   * shared media protected;
   * historical evidence protected;
   * incomplete reference checks protected;
   * unknown ownership protected;
   * tracked upload-like files not automatically deletable.

5. Future implementation boundaries:
   * migration needed later;
   * no runtime deletion until ledger exists;
   * no provider/object storage delete until provider policy exists;
   * variant cleanup still separate.

Tests:

Add or update no-DB tests only if useful:

* storage policy test that deletion ledger/recycle window are documented as future/not implemented;
* orphan audit test that local read-only output still does not claim safe deletion.

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
* targeted media policy/orphan tests if changed
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

* `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`

The report must include:

1. Scope and starting state.
2. Latest commit verification.
3. Files inspected.
4. Current media audit capability summary.
5. Proposed ownership metadata policy.
6. Proposed deletion ledger fields and statuses.
7. Proposed recycle-window policy.
8. Safety blockers and refusal rules.
9. Future migration requirements.
10. Future runtime/provider requirements.
11. Tests added/updated, if any.
12. Confirmation no deletion/schema/migration/runtime/provider behavior was added.
13. Validation results.
14. Exact files changed/staged.
15. Remaining risks.
16. Recommended next step.

Create:

* `audit-reports/280_NEXT_PROMPT_DRAFT.md`

Staging and commit:

Before staging:

* run `git status --short`;
* confirm changed files are only allowed;
* confirm no real files were deleted or modified;
* confirm no public assets/uploads/images were touched;
* confirm no DB mutation occurred;
* confirm no route behavior changed;
* confirm the report is policy/design only.

Stage exact files only.

Do not use broad staging.

Commit message:

```text
docs: design media deletion ledger policy
```

Final response format:

1. Summary of Step 279 work.
2. Whether this included docs/test changes or was report-only.
3. Files changed/staged/committed.
4. Ledger/recycle-window policy result.
5. Default/local read-only audit behavior result.
6. Tests added/updated.
7. Validation results.
8. Commit hash/oneline, or reason no commit happened.
9. Confirmation no real files/prohibited files were touched.
10. Remaining risks.
11. Recommended next step.
```
