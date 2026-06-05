# Step 281 - MediaAsset Migration-Safe Implementation Checklist

## 1. Scope And Starting State

Step 281 converted the provider-ready media metadata schema plan into a migration-safe implementation readiness package.

Starting commit:

```text
693d69b docs: plan provider-ready media metadata schema
```

This step added planning documentation, pure policy constants, no-DB tests, aggregate evidence, and a next prompt draft.

This step did not:

- edit `prisma/schema.prisma`;
- create migrations;
- run migrations;
- mutate the database;
- add deletion behavior;
- add cleanup jobs;
- change runtime cleanup helpers;
- add provider cleanup;
- delete real files;
- touch public assets, uploads, or images.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
693d69b docs: plan provider-ready media metadata schema
8ab6822 docs: design media deletion ledger policy
fc6da93 chore: add local db-aware media orphan audit mode
```

## 3. Files Inspected

Primary files and reports inspected:

- `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
- `audit-reports/280-provider-ready-media-metadata-schema-plan/media-schema-plan-evidence.json`
- `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
- `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
- `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
- `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
- `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
- `audit-reports/281_NEXT_PROMPT_DRAFT.md`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `prisma/schema.prisma`
- related admin media tests

Read-only agent lanes also reviewed inspection, risk, planning, QA, and report requirements before implementation.

## 4. Current Media Safety Baseline

Current baseline:

- default orphan audit is no-DB;
- default orphan audit is no-delete;
- default orphan audit is no-filenames and aggregate-only;
- local read-only audit requires explicit `--db-aware-readonly-local`;
- local read-only audit is guarded, count-only, and aggregate-only;
- `unreferencedManagedCandidate` is not deletion approval;
- current cleanup helpers rely on reference checks, not a deletion ledger;
- `MediaAsset` and `MediaDeletionLedger` do not exist;
- no migration/backfill runner exists;
- provider/storage choice is still open;
- recycle/restore workflow is absent;
- product variant ownership remains deferred.

Step 278 aggregate local read-only result remains the current audit evidence:

```text
referencedActive = 6
referencedHistoricalEvidence = 0
unreferencedManagedCandidate = 5
unverifiedReferenceCheckFailed = 0
```

## 5. Migration-Safe Implementation Checklist

Future implementation must be separated into gates:

| Step | Allowed action | Forbidden action | Required tests | Rollback or stop condition | Owner approval |
| --- | --- | --- | --- | --- | --- |
| Pre-migration approvals | Record owner decisions for schema, provider, retention, backup, seller media, and variant policy | Creating migrations before approval | Documentation review and no schema diff check | Stop if any approval is missing | yes |
| Local DB prerequisites | Verify local app/shadow database URL shape, separation, and PostgreSQL reachability | Remote-looking DB use or connection string output | DB URL safety, Prisma validate, Prisma generate | Stop if local guardrails fail | no |
| Schema design review | Review pseudo-schema, indexes, constraints, nullability, and compatibility | Editing Prisma schema in a review-only step | Schema-plan contract tests and route contract inventory | Stop if API compatibility is unclear | yes |
| Migration creation | Create schema-only migration in a later approved migration step | Combining schema with backfill, cleanup, provider work, or route changes | Migration applies and rolls back locally | Roll back schema before backfill | yes |
| Backfill dry-run | Produce aggregate-only classification counts | Writing rows or outputting private identifiers | Dry-run aggregate output and field-map completeness | Stop if private identifiers would be required | no |
| Ownership-unverified backfill | Create metadata rows as `ownership_unverified` after approval | Marking backfilled rows cleanup-approved or changing public URLs | Idempotency, unchanged public URLs, route contracts | Remove metadata rows by batch id only | yes |
| New upload metadata writes | Dual-write new approved uploads to metadata while URL fields remain authoritative | Removing URL fields or changing API response shapes | Upload dual-write, mobile/API contracts, rollback | Disable metadata writes and keep URL serving | yes |
| Ledger and recycle integration | Require ledger, approval, recycle window, backup, restore, and fresh reference audit | Physical deletion without all gates | Ledger-required, stale-audit refusal, recycle-window tests | Disable cleanup job and retain ledger evidence | yes |
| Provider storage integration | Persist provider keys after provider, backup, restore, and CDN decisions | Inferring provider keys from public URLs or running provider delete | Provider key mapping and rollback tests | Continue serving existing public URLs | yes |
| Deletion job approval | Enable deletion job only in a later explicitly approved implementation | Automatic cleanup of source, historical, ownership-unverified, or stale-audit media | Manual approval, failure ledgering, restore-before-delete tests | Stop the job and restore from recycle/provider backup | yes |

## 6. Pseudo-Schema Design Summary

Future `MediaAsset`, prose only:

- identity: `id`, `mediaId`;
- storage: `storageKey`, `publicUrl`, `publicUrlHash`;
- owner: `ownerType`, `ownerId`, `ownerField`, `purpose`;
- provenance: `sourceSystem`, `uploadedByUserId`, `createdAt`, `updatedAt`, `replacedAt`;
- safety: `isSourceAsset`, `isManagedUpload`, `isHistoricalEvidence`, `status`;
- audit: `lastReferenceAuditAt`;
- integrity: `checksum`, `byteSize`, `mimeType`, `width`, `height`;
- provider: `storageProvider`, `storageBucket`, `storageRegion`, `storageNamespace`;
- metadata: JSON for bounded non-sensitive extension fields.

Future `MediaDeletionLedger`, prose only:

- ledger identity: `id`, `ledgerId`;
- media reference: `mediaAssetId`, `storageKey`, `publicUrlHash`;
- detection: `detectedBy`, `detectionRunId`, `referenceAuditSnapshot`;
- counts: `activeReferenceCount`, `historicalEvidenceReferenceCount`;
- classification: `ownershipStatus`, `candidateReason`, `refusalReason`, `status`;
- actors: `requestedBy`, `approvedBy`, `deletedBy`, `restoredBy`;
- timestamps: `requestedAt`, `quarantinedAt`, `eligibleForDeletionAt`, `deletedAt`, `restoredAt`, `createdAt`, `updatedAt`;
- provider result: bounded `providerDeleteResult`;
- failure result: sanitized `sanitizedErrorCode`.

Existing URL fields must remain authoritative until compatibility tests and owner approval say otherwise.

## 7. Manual Approval Checklist

Required owner approvals:

- schema migration creation;
- storage provider direction;
- local disk vs object storage direction;
- retention and recycle-window days;
- backup and restore owner;
- deletion approval role;
- seller media policy;
- product variant ownership policy;
- classification of existing local uploads as owner-uploaded, demo, or recovery artifacts;
- whether current unreferenced managed candidates should be backfilled only as ownership-unverified;
- raw original retention policy;
- CDN/cache invalidation plan;
- approval to create a real schema migration in a future step.

## 8. Local DB Prerequisite Checklist

Before any future migration or DB-backed media test:

- `DATABASE_URL` must classify local;
- `SHADOW_DATABASE_URL` must classify local;
- app and shadow DBs must be separate;
- local PostgreSQL must be reachable;
- Prisma validate must pass;
- Prisma generate must pass;
- there must be no pending schema or migration diff;
- a recent local backup or snapshot must be approved.

Local URL-shape readiness alone is not enough. It does not prove PostgreSQL is running and does not authorize remote, staging, or production changes.

## 9. Migration Phase Plan

Phase A: schema-only migration.

- Add future models only after owner approval.
- Do not remove existing URL fields.
- Do not backfill.

Phase B: no-op read compatibility tests.

- Prove routes, admin pages, storefront pages, and mobile/API-facing payloads still read existing URL fields.
- Stop on route response drift.

Phase C: backfill dry-run aggregate report.

- Classify existing mapped media fields without writes.
- Default output must be aggregate-only.

Phase D: ownership-unverified backfill.

- Write metadata rows only as `ownership_unverified`.
- Batch-tag rows for rollback.
- Do not create cleanup candidates.

Phase E: source and historical protection marking.

- Mark source assets protected.
- Mark historical evidence preserve-only.

Phase F: new upload metadata write path.

- Dual-write future uploads while existing URL fields remain authoritative.
- Keep API and mobile compatibility.

Phase G: ledger and recycle gate integration.

- Require ledger, approval, recycle window, backup, restore, and fresh reference audit before cleanup decisions.

Phase H: provider storage integration.

- Store provider keys only after provider, backup, restore, and CDN decisions are approved.
- Do not infer storage keys from public URLs.

Phase I: deletion job after explicit approval.

- Deletion job remains blocked until all gates and owner approvals pass in a future implementation step.

## 10. Backfill Dry-Run Design

A future dry-run backfill command should:

- be read-only by default;
- classify all current mapped media URL fields;
- classify source assets;
- classify managed upload roots;
- classify remote media;
- classify historical evidence;
- classify active references;
- classify ownership-unverified values;
- classify product variant media as deferred;
- classify seller and brand fields as policy-blocked until ownership rules are approved;
- dedupe shared URL hashes;
- emit aggregate counts only by default;
- create no `MediaAsset` rows until approved.

Default output must avoid:

- filenames;
- full paths;
- full URLs;
- record IDs;
- matched records;
- customer/order PII;
- private env values;
- uploaded private file contents.

Stop if DB safety fails, reference checks are incomplete, or output would require private identifiers.

## 11. Rollback Gates

Rollback gates:

- schema-only migration must roll back before backfill;
- backfilled metadata rows must be removable by batch id;
- new upload metadata writes must be independently disableable;
- ledger rows must be retained as audit evidence;
- provider storage keys must be reversible before URL repointing;
- recycle/quarantine state must be restorable;
- deletion job must remain disabled before any permanent action;
- no physical deletion during schema migration or backfill.

Hard rule:

```text
No physical deletion is allowed during schema migration or backfill.
```

## 12. DB-Backed Tests Required Before Migration

Future DB-backed tests required:

- migration applies locally;
- migration rolls back locally;
- no route response changes;
- public URLs remain unchanged;
- orphan audit remains aggregate-only;
- source assets are protected;
- historical evidence remains preserve-only;
- product variants are not deletion candidates;
- backfill is idempotent;
- duplicate and shared URLs are handled;
- provider keys are not inferred from public URLs;
- cleanup refuses without ledger approval;
- stale audits refuse deletion;
- recycle window is required;
- restore path exists.

## 13. Provider And Storage Blockers

Current blockers:

- storage provider is not chosen;
- local disk vs object storage direction is not approved;
- backup and restore owner is not approved;
- retention and recycle-window days are not approved;
- CDN/cache invalidation policy is not approved;
- seller media policy is not approved;
- product variant ownership is not approved;
- existing local upload provenance is not classified;
- raw original retention policy is not approved.

## 14. Stop Conditions For Future Codex Steps

Future Codex must stop when:

- `DATABASE_URL` is unsafe;
- `SHADOW_DATABASE_URL` is unsafe;
- app and shadow DBs are not separate;
- local PostgreSQL is unreachable for a DB-backed step;
- owner approval is missing;
- provider choice is missing for provider work;
- backup or restore policy is missing;
- route response drift is detected;
- validation fails;
- backfill output would expose private identifiers;
- physical deletion would be required;
- source or historical media might be touched.

## 15. Tests Added Or Updated

Updated:

- `tests/admin-media-storage-policy.test.ts`

Coverage added:

- migration-safe implementation checklist;
- local DB prerequisites;
- manual approval gates;
- Phase A-I migration gates;
- dry-run aggregate-output requirements;
- rollback gates;
- future DB-backed test matrix;
- stop conditions;
- docs and Prisma schema remain migration-readiness only.

## 16. Default And Local Read-Only Audit Validation Result

Default command:

```text
node scripts/audit-admin-media-orphans.mjs
```

Result: passed. Default dry-run remained no-DB, no-delete, aggregate-only, and did not include filenames or matched records. It reported managed upload root aggregate counts only and left DB-aware classification disabled by default.

Local read-only command:

```text
node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local
```

Result: passed. Explicit local read-only mode was allowed by local and separate DB URL guardrails, performed read-only DB reference classification, emitted aggregate counts only, and did not include filenames or matched records.

Aggregate local read-only classification:

```text
referencedActive = 6
referencedHistoricalEvidence = 0
unreferencedManagedCandidate = 5
unverifiedReferenceCheckFailed = 0
deletionPerformed = false
matchedRecordsIncluded = false
filenamesIncluded = false
```

## 17. Confirmation No Schema, Migration, Runtime, Provider, Or Deletion Behavior Was Added

Confirmed:

- no Prisma schema file was edited;
- no migration file was created;
- no migration command was run;
- no DB mutation was performed;
- no runtime cleanup helper was changed;
- no admin/API route behavior was changed;
- no provider cleanup was added;
- no deletion job was added;
- no real files were deleted;
- no public asset, upload, image, footer, newsletter, payment-logo, category image, product image, PromoSection, visual, Flash Deals, payment, tracking, seller, CSP, rate-limit, SEO, or mobile implementation file was touched.

## 18. Validation Results

Validation commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Passed before edits; worktree was clean. Post-edit status contained only the expected Step 281 files before staging. |
| `git log -3 --oneline` | Passed; latest starting commit was `693d69b`. |
| `git diff --cached --name-only` | Passed before edits and before staging; empty. |
| `git diff --check -- <exact changed files>` | Passed. Git reported line-ending normalization warnings only. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed; Advisor ready and recommended Step 282 public claims/copy correction. |
| `npm run db:url:safety` | Passed; app and shadow URLs classified local, separate, and local migration ready. |
| `npm run db:prisma:local:validate` | Passed under the local Prisma guardrail. |
| `npm run db:prisma:local:generate` | Passed under the local Prisma guardrail. |
| `npx tsx --test tests/admin-media-storage-policy.test.ts` | Passed; 17/17 tests. |
| Targeted admin media safety tests | Passed; 61/61 tests. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; default dry-run was no-DB, no-delete, aggregate-only. |
| `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` | Passed; local read-only audit emitted aggregate counts only and performed no deletion. |
| `node scripts/audit-ai-marketing-copy.mjs` | Passed as an audit command; 51 known public-claims findings remain for the Step 282 backlog. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed; 450/450 tests. |
| `npm run build` | Passed. |

## 19. Exact Files Changed Or Staged

Expected Step 281 files:

- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/admin/media-lifecycle.ts`
- `tests/admin-media-storage-policy.test.ts`
- `audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md`
- `audit-reports/281-media-asset-migration-safe-implementation-checklist/media-migration-readiness-evidence.json`
- `audit-reports/282_NEXT_PROMPT_DRAFT.md`

No schema, migration, runtime cleanup, route, provider, DB mutation, asset, upload, image, visual, payment, tracking, seller, CSP, rate-limit, SEO, or mobile implementation files are expected in the staged set.

## 20. Remaining Risks

- `MediaAsset` and `MediaDeletionLedger` are not implemented.
- No schema migration exists yet.
- No backfill runner exists.
- No provider storage choice exists.
- No recycle/restore workflow exists.
- No deletion approval UI exists.
- Existing cleanup helpers still rely on reference checks, not a ledger gate.
- Product variant ownership remains deferred.
- Current unreferenced managed candidates remain audit findings only.
- A future migration still requires explicit owner approval.

## 21. Recommended Next Step

Step 282 should pause media lifecycle implementation and return to the public claims/copy correction backlog unless the owner explicitly approves a schema/migration preflight. The media pipeline now has enough planning to avoid rushing into a migration without approval.
