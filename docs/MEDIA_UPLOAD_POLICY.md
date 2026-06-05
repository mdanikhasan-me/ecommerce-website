# Boilabin Media Upload Policy

## Purpose

Boilabin should accept product, banner, category, and future vendor images without letting huge uploads damage page speed, storage cost, backups, or image optimization CPU.

This policy describes the current pre-launch behavior and the future production direction. It does not claim CDN, object storage, or multi-size variant storage is already implemented.

## Why Huge Images Are Dangerous

Large images multiply quickly in ecommerce:

```text
50 vendors x 50 products x 20 variants x 5 images = 250,000 images
```

At 5 MB each, that is about 1,220 GiB before backups, cache files, generated variants, CDN copies, or old orphaned files. This can become expensive and slow.

## Lossless Vs Visually Lossless

True lossless compression from 5 MB to 50 KB is usually unrealistic.

The practical target is visually lossless optimization:

- resize oversized originals;
- convert to WebP or another efficient web format;
- generate smaller display sizes;
- strip unnecessary metadata;
- avoid serving originals to buyers unless needed.

## Current Implemented Limits

Current helper-level limits live in `src/backend/admin/image-processing.ts`:

- maximum encoded upload: 8 MB;
- maximum decoded pixels: 24,000,000;
- maximum width or height: 8,000 pixels;
- allowed formats: JPEG, PNG, WebP, GIF;
- preferred output: WebP;
- fallback output: JPEG, PNG, WebP, or GIF based on input type;
- current storage: local `public/uploads`.

## Product Image Policy

Current product upload profile:

- max output size: 2,200 x 2,200;
- preferred output: WebP;
- product form image count cap exists at 20 images.

Future product policy:

- thumbnail variant for admin/list previews;
- card variant for grids/search/category pages;
- detail variant for product gallery;
- zoom variant only where useful;
- original retention only if explicitly approved.

## Banner Image Policy

Current banner upload profile:

- max output size: 2,800 x 1,800;
- preferred output: WebP.

Future banner policy:

- desktop hero size;
- mobile hero size;
- separate crop guidance;
- no unbounded animated or oversized hero uploads.

## Category Image Policy

Current category upload profile:

- max output size: 1,800 x 1,800;
- preferred output: WebP.

Future category policy:

- one canonical category image per active category;
- square/card-friendly crop;
- avoid stale remote images and broken legacy paths.

## Brand Image Policy

Current brand upload profile:

- max output size: 2,200 x 1,600;
- preferred output: WebP.

Future brand policy:

- logo-safe transparent or white-background handling;
- small preview variant;
- no high-megabyte brand logo uploads.

## Future Vendor Upload Policy

Before seller marketplace uploads are enabled, define:

- max images per product;
- max images per variant;
- max active storage per vendor;
- monthly upload volume limit;
- moderation flow;
- cleanup policy for rejected/deleted products;
- abuse controls.

## Output Format Policy

Current:

- WebP preferred.
- JPEG/PNG/GIF fallback exists only if WebP persistence fails.
- AVIF is supported by Next/Image output, but upload persistence does not create AVIF files yet.

Future:

- measure AVIF CPU/cost before generating AVIF for all uploads;
- keep WebP as the practical default until AVIF cost is proven acceptable.

## Variant Intent Policy

The code now names future variant intents:

- `thumbnail`;
- `card`;
- `detail`;
- `zoom`.

Current status: names are policy metadata only. The app still writes one optimized file per upload.

## Original Retention Recommendation

Do not keep raw originals in the public web root by default.

If original retention becomes necessary, store originals outside public serving paths and protect them with lifecycle rules.

## CDN/Object Storage Boundary

Local `public/uploads` is acceptable for local/pre-launch testing. It is not final production multi-vendor storage.

Future production should use object storage and CDN-backed delivery after provider decisions are approved.

## Managed Uploads Vs Source Assets

Source-controlled assets under `/assets/*` and `/images/*` are committed application assets. Admin cleanup must never delete them, even when a database row points at one of those paths.

Source-controlled catalog/demo product media now lives under:

- `/assets/products/catalog/*` for committed seed/demo product images.

These files are changed by developers through source control, not by admin delete/replace actions. They are appropriate for pre-launch demo catalog rows, static fixtures, and source-controlled product examples. They must not be treated as runtime uploads or deletion candidates.

Managed local uploads currently live under:

