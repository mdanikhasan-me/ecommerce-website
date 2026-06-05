# Step 280 - Provider-Ready Media Metadata Schema And Migration Planning

## 1. Scope And Starting State

Step 280 designed the future provider-ready media metadata schema and migration/backfill plan for Boilabin media ownership, deletion ledger, recycle-window gating, and provider storage readiness.

Starting commit:

```text
8ab6822 docs: design media deletion ledger policy
```

This step was planning, docs, pure policy constants, no-DB tests, and audit evidence only.

This step did not:

- edit `prisma/schema.prisma`;
- create migrations;
- run migrations;
- mutate the database;
- add deletion behavior;
- change runtime cleanup helpers;
- add provider cleanup;
- delete real files;
- touch public assets or uploads.

## 2. Latest Commit Verification

Starting `git log -3 --oneline`:

```text
8ab6822 docs: design media deletion ledger policy
fc6da93 chore: add local db-aware media orphan audit mode
c3a3f57 test: add db-aware media orphan audit planning
```

## 3. Files Inspected

Primary files and reports inspected:

- `audit-reports/279_MEDIA_DELETION_LEDGER_RECYCLE_WINDOW_POLICY.md`
- `audit-reports/279-media-deletion-ledger-recycle-window-policy/media-deletion-ledger-policy-evidence.json`
- `audit-reports/278_LOCAL_DB_AWARE_ORPHAN_MEDIA_AUDIT_EXECUTION.md`
- `audit-reports/278-local-db-aware-orphan-media-audit-execution/local-db-aware-orphan-audit-evidence.json`
- `audit-reports/277_DB_AWARE_ORPHAN_MEDIA_AUDIT_MODE.md`
- `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
- `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
- `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
- `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
- `audit-reports/280_NEXT_PROMPT_DRAFT.md`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `prisma/schema.prisma`
- related admin media tests

Read-only agent lanes also reviewed the media ownership, risk, planning, QA, and report requirements before implementation.

## 4. Current Media Safety Baseline

Current safe audit behavior:

- default orphan audit is no-DB;
- default orphan audit is no-delete;
- default orphan audit is no-filenames and aggregate-only;
- local read-only audit requires the explicit `--db-aware-readonly-local` flag;
- local read-only audit is guarded by local/separate database URL checks;
- local read-only audit uses count-only reference checks;
- local read-only audit emits aggregate counters only.

Step 278 aggregate local read-only result:

```text
referencedActive = 6
referencedHistoricalEvidence = 0
unreferencedManagedCandidate = 5
unverifiedReferenceCheckFailed = 0
```

Important interpretation:

- `unreferencedManagedCandidate` is an audit classification only.
- It is not deletion approval.
- It does not prove ownership, backup, restore, ledger, recycle-window, provider, or approval readiness.

## 5. Proposed Future `MediaAsset` Model Fields

A future `MediaAsset` model should be additive and provider-ready. It should describe durable ownership, public URL compatibility, object storage identity, audit status, and preservation flags.

Proposed fields:

- `id`
- `mediaId`
- `storageKey`
- `publicUrl`
- `publicUrlHash`
- `ownerType`
- `ownerId`
- `ownerField`
- `purpose`
- `sourceSystem`
- `uploadedByUserId`
- `createdAt`
- `updatedAt`
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
- `storageNamespace`
- `isSourceAsset`
- `isManagedUpload`
- `isHistoricalEvidence`
- `status`
- `metadata`

Fields required before physical deletion can be trusted:

- stable identity: `mediaId`, `storageKey`;
- URL compatibility: `publicUrl`, `publicUrlHash`;
- ownership boundary: `ownerType`, `ownerId`, `ownerField`, `purpose`;
- provenance: `sourceSystem`, `uploadedByUserId`, timestamps;
- storage boundary: provider, bucket, region, namespace;
- safety flags: source asset, managed upload, historical evidence;
- integrity: checksum, byte size, MIME type, dimensions;
- audit state: status and last reference audit timestamp.

