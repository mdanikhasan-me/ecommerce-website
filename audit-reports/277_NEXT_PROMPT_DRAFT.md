# Step 277 Next Prompt Draft

## Recommended Next Step

Step 277 should add a disabled-by-default, read-only DB-aware orphan media audit mode.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 276: `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
* Step 276 audited the full managed media lifecycle and added pure storage-key policy tests/docs.
* Runtime physical deletion was not broadened.
* Admin route files were not edited.
* Product variant physical cleanup remains deferred.
* Local `public/uploads` remains pre-launch/local storage only.
* Production storage still needs object storage, stable storage keys, metadata, deletion ledger, recycle window, and backup/restore policy.

Goal for Step 277:
Add a disabled-by-default, read-only DB-aware orphan media audit mode that can classify managed upload files without deleting anything.

Primary goal:

When `scripts/audit-admin-media-orphans.mjs` is run normally, it must stay current safe inventory-only behavior. When an explicit local-only flag is provided, it may use the existing Prisma-compatible media reference adapter to classify managed upload candidates as referenced/protected/unreferenced/unverified without printing filenames, matched records, secrets, or PII.

Read first:

* `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
* `audit-reports/276-managed-media-lifecycle-storage-policy/media-lifecycle-policy-evidence.json`
* `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/backend/admin/media-reference-adapter.ts`
* `scripts/audit-admin-media-orphans.mjs`
* `tests/admin-media-orphan-audit.test.ts`
* `tests/admin-media-reference-adapter.test.ts`
* `tests/admin-media-reference-guard.test.ts`
* `docs/MEDIA_UPLOAD_POLICY.md`
* `prisma/schema.prisma`

Allowed work:

* Add a disabled-by-default read-only DB-aware mode to `scripts/audit-admin-media-orphans.mjs`.
* Add tests using mocked Prisma-like/reference sources only; no live DB required.
* Keep default script behavior no-DB, no-delete, no filenames.
* Add aggregate classification counts only, such as:
  * `referencedActive`
  * `referencedHistoricalEvidence`
  * `unreferencedManagedCandidate`
  * `unverifiedReferenceCheckFailed`
  * `unsafeOrUnsupported`
* Create an audit report and next prompt draft.

Allowed files:

* `scripts/audit-admin-media-orphans.mjs`
* `tests/admin-media-orphan-audit.test.ts`
* optionally new focused tests under `tests/`
* `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
* optional evidence under `audit-reports/277-db-aware-orphan-media-audit-mode/`
* `audit-reports/278_NEXT_PROMPT_DRAFT.md`

Strict guardrails:

* Do not delete real files.
* Do not add a deletion mode.
* Do not print filenames unless they are synthetic temp-fixture names in tests.
* Do not print matched records, user/order/customer data, secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or uploaded private file contents.
* Do not run DB mutations.
* Do not run migrations.
* Do not run `prisma db push`.
* Do not run seed/reset/destructive SQL.
* Do not run Docker setup.
* Do not run provider CLI.
* Do not run package updates.
* Do not deploy.
* Do not edit Prisma schema or migrations.
* Do not change route response shapes, status codes, redirects, checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior.
* Do not touch footer, newsletter, payment logos, category images, product images, PromoSection visuals, public visual design, or Flash Deals.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not use `git add .` or `git add -A`.

Implementation guidance:

* Keep default `collectAdminMediaOrphanInventory()` output backward-compatible.
* Add an opt-in function or option, not a default DB call.
* Prefer injected reference sources or Prisma-like clients in tests.
* Aggregate by counts/extensions/classes; avoid raw paths in formatted output.
* If live DB wiring is too risky, stop at adapter injection and mocked tests.
* Keep all physical deletion impossible in this script.

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
* `npx tsx --test tests/admin-media-orphan-audit.test.ts`
* `npx tsx --test tests/admin-media-reference-adapter.test.ts`
* `npx tsx --test tests/admin-media-reference-guard.test.ts`
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:
Create `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md` with:

1. Scope and starting state.
2. Files inspected.
3. Default orphan audit behavior preservation.
4. DB-aware read-only mode design.
5. Classification result fields.
6. Tests added/updated.
7. Confirmation no deletion mode exists.
8. Confirmation no real files were deleted.
9. Confirmation no prohibited actions occurred.
10. Validation results.
11. Remaining risks.
12. Recommended next step.

Commit:
If validation passes, stage exact files only and commit with:

* `test: add db-aware media orphan audit planning`

Final response format:

1. Summary of Step 277 work
2. Files changed/staged/committed
3. Default orphan audit behavior result
4. DB-aware read-only mode result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no real files/prohibited files were touched
9. Remaining risks
10. Recommended next step
```
