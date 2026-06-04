# Step 172 - Media Upload And Image Performance Audit

## Scope

This loop audited upload and image performance readiness without implementing compression or storage changes.

Created:

- `scripts/audit-media-upload-readiness.mjs`
- `tests/media-upload-readiness-policy.test.ts`

## Current Upload Strengths

`src/backend/admin/image-processing.ts` already has several strong foundations:

- Sharp is used.
- Upload byte cap exists at 8 MB.
- Decoded pixel cap exists at 24,000,000 pixels.
- Maximum dimension cap exists at 8,000 pixels.
- MIME type is checked against decoded image metadata.
- EXIF orientation is handled through `.rotate()`.
- Images are resized inside profile limits.
- Product/banner/brand/category profiles exist.
- WebP output is attempted first.
- Fallback image output exists.

## Current Risks

- Uploads are stored in local `public/uploads`, which is not a production object-storage strategy.
- The pipeline generates one optimized file, not multiple derived variants.
- Product forms allow up to 20 images per product.
- Category and banner payload schemas allow very large image string fields.
- Admin forms still allow pasted remote URLs.
- No explicit thumbnail/detail/original-retention policy exists.
- No CDN/object storage lifecycle policy exists.
- Remote image allowlist still permits external hosts.
- No implementation exists for vendor-scale quotas.

## Compression Reality

True lossless compression from 5 MB to 50 KB is usually unrealistic. The practical goal is visually lossless compression:

- resize oversized originals;
- convert to WebP/AVIF where appropriate;
- generate small thumbnails;
- generate medium card images;
- generate larger detail images;
- avoid serving originals unless needed;
- strip unnecessary metadata.

## Scale Example

50 vendors x 50 products x 20 variants x 5 images = 250,000 images.

At 5 MB each, raw storage would be about 1,220 GiB before backups, thumbnails, cache copies, CDN copies, or future originals. This is dangerous for storage cost and page speed.

## Recommended Future Media Policy

- Keep original upload only if needed, and store it outside the web root.
- Generate product thumbnail, card, detail, and zoom variants.
- Prefer WebP first, AVIF later after CPU/cost testing.
- Require max dimensions before processing.
- Strip metadata.
- Require alt text.
- Use object storage/CDN before production vendor uploads.
- Add per-product and per-vendor image limits.
- Add monitoring for upload size and storage growth.

## Implementation Should Be Separate

Do not implement image compression/variant changes in this batch. The next implementation batch should focus only on upload/media performance and tests.