Planned owner types:

- `user`
- `seller`
- `category`
- `brand`
- `product`
- `product_variant`
- `banner`
- `system`
- `unknown`

Planned source systems:

- `admin_upload`
- `product_editor`
- `seller_upload`
- `seed`
- `source_asset`
- `remote_import`
- `legacy_url`
- `unknown`

## 6. Proposed Future `MediaDeletionLedger` Model Fields

A future `MediaDeletionLedger` model should be durable audit history. It should record candidates, refusals, approvals, quarantine, restore, provider results, and failures without storing raw provider errors, matched records, secrets, or PII.

Proposed fields:

- `id`
- `ledgerId`
- `mediaAssetId`
- `storageKey`
- `publicUrlHash`
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
- `createdAt`
- `updatedAt`

Ledger data must be sanitized:

- use hashes or bounded fingerprints for public URLs;
- store aggregate reference counts, not matched records;
- store sanitized error codes, not raw provider or database errors;
- never store secrets, full DB URLs, private paths, tokens, customer/order PII, or raw request data.

## 7. Proposed Statuses And Transitions

Proposed future `MediaAsset` statuses:

- `ownership_unverified`
- `active`
- `source_asset_protected`
- `historical_preserve_only`
- `replaced`
- `recycle_pending`
- `deletion_candidate`
- `deletion_refused`
- `delete_approved`
- `deleted`
- `delete_failed`
- `restored`

Existing Step 279 deletion-ledger statuses remain:

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

Recommended transition shape:

- `observed` after an audit sees a media value.
- `ownership_unverified` for legacy/backfilled values without proven ownership.
- `source_asset_protected` for committed source assets.
- `historical_preserve_only` for order, return, review, user, and other evidence.
- `candidate` only after ownership metadata exists and fresh count-only reference audit has no active or historical references.
- `refused` when any hard blocker exists.
- `quarantined` only when restore is possible.
- `pending_approval` and `approved` only after manual review.
- `deleted` only after provider or filesystem deletion succeeds in a future approved step.
- `delete_failed` when cleanup fails.
- `restored`, `expired`, or `cancelled` when the recycle workflow resolves without permanent deletion.

## 8. Existing Media Field Mapping

Current scattered media fields in `prisma/schema.prisma` and reference guard mapping:

| Field | Current class | Future treatment | Backfill ownership | Deletion candidate later |
| --- | --- | --- | --- | --- |
| `User.image` | historical evidence | reference-only preserve | no | no |
| `Seller.storeLogo` | active reference | owner candidate after seller media policy | yes, unverified first | not until seller/provider policy |
| `Seller.storeBanner` | active reference | owner candidate after seller media policy | yes, unverified first | not until seller/provider policy |
| `Category.image` | active reference | admin-owned candidate or source-protected | yes, unverified first | only after metadata, ledger, recycle |
| `Brand.logo` | active reference | admin-owned candidate or source-protected | yes, unverified first | only after brand policy |
| `Brand.banner` | active reference | admin-owned candidate or source-protected | yes, unverified first | only after brand policy |
| `ProductImage.url` | active reference | primary product owner candidate | yes, unverified first | only after metadata, ledger, recycle |
| `ProductVariant.image` | active reference | reference-only until variant ownership design | no | no |
| `OrderItem.imageUrl` | historical evidence | reference-only preserve | no | no |
| `ReturnRequest.images` | historical evidence | reference-only preserve | no | no |
| `Review.images` | historical evidence | reference-only preserve | no | no |
| `Banner.imageUrl` | active reference | admin-owned candidate or source-protected | yes, unverified first | only after metadata, ledger, recycle |
| `Banner.mobileImageUrl` | active reference | admin-owned candidate or source-protected | yes, unverified first | only after metadata, ledger, recycle |

Fields intentionally not treated as media ownership fields:

- `Category.icon` is an icon keyword/string, not a media file owner.
- `HomepageSection.config` is untyped JSON and must not be inferred as media ownership until a dedicated content-media plan exists.
- Navigation URLs such as `Banner.linkUrl`, `Brand.website`, and notification links are not media assets.

Backfill must classify each URL by source:

- source asset paths become `source_asset_protected`;
- historical fields become `historical_preserve_only`;
- managed upload-like values become `ownership_unverified` until provenance is proven;
- remote URLs remain reference-only unless an owned provider storage key exists;
- public URL shape never proves ownership.

## 9. Product Variant Media Ownership Plan

`ProductVariant.image` remains a reference guard field today. It is not a cleanup source.

Future policy:

- Variant images should become owned `MediaAsset` rows only when uploaded through a future approved admin/product editor or seller flow.
- Reused gallery images must not create duplicate ownership records.
- Variant-specific images must be distinguishable from reused product gallery images.
- Variant cleanup must wait for schema design, backfill tests, route/UI tests, ledger support, and historical evidence checks.
- Orders containing variant images must preserve evidence snapshots.

Required future tests before variant cleanup:

- variant image reused from gallery remains protected while either reference exists;
- variant-specific upload creates one owned media record;
- order item snapshot blocks cleanup;
- product update does not remove shared gallery media;
- rollback keeps old URL fields and mobile/API responses stable.

## 10. Backfill And Migration Phases

Phase 0: current URL fields and audits.

- Allowed: keep existing URL fields, default no-DB audit, and guarded local read-only aggregate audit.
- Forbidden: schema edits, migrations, DB mutation, provider deletion, physical cleanup expansion.
- Tests: current media policy, orphan audit, reference guard, typecheck, lint, full test suite.
- Rollback: no persisted media metadata exists.
- Stop conditions: any deletion or schema edit appears.

Phase 1: future schema models only.

- Allowed: add `MediaAsset` and `MediaDeletionLedger` in a separately approved migration.
- Forbidden: backfill, URL rewrite, deletion, runtime cleanup behavior change.
- Tests: migration applies and rolls back on local DB.
- Rollback: rollback schema before any backfill.
- Stop conditions: migration tries to alter existing URL behavior.

Phase 2: ownership-unverified backfill.

- Allowed: create metadata rows for known managed-root values as `ownership_unverified`.
- Forbidden: marking backfilled rows as deletion candidates.
- Tests: idempotent backfill, unchanged public URLs, no route response changes.
- Rollback: delete generated metadata rows by batch id only.
- Stop conditions: any physical media mutation.

Phase 3: source and historical protection.

- Allowed: mark source assets protected and historical references preserve-only.
- Forbidden: queuing historical evidence for deletion.
- Tests: order, return, review, user, source asset preservation.
- Rollback: revert metadata classification batch.
- Stop conditions: historical evidence becomes cleanup-eligible.

Phase 4: new upload media asset writes.

- Allowed: newly approved upload flows create media metadata while old URL fields remain compatible.
- Forbidden: removing URL compatibility or changing API response shapes.
- Tests: admin upload, product upload, mobile/API contract, rollback.
- Rollback: disable new writes and continue serving URL fields.
- Stop conditions: frontend or API callers require immediate migration.

Phase 5: cleanup ledger and recycle gates.

- Allowed: cleanup planning requires ledger, approval, recycle window, fresh reference audit, backup, and restore support.
- Forbidden: physical delete without all gates.
- Tests: refusal reasons, stale audit refusal, restore path, approval gates.
- Rollback: disable cleanup job and retain ledger rows.
- Stop conditions: cleanup bypasses ledger.

Phase 6: provider storage keys.

- Allowed: store provider keys and namespaces after provider, CDN, backup, and restore choices are approved.
- Forbidden: inferring provider keys from public URLs alone.
- Tests: provider key mapping, CDN invalidation plan, rollback.
- Rollback: serve existing public URLs until provider mapping is repaired.
- Stop conditions: provider policy is missing.

