# Step 382 Final Report

## Root Cause

Parent category uploads were using the generic admin category upload path:

```text
/uploads/admin/categories/<category>/<category-random>.webp
```

That path was technically managed, but it was confusing for a parent category replacement because each upload created a new random active file instead of one stable category image target. It also made the category image source-of-truth look split across source assets, admin uploads, and fallback mappings.

## Chosen Policy

Chosen policy: Policy B.

Parent/main category admin uploads now use one clean managed upload source:

```text
public/uploads/categories/<category-slug>.webp
```

Public URL format:

```text
/uploads/categories/<category-slug>.webp
```

The DB stores the clean path only. The storefront resolver appends deterministic content-hash cache busting at render time when the file exists:

```text
/uploads/categories/electronics.webp?v=<sha-prefix>
```

`public/assets/categories/**` remains source-controlled fallback/default artwork. It is not deleted or overwritten by admin parent category uploads.

## What Changed

- Parent category upload planning now targets `/uploads/categories/<slug>.webp`.
- Parent category upload persistence uses a stable filename strategy.
- `/uploads/categories/**` is classified as managed upload media for reference-safe cleanup.
- Legacy `/uploads/admin/categories/**` parent category paths are treated as broken legacy display paths for parent categories, so they cannot override fallback/default category artwork.
- Category save parsing strips deterministic `?v=<hash>` before storing DB values.
- Homepage and All Categories category resolvers prefer clean saved DB image paths over fallback source assets.
- Admin category create/update/delete routes revalidate homepage, All Categories, relevant category detail pages, and admin category pages after mutation.
- Media audit and QA scripts now know `/uploads/categories/**` is the active parent category upload root.
- Tests were updated to pin stable slug filenames, no data URLs, no random active filenames, DB override behavior, source-asset protection, and route revalidation.

## Electronics Proof

Final app-DB proof used Next env loading before Prisma, matching the running storefront database.

Original app DB value:

```text
/assets/categories/electronics.jpg
```

First proof upload returned:

```text
/uploads/categories/electronics.webp
```

Second proof upload returned the same URL:

```text
/uploads/categories/electronics.webp
```

The physical file checksum changed between the first and second upload, proving same-path replacement:

- First hash: `226fe5c8c8fcb413ad9917a876ba75d7edc33226a31dbb6339ef5e7cf6dc1e1b`
- Second hash: `8827db3b82db5b92568aedd5f59c7c4398efbd4be66c4496b8aedd0d27d67922`

During proof, the app DB stored:

```text
/uploads/categories/electronics.webp
```

The storefront resolver returned:

```text
/uploads/categories/electronics.webp?v=8827db3b82db
```

The rendered homepage proof contained `/uploads/categories/electronics.webp` and did not contain `/assets/categories/electronics.jpg` while the app DB value was active.

## Cleanup Proof

The legacy random Electronics upload:

```text
/uploads/admin/categories/electronics/electronics-mq3xabpq-26c7400d.webp
```

was deleted through the reference-safe managed cleanup helper after proving no category row referenced it.

After proof:

- `public/uploads/admin/categories` contains no files.
- `public/uploads/categories` contains no files because the generated proof image was restored/removed.
- `public/assets/categories/electronics.jpg` remains unchanged as fallback artwork.
- App DB Electronics image was restored to `/assets/categories/electronics.jpg`.

## Screenshots

Screenshots are under:

```text
audit-reports/382-category-media-source-of-truth/screenshots-after/
```

Key files:

- `home-active-electronics-1250x900.png`
- `category-active-electronics-1250x900.png`
- `admin-electronics-auth-required-1250x900.png`

The admin screenshot shows sign-in because the isolated headless browser was not authenticated. Admin behavior is proven through upload response, app DB value, parser/source tests, and route/source tests.

## Validation

All requested validation passed:

- `npm run typecheck`
- `npm run lint`
- focused category/media tests
- `npm test`
- `node scripts/audit-public-media-source-of-truth.mjs --out-dir audit-reports/382-category-media-source-of-truth/public-media-source-audit-after`
- `npm run build`

Detailed logs are in `11-tests-validation.txt` and the `validation-*.txt` files.

## Guardrail Confirmation

Not touched or staged by this step:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- payment, checkout, tracking, seller marketplace, footer payment assets, or unrelated product/banner media

No seed/reset/db push/destructive SQL/migration command was run.

## Production Caveat

This keeps the existing local-public-upload architecture. It is coherent with the current project policy, but a production deployment still needs durable shared/object storage if the runtime filesystem is ephemeral across deploys.
