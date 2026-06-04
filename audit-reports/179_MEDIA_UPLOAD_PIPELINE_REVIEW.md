# Step 179 - Media Upload Pipeline Review

## Scope

This loop reviewed the current Boilabin image upload pipeline before implementation.

## Helper Location

Primary helper:

- `src/backend/admin/image-processing.ts`

Related callers:

- admin product editor backend;
- admin banner/category forms through image URL/data URL payload paths;
- admin upload field helper.

## Existing Profiles

Profiles exist for:

- products;
- banners;
- brands;
- categories;
- default fallback.

## Limits Reviewed

Current limit foundations:

- encoded upload bytes;
- decoded pixel count;
- maximum single dimension;
- MIME allowlist;
- metadata format check.

## MIME Validation

The helper compares declared data URL MIME type to decoded Sharp metadata format. This is important because a file can be mislabeled.

## WebP Behavior

The helper tries WebP first. This is the preferred current output format.

## Fallback Behavior

If WebP persistence fails, the helper attempts a format based on the original MIME type. This fallback remains in place.

## Storage Location

Current uploads are written under local `public/uploads`.

This is acceptable for local/pre-launch but is not final production multi-vendor storage.

## Multiple Variant Status

No real multi-file variant persistence exists yet. The app currently creates one optimized output per upload.

## Existing Tests Before This Batch

Existing tests covered:

- valid upload acceptance;
- unsupported MIME rejection;
- corrupt image rejection;
- MIME mismatch rejection.

## Safe Changes For This Batch

Safe changes:

- expose profile and limit metadata for tests and audits;
- make future variant intent names explicit;
- classify decoded pixel failures with a safe specific error;
- add tests for byte, pixel, dimension, WebP, and policy metadata.

## Future Work

Future work remains:

- derived variants;
- object storage/CDN;
- quotas;
- original retention policy;
- cleanup lifecycle.