Phase 7: approved deletion job.

- Allowed: permanent cleanup after owner approval, backups, restore plan, fresh audit, and production smoke tests.
- Forbidden: automatic deletion of ownership-unverified, source, or historical media.
- Tests: delete failure, restore, re-reference cancellation, ledger integrity.
- Rollback: stop job, mark failures, restore from recycle/provider backup.
- Stop conditions: any unbounded or automatic cleanup behavior.

## 11. Constraints And Indexes Proposal

Future `MediaAsset` indexes and constraints:

- unique `mediaId`;
- unique `storageKey` where ownership is proven;
- index on `publicUrlHash`;
- index on `ownerType`, `ownerId`, `ownerField`;
- index on `status`;
- index on `lastReferenceAuditAt`;
- index on `storageProvider`, `storageBucket`, `storageNamespace`;
- code or DB constraint preventing source assets from delete states;
- code or DB constraint keeping historical evidence preserve-only.

Future `MediaDeletionLedger` indexes and constraints:

- index on `mediaAssetId` and `status`;
- index on `status` and `eligibleForDeletionAt`;
- index on `detectionRunId`;
- index on `publicUrlHash`;
- index on `storageKey`;
- index on `candidateReason`;
- index on `refusalReason`;
- index on requested, approved, deleted, and restored timestamps;
- integrity check requiring either a media asset reference or a refusal reason.

Constraint caution:

- avoid constraints that make rollback impossible before backfill quality is proven;
- avoid unique public URL assumptions because shared media and legacy rows may exist;
- avoid requiring provider fields for source assets or legacy remote references.

## 12. Rollback Strategy

Future migration rollback should include:

- local DB backup before schema changes;
- additive schema migration before backfill;
- existing URL fields remain the serving source of truth;
- generated metadata rows tagged by backfill batch;
- rollback removes metadata rows, not media files;
- no physical deletion during migration/backfill;
- storefront/admin/API image smoke tests before and after backfill;
- new metadata writes can be disabled independently from URL serving;
- provider objects restored before public URLs are repointed.

Provider migration rollback:

- keep old public URLs during provider rollout;
- store provider keys separately from public URLs;
- keep mapping reversible until smoke tests pass;
- never delete source or legacy objects during provider migration.

## 13. DB-Backed Tests Required Later

Before a future schema/migration implementation:

- migration applies cleanly on local DB;
- migration rollback works;
- backfill is idempotent;
- backfill does not change public URLs;
- existing route response shapes remain unchanged;
- source assets become protected;
- historical evidence becomes preserve-only;
- product gallery media is owner-candidate but not cleanup-approved;
- variant image reuse remains protected;
- provider keys are not inferred from public URLs alone;
- orphan audit works with metadata;
- cleanup helpers refuse physical deletion without ledger approval;
- stale reference audit refuses deletion;
- recycle-window timing is enforced;
- provider delete failures become sanitized ledger failures;
- mobile/API-compatible URL fields remain available until explicit migration approval.

## 14. Manual Approval And Blocker List

Owner approval required before implementation:

- storage provider choice;
- whether Hostinger local disk is temporary storage or object storage starts first;
- retention period and recycle-window days;
- backup and restore owner;
- product variant media ownership policy;
- seller/vendor upload policy;
- whether existing local uploads are owner-uploaded, demo data, or recovery artifacts;
- whether current unreferenced managed candidates should be backfilled as ownership-unverified;
- whether raw originals should be retained outside public paths;
- CDN/cache invalidation policy;
- operational approval workflow for deletion requests.

Current blockers:

- no `MediaAsset` model exists;
- no deletion ledger model exists;
- no recycle/restore workflow exists;
- no provider storage choice exists;
- no backup/restore approval exists;
- variant ownership is ambiguous;
- legacy upload-like files cannot prove ownership.

## 15. Confirmation No Schema, Migration, Runtime, Provider, Or Deletion Behavior Was Added

