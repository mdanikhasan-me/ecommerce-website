# Step 180 - Media Upload Policy And Limits

## Scope

This loop created the media upload policy document.

Created:

- `docs/MEDIA_UPLOAD_POLICY.md`

## Owner-Friendly Result

The policy explains why large images are dangerous, why true lossless compression is not a realistic promise, and why visually lossless optimization is the right practical goal.

## Current Implemented Limits

Documented current helper-level limits:

- 8 MB max encoded upload;
- 24,000,000 decoded pixels;
- 8,000 pixel max dimension;
- JPEG, PNG, WebP, GIF input formats;
- WebP-preferred output;
- local `public/uploads` storage.

## Profile Policy

Documented policy for:

- product images;
- banner images;
- category images;
- brand images;
- future vendor images.

## Variant Policy

Future variant intents are:

- thumbnail;
- card;
- detail;
- zoom.

Current status remains one optimized output file per upload.

## Original Retention

Recommendation: do not keep raw originals in the public web root by default.

## CDN/Object Storage Boundary

The policy clearly states that local uploads are not final production multi-vendor storage and object storage/CDN is future work.

## Alt Text

The policy requires meaningful alt text for product media and content-aware labels for category/banner media.
