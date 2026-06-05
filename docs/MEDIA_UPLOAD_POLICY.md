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

Managed local uploads currently live under:

- `/uploads/admin/*` for banner, category, and other admin-managed artwork;
- `/uploads/products/*` for product gallery uploads.

Those prefixes are only local/pre-launch ownership hints. They are not enough for long-term production deletion by themselves because the repository can contain demo or recovery files under upload-like paths. Production deletion should require an owned storage key or media metadata record, not only a public URL prefix.

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
