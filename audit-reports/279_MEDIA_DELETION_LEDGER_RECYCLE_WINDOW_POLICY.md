# Step 279 - Media Ownership Ledger, Deletion Ledger, And Recycle-Window Policy Design

## 1. Scope And Starting State

Step 279 designed the future media ownership metadata, deletion ledger, and recycle-window policy that must exist before Boilabin can safely clean up managed upload media.

Starting commit:

```text
fc6da93 chore: add local db-aware media orphan audit mode
```

This was a policy, docs, pure-helper-constant, and no-DB test-readiness step. It did not add deletion, migrations, Prisma schema changes, object storage, provider cleanup, runtime cleanup jobs, route behavior, or real file deletion.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
fc6da93 chore: add local db-aware media orphan audit mode
c3a3f57 test: add db-aware media orphan audit planning
97af652 test: cover managed media storage policy
```

## 3. Files Inspected

Primary files and reports inspected:

- `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
- `audit-reports/278-local-db-aware-orphan-media-audit-execution/local-db-aware-orphan-audit-evidence.json`
- `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
- `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
- `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
- `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
- `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
- `audit-reports/279_NEXT_PROMPT_DRAFT.md`
- `scripts/audit-admin-media-orphans.mjs`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `prisma/schema.prisma`
- related admin media tests

## 4. Current Media Audit Capability Summary

Current safe capabilities:

- default orphan audit inventories managed upload roots;
- default orphan audit uses no DB;
- default orphan audit deletes nothing;
- default orphan audit prints no filenames or matched records;
- explicit local read-only audit flag can count references through Prisma after local DB safety guardrails pass;
- local read-only audit emits aggregate classification counters only.

Current limits:

- it cannot prove file ownership;
- it cannot safely delete files;
- it cannot provide restore;
- it cannot enforce provider/object-storage lifecycle;
- it cannot resolve races between an audit and later DB/file changes;
- it cannot replace a deletion ledger, recycle window, approval flow, or backup policy.

Step 278 live local read-only result:

```text
referencedActive = 6
referencedHistoricalEvidence = 0
unreferencedManagedCandidate = 5
unverifiedReferenceCheckFailed = 0
```

## 5. Why `unreferencedManagedCandidate` Is Not Safe-To-Delete

`unreferencedManagedCandidate` only means:

- the path was under a classifier-approved managed upload prefix;
- the count-only reference adapter reported zero mapped references at audit time;
- the reference check completed for the mapped fields.

It does not prove:

- the file is owned by Boilabin runtime uploads;
- the file is not a tracked demo/recovery upload-like file;
- the file is safe to remove from provider/object storage;
- the audit is still current;
- backups and restore are ready;
- a deletion ledger exists;
- a recycle window has elapsed;
- a human approved permanent deletion.

Therefore current candidates remain audit findings, not cleanup instructions.

## 6. Proposed Media Ownership Metadata

Future physical deletion requires durable ownership metadata. Required fields should include:

- `mediaId`
- `storageKey`
- `publicUrl`
- `ownerType`
- `ownerId`
- `ownerField`
- `purpose`
- `sourceSystem`
- `uploadedByUserId`
- `createdAt`
- `replacedAt`
- `lastReferenceAuditAt`
- `checksum`
- `byteSize`
- `mimeType`
- `width`
- `height`
- `storageProvider`
- `storageBucket`
- `storageRegion`
- `isSourceAsset`
- `isManagedUpload`
- `isHistoricalEvidence`
- `status`

The pure policy constant `MEDIA_OWNERSHIP_REQUIRED_FOR_PHYSICAL_DELETE` now captures the minimum required field names for future testable design. This is not a schema change.

Fields that are mandatory before physical deletion can be trusted:

- stable media identity: `mediaId`, `storageKey`;
- ownership boundary: `ownerType`, `ownerId`, `ownerField`, `purpose`, `sourceSystem`;
- storage boundary: `storageProvider`, bucket/region when applicable;
- safety flags: source asset, managed upload, historical evidence, status;
- auditability: created/replaced/audited timestamps;
- integrity metadata: checksum, byte size, MIME type, dimensions.

## 7. Proposed Deletion Ledger Fields

A future deletion ledger should record:

- `ledgerId`
- `mediaId`
- `storageKey`
- `publicUrlHash` or sanitized URL fingerprint
- `detectedBy`
- `detectionRunId`
- `referenceAuditSnapshot`
- `activeReferenceCount`
- `historicalEvidenceReferenceCount`
- `ownershipStatus`
- `candidateReason`
- `refusalReason`
- `status`
- `requestedBy`
- `approvedBy`
- `deletedBy`
- `restoredBy`
- `requestedAt`
- `quarantinedAt`
- `eligibleForDeletionAt`
- `deletedAt`
- `restoredAt`
- `providerDeleteResult`
- `sanitizedErrorCode`

The ledger must not store raw provider errors, full DB URLs, secrets, private paths, matched record payloads, or customer/order PII.

## 8. Proposed Ledger Statuses

Future statuses are defined as:

- `observed`
- `candidate`
- `refused`
- `quarantined`
- `pending_approval`
- `approved`
- `deleted`
- `delete_failed`
- `restored`
- `expired`
- `cancelled`

The pure constant `MEDIA_DELETION_LEDGER_STATUSES` pins this vocabulary for future design tests. It does not implement persistence or deletion.

## 9. Proposed Recycle-Window Policy

Future permanent deletion should require:

- minimum 30-day hold period before permanent delete;
- manual approval before permanent delete;
- restore capability before permanent delete;
- backup coverage before permanent delete;
- provider delete policy before permanent delete;
- CDN/cache invalidation plan after delete;
- cancellation or restore if the file becomes referenced again;
- re-audit before approval and before permanent delete;
- `delete_failed` ledger status when provider deletion fails.

The pure constant `MEDIA_RECYCLE_WINDOW_POLICY` records this as policy only:

```text
implemented = false
minimumHoldDaysBeforePermanentDelete = 30
manualApprovalRequired = true
restoreMustBePossibleBeforePermanentDelete = true
backupRequiredBeforePermanentDelete = true
providerDeletePolicyRequired = true
```

## 10. Safety Blockers And Hard Refusal Rules

Future deletion must refuse when any of these are true:

- `source_asset_protected`
- `outside_managed_root`
- `remote_without_owned_storage_key`
- `ownership_metadata_missing`
- `reference_check_incomplete`
- `active_reference_exists`
- `historical_evidence_reference_exists`
- `tracked_upload_like_file_without_ownership`
- `audit_result_stale`
- `provider_delete_policy_missing`
- `backup_restore_policy_missing`
- `deletion_ledger_missing`
- `recycle_window_not_satisfied`

The pure constant `MEDIA_DELETION_HARD_REFUSAL_REASONS` now pins this list for future no-DB tests.

## 11. Product Variant Media Policy

Current status:

- `ProductVariant.image` blocks deletion as a reference;
- product variant images are not yet cleanup candidates;
- runtime product cleanup candidates are still based on `ProductImage.url`;
- variant image ownership is ambiguous.

Future policy:

- variant images should become separate managed media records only after ownership metadata exists;
- variant references must not cause shared gallery images to be deleted;
- variant cleanup should wait for schema design, route/UI tests, ownership metadata, and ledger support;
- historical orders containing variant images must remain protected evidence.

## 12. Source Assets Vs Managed Upload Policy

Source assets:

- live under `/assets/*` and `/images/*`;
- are committed application assets;
- must never be deleted by admin cleanup;
- remain protected even if a database row references them.

Managed uploads:

- currently live under `/uploads/admin/*` and `/uploads/products/*`;
- are local/pre-launch upload roots;
- are not enough proof of production ownership by prefix alone;
- require future media metadata/storage keys before physical deletion.

Tracked upload-like files under managed roots must be treated as ownership-unverified until metadata proves otherwise.

## 13. Object Storage And Provider Future Requirements

Future production cleanup requires:

- stable storage keys;
- object storage and CDN architecture;
- provider delete API behavior and error mapping;
- bucket lifecycle rules;
- backup and restore policy;
- deletion ledger;
- recycle window;
- count-only reference audit job;
- no public URL inference as ownership proof;
- provider-specific quarantine/restore behavior;
- CDN/cache invalidation rules.

No provider or object-storage integration was added in Step 279.

## 14. Future Migration Requirements

Future DB work should be a separate approved step. It will likely need:

- media ownership table/model;
- deletion ledger table/model;
- migration plan from existing scattered URL fields;
- backfill strategy for current local uploads;
- retention status and source/historical flags;
- admin audit trail fields;
- indexes for storage key, owner, status, and audit timestamps;
- rollback and backup plan.

Step 279 did not edit `prisma/schema.prisma` and did not create migrations.

## 15. Future Runtime And Provider Requirements

Future runtime cleanup must not run until:

- media ownership metadata exists;
- deletion ledger exists;
- recycle window exists;
- restore path exists;
- provider delete policy exists;
- backup/restore policy exists;
- re-audit-before-delete exists;
- admin approval flow exists;
- route/API response contracts are tested;
- output remains sanitized and aggregate-safe.

Current runtime cleanup helpers were not changed in Step 279.

## 16. Tests Added Or Updated

Updated:

- `tests/admin-media-storage-policy.test.ts`
- `tests/admin-media-orphan-audit.test.ts`

Coverage added:

- unreferenced candidates are explicitly not safe-to-delete;
- future ownership metadata requirements are stable;
- future deletion ledger statuses are stable;
- future recycle-window policy remains not implemented;
- hard refusal reasons are stable;
- docs say orphan audit is not ownership proof;
- docs say no quarantine, restore, or physical deletion workflow is implemented;
- orphan audit output must not contain safe-deletion wording when candidates exist.

## 17. Default And Local Read-Only Orphan Audit Validation Result

Default command:

```text
node scripts/audit-admin-media-orphans.mjs
```

Result: passed; default remained no-DB, no-delete, no-filenames, aggregate only.

Local read-only command:

```text
node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local
```

Result: passed; local guardrails allowed read-only DB counting, output stayed aggregate-only, no files were deleted, and no filenames or matched records were printed.

## 18. Confirmation No Deletion, Schema, Migration, Runtime, Or Provider Behavior Was Added

Confirmed:

- no deletion mode was added;
- no real files were deleted;
- no database mutation was added;
- no Prisma schema or migration file was edited;
- no runtime cleanup helper was changed;
- no admin route or API behavior was changed;
- no object storage or provider cleanup was added;
- no public asset, upload, image, footer, newsletter, payment-logo, category image, product image, PromoSection, or visual file was touched.

## 19. Validation Results

Validation commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Passed; only expected Step 279 docs/helper/test/report files were dirty before staging. |
| `git log -3 --oneline` | Passed; latest starting commit was `fc6da93`. |
| `git diff --cached --name-only` | Passed; empty before staging. |
| `git diff --check -- <exact changed files>` | Passed; whitespace check clean, with only normal CRLF normalization warnings. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop reported ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed; Advisor reported ready. |
| `npm run db:url:safety` | Passed; app and shadow DB URLs classified local and separate. |
| `npm run db:prisma:local:validate` | Passed; Prisma schema validation succeeded. |
| `npm run db:prisma:local:generate` | Passed; Prisma Client generated. |
| `npx tsx --test tests/admin-media-storage-policy.test.ts` | Passed; 8/8 tests. |
| `npx tsx --test tests/admin-media-orphan-audit.test.ts` | Passed; 6/6 tests. |
| `npx tsx --test tests/admin-media-lifecycle.test.ts` | Passed as part of the related admin media safety test run. |
| `npx tsx --test tests/admin-media-reference-guard.test.ts` | Passed as part of the related admin media safety test run. |
| `npx tsx --test tests/admin-media-reference-adapter.test.ts` | Passed as part of the related admin media safety test run. |
| `npx tsx --test tests/admin-media-runtime-cleanup.test.ts` | Passed as part of the related admin media safety test run. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; default mode remained no-DB, no-delete, no-filenames, aggregate-only. |
| `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` | Passed; local read-only mode stayed aggregate-only and reported `referencedActive = 6`, `unreferencedManagedCandidate = 5`. |
| `node scripts/audit-ai-marketing-copy.mjs` | Passed; existing 51 content findings remained audit findings only. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; only the expected Next.js lint deprecation notice appeared. |
| `npm test` | Passed; 441/441 tests. |
| `npm run build` | Passed; production build completed. |

## 20. Exact Files Changed Or Staged

Expected Step 279 files:

- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/admin/media-lifecycle.ts`
- `tests/admin-media-storage-policy.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
- `audit-reports/279-media-deletion-ledger-recycle-window-policy/media-deletion-ledger-policy-evidence.json`
- `audit-reports/280_NEXT_PROMPT_DRAFT.md`

No route, runtime cleanup helper, Prisma schema, migration, public asset, upload file, visual, payment, tracking, seller, CSP, rate-limit, or mobile files are expected in the staged set.

## 21. Remaining Risks

- The policy is not persistence.
- No media ownership table exists.
- No deletion ledger table exists.
- No recycle/restore workflow exists.
- No provider cleanup policy exists.
- Runtime cleanup helpers still do not use a ledger/recycle gate.
- Product variant cleanup remains deferred.
- Current local candidates remain audit findings only.

## 22. Recommended Next Step

Step 280 should design provider-ready media metadata schema and migration planning without creating migrations. It should map future `MediaAsset` and deletion-ledger models, backfill strategy, constraints/indexes, rollback strategy, and DB-backed test requirements, while still avoiding runtime deletion and physical cleanup.
