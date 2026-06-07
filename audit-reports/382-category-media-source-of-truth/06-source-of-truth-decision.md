# Step 382 Source-of-Truth Decision

## 1. Chosen policy

Policy B: clean managed upload source, with `public/assets/categories` retained as fallback/source artwork only.

## 2. Active category image folder

Parent/main category admin uploads will use:

`public/uploads/categories/`

## 3. Public URL format

Stored DB/admin field format:

`/uploads/categories/<category-slug>.webp`

Rendered storefront format when the local file is present:

`/uploads/categories/<category-slug>.webp?v=<sha256-prefix>`

## 4. Filename format

The physical active basename is stable and slug-based:

`<category-slug>.webp`

For Electronics:

`electronics.webp`

## 5. Deterministic cache version

Yes. Runtime storefront rendering appends a deterministic SHA-256 content hash query for `/uploads/categories/*` files when the file exists locally. The DB/admin field stays clean and does not store base64 or random suffixes.

## 6. Stable filenames

Yes. Parent category admin uploads overwrite/replace the same slug filename.

## 7. Random parent-category active filenames removed

Yes. New parent category uploads must not use timestamp/random suffixes and must not write active files under `/uploads/admin/categories`.

## 8. `public/assets/categories` role

Fallback/source-controlled artwork only. It remains protected from admin cleanup and is not directly replaced by admin uploads.

## 9. `/uploads/admin/categories` parent usage

No. It remains a legacy/old managed path that may be cleaned when reference-safe, but it is not used for new parent category uploads.

## 10. Old random `/uploads/admin/categories/...` files

Old random files are legacy. Replacement cleanup must delete old DB-referenced managed files when reference-safe. This step may also delete the discovered unreferenced Electronics random upload after proving it is not referenced.

## 11. Old `public/assets/categories/electronics.*`

Kept as protected fallback/source artwork. It is not overwritten by admin category uploads under Policy B.

## 12. Why this is safe with previous audit history

Earlier audits consistently treated `public/assets/**` as source-controlled static/fallback assets and `public/uploads/**` as runtime/admin-managed uploads. Policy B keeps that boundary intact, avoids editing source-controlled fallback artwork from the admin runtime, and still gives the user one clean active managed parent-category upload location.

## 13. Production/deployment caveat

This project still uses local public filesystem uploads. On production hosts with ephemeral filesystems or multiple instances, a durable object-storage provider would be required. This step simplifies the local/prelaunch source-of-truth path; it does not implement object storage or media ownership schema migrations.