- `/uploads/admin/*` for banner, category, and other admin-managed artwork;
- `/uploads/products/*` for product gallery uploads.

Those prefixes are only local/pre-launch ownership hints. They are not enough for long-term production deletion by themselves because the repository can contain demo or recovery files under upload-like paths. Production deletion should require an owned storage key or media metadata record, not only a public URL prefix.

Current product uploads intentionally do not write to `public/assets/products`. The `public/assets` tree is deployment-owned and source-controlled. Admin/runtime uploads are user- or admin-created files and currently belong in `public/uploads/products` so they stay separate from committed catalog/demo product media, UI assets, branding, category art, and payment logos.

Current banner and category uploads use the admin upload helper and write under `public/uploads/admin/<purpose>`. The stored public values are `/uploads/admin/banners/...` for banner images and `/uploads/admin/categories/...` for category images. Existing source category or hero assets that point to `/assets/...` remain protected source assets, even when a database row references them.

When an admin replaces or deletes a managed upload, the runtime cleanup helper may physically remove the old file only after the path is inside the matching managed root and the shared reference check reports no active or historical references. If the path is remote, a data URL, under `/assets` or `/images`, outside the managed root, decorated with query/fragment data, still referenced, historically referenced, or the reference check is incomplete, the helper preserves the file and returns a non-throwing failure result.

This means current local filesystem cleanup is a best-effort pre-launch convenience, not a production media lifecycle. Hostinger local disk can be used temporarily only if the owner accepts backup, deploy persistence, and restore limitations. The safer production direction is object storage plus CDN after provider, backup, restore, retention, and deletion-ledger policy are approved.

## Storage Key Direction

Category/subcategory folders can help humans browse storage, but folder names do not make images faster. Image performance comes from compression, resizing, cache/CDN behavior, responsive image delivery, and avoiding unused downloads.

Do not make mutable category or subcategory names the durable storage identity for product media. Products can move categories, category names can be edited, and slugs can be repaired. Moving files when categories change creates broken URL and rollback risk.

Future production storage should prefer stable owner/media keys such as:

```text
products/<product-id>/media/<media-id>/<variant>.webp
admin/<purpose-or-record-id>/media/<media-id>/<variant>.webp
```

Category, subcategory, brand, placement, and alt-text data should be metadata, not the primary storage path. If category/subcategory foldering is ever approved for organization, it must use immutable slug snapshots, path traversal protections, and migration rules for category changes.

## Deletion And Retention Direction

Physical media deletion should stay conservative:

- delete only files known to be owned managed uploads;
- skip deletion when reference checks fail or are incomplete;
- preserve files referenced by order, review, return, user, or other historical evidence records;
- record future deletions in a ledger before provider-backed deletion is enabled;
- use a recycle/restore window for production storage;
- keep backups and object-storage lifecycle rules separate from customer-facing URLs.

Product variant image cleanup is not enabled yet. The current reference guard can detect `ProductVariant.image` references, but admin product forms do not currently upload variant-specific images, and runtime product cleanup candidates are still based on `ProductImage.url`.

## Ownership Metadata Required Before Deletion

An orphan audit result is not ownership proof. Before Boilabin can permanently delete a file, the media record or future storage metadata must prove at least:

- a stable `mediaId`;
- a stable `storageKey`;
- the public URL or a sanitized public URL fingerprint;
- `ownerType`, `ownerId`, and `ownerField`;
- the media `purpose`;
- the `sourceSystem` that created it;
- the `uploadedByUserId`, when applicable;
- creation and replacement timestamps;
- the last reference-audit timestamp;
- checksum, byte size, MIME type, width, and height;
- storage provider, bucket, and region;
- whether the file is a source asset;
- whether the file is a managed upload;
- whether the file is historical evidence;
- the current media status.

Physical deletion must be refused when ownership metadata is missing or ambiguous. Current local upload prefixes are useful audit hints, not enough proof for production cleanup.

## Deletion Ledger Policy

A future deletion ledger must exist before any provider-backed or filesystem-backed delete job is enabled. The ledger should record:

- `ledgerId`;
- `mediaId`;
- `storageKey`;
- public URL hash or sanitized URL fingerprint;
- detector name and detection run id;
- reference-audit snapshot;
- active reference count;
- historical evidence reference count;
- ownership status;
- candidate reason;
- refusal reason;
- requested, approved, deleted, and restored actors;
- requested, quarantined, eligible, deleted, and restored timestamps;
- provider delete result;
- sanitized error code only.

