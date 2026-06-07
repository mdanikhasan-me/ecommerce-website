# Step 382 Electronics Replacement Proof

## Environment Correction

The first helper-level proof used Prisma's standalone env loading and found a different local database context than the running Next app. That snapshot is preserved as `04-standalone-prisma-env-db-values-before-superseded.txt` and `10-electronics-replacement-proof.json` for transparency.

The final proof used Next's env loading (`@next/env` `loadEnvConfig`) before constructing Prisma, matching the running storefront database.

## Final App-DB Proof

- Category: Electronics
- App DB category id: `cmpxdfpev000h5jm0f1qaipzx`
- Original DB image path: `/assets/categories/electronics.jpg`
- Chosen policy: Policy B, managed upload source with source assets as fallback
- Stable managed path: `/uploads/categories/electronics.webp`
- Stable physical path: `public/uploads/categories/electronics.webp`
- Stable file before proof: none

## Upload Replacement Evidence

First upload:

- Returned URL: `/uploads/categories/electronics.webp`
- Data URL returned: no
- Legacy `/uploads/admin/categories` returned: no
- Random suffix returned: no
- File hash: `226fe5c8c8fcb413ad9917a876ba75d7edc33226a31dbb6339ef5e7cf6dc1e1b`

Second upload/replacement:

- Returned URL: `/uploads/categories/electronics.webp`
- Same URL as first upload: yes
- Data URL returned: no
- Legacy `/uploads/admin/categories` returned: no
- Random suffix returned: no
- File hash: `8827db3b82db5b92568aedd5f59c7c4398efbd4be66c4496b8aedd0d27d67922`
- Checksum changed from first upload: yes

During proof, app DB stored:

```json
{"id":"cmpxdfpev000h5jm0f1qaipzx","slug":"electronics","image":"/uploads/categories/electronics.webp"}
```

The storefront resolver returned:

```text
/uploads/categories/electronics.webp?v=8827db3b82db
```

That proves the DB stores a clean stable path while the rendered storefront gets deterministic content-hash cache busting.

## Storefront Evidence

After activating the app-DB proof image, clearing generated Next cache, and restarting the local dev server, homepage HTML contained `/uploads/categories/electronics.webp` and did not contain the Electronics fallback asset `/assets/categories/electronics.jpg`.

Screenshots captured while the app DB image was active:

- `audit-reports/382-category-media-source-of-truth/screenshots-after/home-active-electronics-1250x900.png`
- `audit-reports/382-category-media-source-of-truth/screenshots-after/category-active-electronics-1250x900.png`
- `audit-reports/382-category-media-source-of-truth/screenshots-after/admin-electronics-auth-required-1250x900.png`

The admin screenshot shows the sign-in form because the isolated headless browser did not have the user's admin session. The admin field behavior is proven through upload response, DB value, parser tests, and route/source tests rather than an authenticated browser session.

## Legacy Random Upload Cleanup

Before the app-env proof, the workspace contained this legacy random upload file:

```text
/uploads/admin/categories/electronics/electronics-mq3xabpq-26c7400d.webp
```

The guarded deletion helper deleted it after reference checks. Proof file `10-electronics-replacement-proof.json` records:

```json
{"beforeExists":true,"deleted":true,"afterExists":false}
```

After proof, `public/uploads/admin/categories` contains no files.

## Source Asset Handling

`public/assets/categories/electronics.jpg` was not replaced or deleted. Under Policy B it remains source-controlled fallback/default artwork only.

The temporary proof upload `public/uploads/categories/electronics.webp` was removed after screenshots because it was generated test artwork. In a real admin save, that path remains as the active managed category image.

## Restoration

After proof:

- App DB Electronics image restored to `/assets/categories/electronics.jpg`.
- Temporary `public/uploads/categories/electronics.webp` removed.
- Generated Next cache was cleared and dev server restarted after restoration.
- Restored homepage check: managed proof path absent, fallback asset present.
