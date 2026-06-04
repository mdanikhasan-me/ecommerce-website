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