Recommended ledger statuses:

- `observed`;
- `candidate`;
- `refused`;
- `quarantined`;
- `pending_approval`;
- `approved`;
- `deleted`;
- `delete_failed`;
- `restored`;
- `expired`;
- `cancelled`.

The ledger must not store raw tokens, private paths, full DB URLs, customer/order PII, raw provider errors, or matched record payloads.

## Recycle And Restore Window

Permanent deletion should require a recycle window. The minimum future hold period should be at least 30 days unless a stricter production policy is approved.

During the recycle window:

- the file is marked in the ledger and either quarantined by storage key or retained in place with deletion blocked;
- manual approval is required before permanent delete;
- restore must be possible before the window expires;
- backup/restore coverage must be confirmed;
- provider lifecycle rules must not erase files before the ledger window;
- CDN/cache invalidation must be planned separately from deletion;
- if the file becomes referenced again, deletion is cancelled or the file is restored;
- if a later reference audit finds active or historical references, deletion is refused;
- if provider deletion fails, the ledger moves to `delete_failed` and preserves the evidence.

Current status: recycle-window behavior is policy only. No quarantine, restore, or physical deletion workflow is implemented.

## Hard Refusal Rules

Future deletion must refuse when any of these are true:

- the path is under `/assets/*` or `/images/*`;
- the path is remote or provider-hosted without an owned storage key;
- the path is outside known managed roots;
- ownership metadata is missing;
- the reference check is incomplete;
- any active reference exists;
- any historical evidence reference exists;
- the file belongs to order, review, return, user, support, or other historical evidence;
- the file is linked to an archived product/category without an approved retention decision;
- the file is a tracked repository or demo upload-like file without ownership proof;
- the DB/file audit result is stale;
- provider delete policy is not configured;
- backup/restore policy is missing;
- deletion ledger is missing;
- the recycle window is not satisfied.

## Product Variant Media Policy

`ProductVariant.image` currently blocks deletion as a reference. It is not yet a cleanup candidate.

Future variant media should become separate managed media records only after ownership metadata exists. A variant image may also be a shared product gallery image, so cleanup must avoid deleting a gallery image while a variant still references it. Variant cleanup should wait for media ownership metadata, ledger support, and dedicated route/UI tests.

## Provider And Object Storage Requirements

Future production storage cleanup requires:

- stable storage keys that do not depend on mutable category folders;
- object storage and CDN design;
- provider delete API behavior and error mapping;
- bucket lifecycle policy;
- backup and restore policy;
- deletion ledger;
- recycle window;
- audit job with count-only reference checks;
- no use of public URL inference as ownership proof.

## Future MediaAsset Schema Plan

Boilabin should eventually add a provider-ready media metadata model in a separate approved migration. A future `MediaAsset` record should describe ownership and storage; it must not replace existing public URL fields until compatibility tests prove old routes and mobile/API clients still work.

Recommended future fields:

- `id`;
- `mediaId`;
- `storageKey`;
- `publicUrl`;
- `publicUrlHash`;
- `ownerType`;
- `ownerId`;
- `ownerField`;
- `purpose`;
- `sourceSystem`;
- `uploadedByUserId`;
- `createdAt`;
- `updatedAt`;
- `replacedAt`;
- `lastReferenceAuditAt`;
- `checksum`;
- `byteSize`;
- `mimeType`;
- `width`;
- `height`;
- `storageProvider`;
- `storageBucket`;
- `storageRegion`;
- `storageNamespace`;
- `isSourceAsset`;
- `isManagedUpload`;
- `isHistoricalEvidence`;
- `status`;
- `metadata`.

Required before any physical cleanup can be trusted:

- stable `mediaId` and `storageKey`;
- explicit owner fields: `ownerType`, `ownerId`, `ownerField`, and `purpose`;
- clear `sourceSystem`, such as admin upload, product editor, seller upload, source asset, seed, remote import, or legacy URL;
- storage provider and namespace metadata;
- source/managed/historical flags;
- checksum, byte size, MIME type, dimensions, and audit timestamps.

The initial migration should treat existing rows conservatively. Existing URLs should stay authoritative during the transition, and backfilled media metadata should begin as `ownership_unverified` unless the upload origin is proven.

