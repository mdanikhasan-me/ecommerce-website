# Step 278 Next Prompt Draft

## Recommended Next Step

Step 278 should add safe local read-only Prisma execution for the orphan media audit behind explicit guardrails, or stop at a plan if local DB readiness is not adequate.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 277: `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
* Step 277 added a disabled-by-default, read-only DB-aware orphan media audit function path using injected reference sources.
* Default `node scripts/audit-admin-media-orphans.mjs` remains no-DB, no-delete, no-filenames, aggregate inventory only.
* No live Prisma execution was added in Step 277.
* No deletion mode was added.
* Product variant physical cleanup remains deferred.

Goal for Step 278:
Add safe local-only read-only Prisma execution for DB-aware orphan media classification, or produce a stop/report if local readiness is not safe.

This step must not add deletion. It must not mutate the database.

Read first:

* `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
* `audit-reports/277-db-aware-orphan-media-audit-mode/orphan-audit-mode-evidence.json`
* `scripts/audit-admin-media-orphans.mjs`
* `src/backend/admin/media-reference-adapter.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-lifecycle.ts`
* `scripts/check-db-url-safety.mjs`
* `scripts/run-prisma-local.mjs`
* `tests/admin-media-orphan-audit.test.ts`
* `tests/admin-media-reference-adapter.test.ts`
* `tests/admin-media-reference-guard.test.ts`
* `.env.example`
* `.env.local.example`
* `prisma/schema.prisma`

Allowed work:

* Add an explicit local-only CLI flag, for example `--db-aware-readonly-local`, only if safety guardrails are clear.
* Use existing DB URL safety logic or a safe wrapper before any live Prisma read.
* Use count-only Prisma reads through the existing adapter.
* Keep default CLI behavior unchanged.
* Keep output aggregate-only.
* Add no-DB mocked tests for the CLI/control-flow behavior.
* If live local DB is unavailable or unsafe, do not force it; document the blocker and keep implementation disabled.

Strict guardrails:

* Do not delete real files.
* Do not add a deletion mode.
* Do not mutate DB.
* Do not run migrations.
* Do not run `prisma db push`.
* Do not run seed/reset/destructive SQL.
* Do not run Docker setup.
* Do not run provider CLI.
* Do not run package updates.
* Do not deploy.
* Do not edit Prisma schema or migrations.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, filenames, full local paths, or uploaded private file contents.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not replace, generate, download, rename, recompress, or optimize images.
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
* targeted orphan audit tests
* targeted reference adapter tests
* targeted reference guard tests
* `node scripts/audit-admin-media-orphans.mjs`
* run any new local read-only flag only if it is safe and does not print filenames/secrets
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md` with:

1. Scope and starting state.
2. Files inspected.
3. Local DB readiness and safety result.
4. Default CLI behavior preservation.
5. Local read-only mode implementation or deferral.
6. Privacy/output safety result.
7. Tests added/updated.
8. Confirmation no deletion mode exists.
9. Confirmation no DB mutation occurred.
10. Validation results.
11. Exact files changed/staged.
12. Remaining risks.
13. Recommended next step.

Create `audit-reports/279_NEXT_PROMPT_DRAFT.md`.

Commit:
If validation passes, stage exact files only and commit with one of:

* `chore: add local db-aware media orphan audit mode`
* `docs: plan local db-aware media orphan audit execution`

Final response format:

1. Summary of Step 278 work
2. Files changed/staged/committed
3. Default CLI behavior result
4. Local read-only mode result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no real files/prohibited files were touched
9. Remaining risks
10. Recommended next step
```