Confirmed:

- no Prisma schema file was edited;
- no migration file was created;
- no migration command was run;
- no DB mutation was performed;
- no runtime cleanup helper was changed;
- no admin/API route behavior was changed;
- no provider cleanup was added;
- no real files were deleted;
- no public asset, upload, image, footer, newsletter, payment-logo, category image, product image, PromoSection, visual, Flash Deals, payment, tracking, seller, CSP, rate-limit, SEO, or mobile implementation file was touched.

## 16. Default And Local Read-Only Orphan Audit Validation Result

Default command:

```text
node scripts/audit-admin-media-orphans.mjs
```

Result: passed; default mode stayed no-DB, no-delete, no-filenames, aggregate-only, and reported 11 managed-root files by aggregate count only.

Local read-only command:

```text
node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local
```

Result: passed; local read-only mode stayed guarded, count-only, and aggregate-only with `referencedActive = 6`, `referencedHistoricalEvidence = 0`, `unreferencedManagedCandidate = 5`, and `unverifiedReferenceCheckFailed = 0`.

## 17. Tests Added Or Updated

Updated:

- `tests/admin-media-storage-policy.test.ts`

Coverage added:

- future `MediaAsset` schema-plan fields;
- future owner type and source system vocabulary;
- future `MediaAsset` status vocabulary;
- future `MediaDeletionLedger` fields;
- conservative existing field migration map;
- product variant cleanup deferral;
- historical evidence preserve-only mapping;
- backfill phase order;
- index/constraint plan;
- rollback requirements.

## 18. Validation Results

Validation commands and results:

| Command | Result |
| --- | --- |
| `git status --short` | Passed before edits; worktree was clean. Post-edit status showed only expected Step 280 docs/helper/test/report/evidence files. |
| `git log -3 --oneline` | Passed; latest starting commit was `8ab6822`. |
| `git diff --cached --name-only` | Passed before staging; empty. |
| `git diff --check -- <exact changed files>` | Passed; only normal CRLF normalization warnings appeared. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop reported ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed; Advisor reported ready. |
| `npm run db:url:safety` | Passed; URLs classified local and separate, with no database connection attempted. |
| `npm run db:prisma:local:validate` | Passed; Prisma schema validation succeeded. |
| `npm run db:prisma:local:generate` | Passed on serial rerun. The first parallel attempt hit a transient Windows `EPERM` client-file rename lock and was rerun successfully. |
| `npx tsx --test tests/admin-media-storage-policy.test.ts` | Passed; 12/12 tests. |
| Targeted media safety tests | Passed; 56/56 across media lifecycle, orphan audit, reference guard, reference adapter, runtime cleanup, and storage policy tests. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; no-DB/no-delete/no-filenames/aggregate-only. |
| `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` | Passed; guarded local read-only DB count mode remained aggregate-only. |
| `node scripts/audit-ai-marketing-copy.mjs` | Passed as an audit command; existing 51 content findings remain backlog items. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; no ESLint warnings or errors, with the expected Next.js lint deprecation notice. |
| `npm test` | Passed; 445/445 tests. |
| `npm run build` | Passed; production build completed. |

## 19. Exact Files Changed Or Staged

Expected Step 280 files:

- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/admin/media-lifecycle.ts`
- `tests/admin-media-storage-policy.test.ts`
- `audit-reports/280_PROVIDER_READY_MEDIA_METADATA_SCHEMA_PLAN.md`
- `audit-reports/280-provider-ready-media-metadata-schema-plan/media-schema-plan-evidence.json`
- `audit-reports/281_NEXT_PROMPT_DRAFT.md`

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

## 21. Recommended Next Step

Step 281 should design the first migration-safe `MediaAsset` and deletion-ledger implementation plan without creating migrations yet. It should convert the Step 280 schema plan into a migration checklist, rollback checklist, local DB prerequisites, and DB-backed test plan, then stop for owner approval before any schema change.