Recommended future media statuses:

- `ownership_unverified`;
- `active`;
- `source_asset_protected`;
- `historical_preserve_only`;
- `replaced`;
- `recycle_pending`;
- `deletion_candidate`;
- `deletion_refused`;
- `delete_approved`;
- `deleted`;
- `delete_failed`;
- `restored`.

## Future MediaDeletionLedger Schema Plan

A future `MediaDeletionLedger` model should record every candidate, refusal, approval, quarantine, restore, provider delete result, and failure. The ledger should be durable audit history, not a transient log.

Recommended future fields:

- `id`;
- `ledgerId`;
- `mediaAssetId`;
- `storageKey`;
- `publicUrlHash`;
- `detectedBy`;
- `detectionRunId`;
- `referenceAuditSnapshot`;
- `activeReferenceCount`;
- `historicalEvidenceReferenceCount`;
- `ownershipStatus`;
- `candidateReason`;
- `refusalReason`;
- `status`;
- `requestedBy`;
- `approvedBy`;
- `deletedBy`;
- `restoredBy`;
- `requestedAt`;
- `quarantinedAt`;
- `eligibleForDeletionAt`;
- `deletedAt`;
- `restoredAt`;
- `providerDeleteResult`;
- `sanitizedErrorCode`;
- `createdAt`;
- `updatedAt`.

Recommended transition shape:

- `observed` after an audit sees a media value;
- `candidate` only after ownership metadata exists and a count-only reference audit has no active or historical references;
- `refused` when any hard blocker exists;
- `quarantined` only when restore is available;
- `pending_approval` and `approved` only after manual review;
- `deleted` only after provider or filesystem deletion succeeds;
- `delete_failed` when cleanup fails;
- `restored`, `expired`, or `cancelled` when the recycle-window workflow resolves without permanent deletion.

## Existing Media Field Migration Map

Future migration and backfill should classify existing media URL fields as follows:

| Field | Current reference class | Future treatment |
| --- | --- | --- |
| `User.image` | historical evidence | reference-only preserve; never cleanup candidate from URL alone |
| `Seller.storeLogo` | active reference | owner candidate only after seller media policy and provider choice |
| `Seller.storeBanner` | active reference | owner candidate only after seller media policy and provider choice |
| `Category.image` | active reference | admin-owned candidate or source-protected, depending on URL class |
| `Brand.logo` | active reference | admin-owned candidate or source-protected, depending on URL class |
| `Brand.banner` | active reference | admin-owned candidate or source-protected, depending on URL class |
| `ProductImage.url` | active reference | primary product owner candidate, still blocked from deletion until ledger/recycle gates exist |
| `ProductVariant.image` | active reference | reference-only until variant ownership is separately designed |
| `OrderItem.imageUrl` | historical evidence | preserve-only order evidence |
| `ReturnRequest.images` | historical evidence | preserve-only return/support evidence |
| `Review.images` | historical evidence | preserve-only customer/moderation evidence |
| `Banner.imageUrl` | active reference | admin-owned candidate or source-protected, depending on URL class |
| `Banner.mobileImageUrl` | active reference | admin-owned candidate or source-protected; may share desktop media |

Backfill must not infer ownership from public URL shape alone. Source assets remain protected, remote URLs remain reference-only unless owned provider keys exist, and managed upload-like values remain ownership-unverified until provenance is proven.

## Product Variant Ownership Plan

`ProductVariant.image` should stay a reference guard field, not a cleanup source. Future variant media may become owned `MediaAsset` records only when uploaded through an approved product editor or seller flow.

Variant-specific cleanup is deferred because:

- a variant can reuse a product gallery image;
- a variant can have a dedicated image;
- existing rows do not prove which case applies;
- deleting a shared gallery image could break product detail, cart, order, or future mobile views.

Before variant cleanup is considered, tests must prove gallery reuse, dedicated variant uploads, order snapshots, product editor updates, and rollback behavior.

## Backfill And Migration Phases

Future phases should be additive and reversible:

