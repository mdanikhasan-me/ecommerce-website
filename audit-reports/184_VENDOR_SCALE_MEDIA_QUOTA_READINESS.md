# Step 184 - Vendor Scale Media Quota Readiness

## Scope

This loop documented future vendor media quota needs without enabling seller marketplace uploads.

## Image Explosion Risk

The scale example remains:

```text
50 vendors x 50 products x 20 variants x 5 images = 250,000 images
```

At raw 5 MB each, that is about 1,220 GiB before backups and generated variants.

## Product Image Count Risk

Current product payload policy allows up to 20 product images. This may be reasonable for admin-controlled pre-launch catalog work, but future seller uploads need stronger policy and moderation.

## Variant Image Count Risk

Variant images can multiply storage quickly. Future seller tools should avoid allowing every variant to carry many large images without quota.

## Quota Candidates

Future quota candidates:

- max images per product;
- max images per variant;
- max upload size;
- max decoded pixels;
- max active storage per vendor;
- max monthly upload volume;
- max pending moderation uploads;
- automatic cleanup of abandoned uploads.

## Moderation And Abuse Risks

Risks include:

- spam uploads;
- unrelated images;
- inappropriate images;
- repeated oversized uploads;
- attempts to store non-product media;
- CDN/storage cost abuse.

## Cleanup Strategy

Future cleanup should handle:

- images removed from product records;
- deleted product images;
- failed draft uploads;
- stale temporary files;
- orphaned object storage keys;
- replaced banner/category images.

## What Can Wait

Until seller marketplace is approved, vendor-facing quota enforcement can stay as a policy requirement.

## What Should Be Guarded Now

Guard now:

- helper-level byte/pixel/dimension limits;
- MIME validation;
- WebP preferred output;
- safe errors;
- explicit policy metadata;
- no false claim that CDN or variants exist.