1. Phase 0, current URL fields and audits: keep existing fields, default orphan audit, and guarded local read-only aggregate audit. No schema or cleanup change.
2. Phase 1, schema models only: add `MediaAsset` and `MediaDeletionLedger` in a separately approved migration. No backfill or route changes in the same step.
3. Phase 2, ownership-unverified backfill: create metadata rows for known managed-root values as unverified. Existing URL fields remain authoritative.
4. Phase 3, source and historical protection: classify source assets as protected and historical references as preserve-only.
5. Phase 4, new upload media writes: newly approved upload flows create `MediaAsset` rows while existing URL fields stay compatible.
6. Phase 5, cleanup ledger and recycle gates: cleanup planning requires ledger rows, approval, recycle window, fresh reference audit, and restore support.
7. Phase 6, provider storage keys: add provider keys and namespaces after provider, CDN, backup, and restore choices are approved.
8. Phase 7, approved deletion job: enable permanent cleanup only after owner approval and production smoke tests.

Every phase must define allowed operations, forbidden operations, tests, rollback, and stop conditions. No phase may physically remove media during schema migration or backfill.

## Constraints And Indexes To Consider Later

Future schema work should consider:

- unique `mediaId`;
- unique `storageKey` where ownership is proven;
- index on `publicUrlHash`;
- index on `ownerType`, `ownerId`, and `ownerField`;
- index on `status`;
- index on `lastReferenceAuditAt`;
- index on `eligibleForDeletionAt`;
- index on `storageProvider`, `storageBucket`, and `storageNamespace`;
- constraint or code guard preventing source assets from entering delete states;
- constraint or code guard keeping historical evidence preserve-only;
- ledger integrity checks requiring either a media asset or a refusal reason.

## Rollback And Test Requirements

Future migration rollback should require:

- local DB backup before schema changes;
- schema migration before backfill;
- existing URL fields as the serving source of truth during migration;
- backfill batch IDs so generated metadata rows can be removed without touching media files;
- no physical deletion during migration or backfill;
- storefront, admin, image rendering, and API response smoke tests before and after backfill;
- rollback path for new `MediaAsset` writes;
- provider object restore before public URLs are repointed.

DB-backed tests required before implementation:

- migration applies cleanly on local DB;
- migration rollback works;
- backfill does not change public URLs;
- source assets are protected;
- historical evidence is preserve-only;
- unreferenced candidates remain audit findings until ledger/recycle approval exists;
- provider keys are not inferred from public URLs alone;
- route response behavior remains unchanged;
- orphan audit works with metadata;
- cleanup helpers refuse physical deletion without ledger approval.

## Manual Approval Required Before Implementation

The owner must approve:

- storage provider choice;
- whether Hostinger local disk is temporary storage or whether object storage starts first;
- retention period and recycle-window days;
- backup and restore owner;
- product variant media ownership policy;
- seller/vendor upload policy;
- whether existing local uploads are real owner-uploaded data, demo data, or recovery artifacts;
- how current unreferenced managed candidates should be backfilled, if at all.

## Migration-Safe Implementation Checklist

Future media metadata implementation must move through approval and verification gates. This checklist is not an implementation and does not authorize schema changes by itself.

| Step | Allowed action | Forbidden action | Required tests | Rollback or stop condition |
| --- | --- | --- | --- | --- |
| Pre-migration approvals | Record owner decisions for schema, provider, retention, backup, seller media, and variant policy | Creating migrations before approval | Documentation review and no schema diff check | Stop if any approval is missing |
| Local DB prerequisites | Verify local app/shadow database URL shape, separation, and PostgreSQL reachability | Remote-looking DB use or connection string output | DB URL safety, Prisma validate, Prisma generate | Stop if local guardrails fail |
| Schema design review | Review pseudo-schema, indexes, constraints, nullability, and compatibility | Editing Prisma schema in a review-only step | Schema-plan contract tests and route contract inventory | Stop if API compatibility is unclear |
| Migration creation | Create schema-only migration in a later approved step | Combining schema with backfill, cleanup, provider work, or route behavior changes | Migration applies and rolls back locally | Roll back schema before any backfill |
| Backfill dry-run | Produce aggregate-only classification counts | Writing rows or outputting private identifiers | Dry-run aggregate output and field-map completeness | Stop if private identifiers would be required |
| Ownership-unverified backfill | Create metadata rows as `ownership_unverified` after approval | Marking backfilled rows cleanup-approved or changing public URLs | Idempotency, unchanged public URLs, unchanged route contracts | Remove metadata rows by batch id only |
| New upload metadata writes | Dual-write new approved uploads to metadata while URL fields remain authoritative | Removing URL fields or changing API response shapes | Upload dual-write, mobile/API contracts, rollback | Disable metadata writes and keep URL serving |
| Ledger and recycle integration | Require ledger, approval, recycle window, backup, restore, and fresh reference audit | Physical deletion without all gates | Ledger-required, stale-audit refusal, recycle-window tests | Disable cleanup job and retain ledger evidence |
| Provider storage integration | Persist provider keys after provider, backup, restore, and CDN decisions | Inferring provider keys from public URLs or running provider delete | Provider key mapping and rollback tests | Continue serving existing public URLs |
| Deletion job approval | Enable a deletion job only in a later explicitly approved implementation | Automatic cleanup of source, historical, ownership-unverified, or stale-audit media | Manual approval, failure ledgering, restore-before-delete tests | Stop the job and restore from recycle/provider backup |

Owner approval is required for every step except local DB prerequisite checks and aggregate-only dry-run design.

## Local DB Prerequisites For Future Migration Work

Before any future migration or DB-backed media test, confirm:

- `DATABASE_URL` classifies local;
- `SHADOW_DATABASE_URL` classifies local;
- app and shadow databases are separate;
- local PostgreSQL is reachable;
- Prisma validate passes;
- Prisma generate passes;
- there is no pending schema or migration diff;
- a recent local backup or snapshot is approved.

URL-shape readiness does not prove PostgreSQL is running, and local DB readiness does not authorize remote, staging, or production database changes.

## Future Migration Phase Gates

The future migration path should be split into strict gates:

- Phase A: schema-only migration. Add metadata models only after owner approval; do not remove existing URL fields.
- Phase B: no-op read compatibility tests. Prove current routes, admin pages, storefront pages, and API/mobile-facing payloads still read existing URL fields.
- Phase C: backfill dry-run aggregate report. Classify existing mapped media fields without writing rows.
- Phase D: ownership-unverified backfill. Write metadata rows only as unverified and batch-tagged.
- Phase E: source and historical protection marking. Mark source assets and historical evidence preserve-only.
- Phase F: new upload metadata write path. Dual-write future uploads while existing URL fields remain authoritative.
- Phase G: ledger and recycle gate integration. Require ledger, approval, recycle window, restore, and fresh reference audit before cleanup decisions.
- Phase H: provider storage integration. Add provider keys only after provider, backup, restore, and CDN choices are approved.
- Phase I: deletion job after explicit approval. Enable a cleanup job only after all gates, tests, and owner approvals pass.

No phase may physically remove media during schema migration or backfill.

## Future Backfill Dry-Run Design

A future dry-run backfill command should be read-only by default.

It should classify:

- all current media URL fields;
- source assets;
- managed upload roots;
- remote media;
- historical evidence;
- active references;
- ownership-unverified values;
- product variant media as deferred;
- seller and brand fields as policy-blocked until those ownership rules are approved.

Default output must be aggregate-only. It must avoid filenames, full paths, full URLs, record IDs, matched records, customer/order PII, private env values, and uploaded private file contents.

The command must create no `MediaAsset` rows until a later approved backfill step. It must stop if DB safety fails, reference checks are incomplete, or output would require private identifiers.

## Rollback Gates For Future Media Metadata Work

Rollback planning must include:

- schema-only migration rollback before backfill;
- backfilled metadata rows removable by batch id;
- new upload metadata writes can be disabled without changing URL serving;
- ledger rows retained as audit evidence;
- provider storage keys reversible before URL repointing;
- recycle/quarantine state restorable before any permanent action;
- deletion job disabled before any permanent action;
- no physical deletion during schema migration or backfill.

No physical deletion is allowed during schema migration or backfill.

## Future DB-Backed Test Matrix

Before creating or applying a real media metadata migration, future DB-backed tests should prove:

- migration applies locally;
- migration rolls back locally;
- route responses do not change;
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

## Alt Text Requirement

Product images should have meaningful alt text. Category and banner images should have text alternatives based on visible content, not generic "image" labels.

## Implemented Now Vs Future

Implemented now:

- helper-level byte, pixel, dimension, MIME, and format validation;
- Sharp processing;
- WebP-preferred persistence;
- explicit profile/limit/storage/variant intent metadata;
- no-DB tests and audit script checks.

Future work:

- derived file variants;
- object storage/CDN;
- vendor quotas;
- original retention policy;
- storage lifecycle cleanup;
- moderation and abuse workflows.
