# Step 309 Admin Upload Destination Map

## Scope
This map records current admin media destinations and cleanup behavior. It is read-only evidence for Step 309; no upload path, DB row, source asset, or media file was changed.

## Product Images

UI entry points:
- `src/frontend/components/admin/ProductEditorForm.tsx`
- `src/app/(admin)/admin/products/new/page.tsx`
- `src/app/(admin)/admin/products/[id]/page.tsx`

API routes:
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`

Backend helpers:
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/media-paths.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/media-lifecycle.ts`

Current destination:
- Data URL product images are persisted by `normalizeProductImages()` -> `persistImage()` -> `buildManagedProductUploadPath()`.
- Output folder: `public/uploads/products/<category>/<subcategory>/<product>/`.
- Public URL format: `/uploads/products/<category>/<subcategory>/<product>/<image-id>-<timestamp>-<random>.webp`.
- Existing older flat uploads under `/uploads/products/<filename>` are still cleanup-compatible.

DB storage:
- `ProductImage.url` stores the resulting URL.
- Current local DB has 19 `ProductImage.url` rows:
  - 6 existing `/uploads/products/**` managed uploads.
  - 12 `/assets/products/catalog/**` source catalog paths that now point to deleted files.
  - 1 `/assets/banners/home-hero-iphone-15-pro.jpg` wrong-owner source banner path.

Delete and replace behavior:
- Product create cleans newly persisted uploads if DB create fails.
- Product update deletes removed managed product uploads after the DB transaction with `deleteRemovedProductImages(existingImageUrls, nextImageUrls)`.
- Product delete calls `deleteManagedUpload(image.url)` for each product image after deleting the product.
- Cleanup refuses source assets such as `/assets/products/catalog/**` and remote URLs.
- Step 305 product media cleanup coverage remains in place through the reference-checked product cleanup helpers.

Risk:
- Product admin uploads are already correctly wired to `/uploads/products/**`.
- Existing DB rows that point to `/assets/products/catalog/**` are not admin uploads; they are source/catalog references and must not be physically deleted by admin cleanup.
- Current tracked source deletions make 12 active product rows broken.
- The iPhone product row points to a banner source asset instead of its product catalog asset or a managed upload.

## Banner Images

UI entry points:
- `src/frontend/components/admin/BannerEditorForm.tsx`
- `src/app/(admin)/admin/banners/new/page.tsx`
- `src/app/(admin)/admin/banners/[id]/page.tsx`

API routes:
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`

Backend helpers:
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/media-paths.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/media-lifecycle.ts`

Current destination:
- Data URL banner images are persisted by `persistAdminUpload({ purpose: 'banners' })`.
- Output folder: `public/uploads/admin/banners/<banner-owner>/`.
- Public URL format: `/uploads/admin/banners/<banner-owner>/<desktop-or-mobile>-<timestamp>-<random>.webp`.

DB storage:
- `Banner.imageUrl` stores the desktop URL.
- `Banner.mobileImageUrl` stores the mobile URL when present.
- Homepage source of truth remains DB: `src/app/(store)/page.tsx` reads active hero banners with `db.banner.findMany({ where: { isActive: true, position: 'hero' } })`.

Delete and replace behavior:
- Banner create cleans newly persisted banner uploads if DB create fails.
- Banner update calls `deleteReplacedAdminUploads([existing image fields], [next image fields])`.
- Banner delete deletes the DB row and calls `cleanupManagedAdminUploads()`.
- Cleanup refuses source assets such as `/assets/banners/**` and remote URLs.

Current local DB findings:
- The local DB currently has 1 active hero banner row: `Galaxy S24 Ultra`.
- It points to `/assets/banners/home-hero-galaxy-s24-ultra.jpg`.
- That source file is currently deleted in the worktree, so the active homepage hero image is broken until the source asset is restored or the DB row is moved to an existing managed upload.
- Step 308 saw one local/dev active hero row because this workspace's local env has one active hero row. The separate production-style read-only check in Step 308 saw six active rows with duplicate/remote entries because it queried a different environment/configuration. Step 309 did not read or mutate that production-style data.

Risk:
- Banner admin uploads are correctly wired to `/uploads/admin/banners/**`.
- Existing source banner rows are legitimate only if the source files remain tracked and present.
- Current tracked source deletions make the active local hero broken.

## Category And Subcategory Images

UI entry points:
- `src/frontend/components/admin/CategoryEditorForm.tsx`
- `src/app/(admin)/admin/categories/new/page.tsx`
- `src/app/(admin)/admin/categories/[id]/page.tsx`

API routes:
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`

Backend helpers:
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/category-editor.ts`
- `src/backend/admin/media-paths.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/media-lifecycle.ts`

Current destination:
- Parent category data URL images use `persistAdminUpload({ purpose: 'categories', categoryKind: 'category' })`.
- Parent category output folder: `public/uploads/admin/categories/<category>/`.
- Parent category public URL format: `/uploads/admin/categories/<category>/image-<timestamp>-<random>.webp`.
- Subcategory data URL images use `persistAdminUpload({ purpose: 'categories', categoryKind: 'subcategory' })`.
- Subcategory output folder: `public/assets/categories/subcategories/`.
- Subcategory public URL format: `/assets/categories/subcategories/<subcategory>.webp` with a stable filename.

DB storage:
- `Category.image` stores the image URL.
- Current local DB has 8 parent category image refs, all pointing to existing `/assets/categories/<slug>.jpg` source assets.

Delete and replace behavior:
- Category create cleans newly persisted image upload if DB create fails.
- Category update calls `deleteReplacedAdminUploads([existingCategory.image], [image])`.
- Category delete archives categories with children/products; only empty categories are physically deleted, then `deleteManagedAdminUpload(existingCategory.image)` is called.
- Source category images under `/assets/categories/<slug>.jpg` are protected and not admin-deleted.

Important cleanup concern:
- `media-lifecycle.ts` treats `/assets/categories/subcategories/**` as a managed local upload prefix.
- `admin-utils.ts` allows that prefix in `resolveReferenceSafeAdminDeletion()`.
- But the helper then resolves the file path with `resolveManagedMediaFilePath(..., '/uploads/admin/', ...)` instead of the actual classification prefix.
- Result: parent category uploads under `/uploads/admin/categories/**` should resolve for physical cleanup, but subcategory files under `/assets/categories/subcategories/**` are likely not physically deleted even when reference checks say they are safe.
- This was reported only; no lifecycle code was changed in Step 309.

Risk:
- Parent category admin uploads and source category assets are separated.
- Subcategory media is an approved exception under `/assets/categories/subcategories/**`, but the delete path should be fixed in a dedicated step.

## Generic Admin Files

Current finding:
- No active route or helper was found creating `public/uploads/admin/files/**`.
- `public/uploads/admin/files/**` is classified by the Step 309 audit script as a generic admin file upload if files appear later.
- Current `public/uploads/admin/files/**` has no media files in the inventory.

Risk:
- If this folder is introduced later, it will be orphan-prone unless a DB owner/reference model is added.

## Current QA/Test Upload Folders

The inventory found 24 QA/temp-looking directories under `public/uploads/**`, all with `mediaFileCount: 0` in the current tree. Examples:
- `/uploads/admin/banners/qa-media-step285-*`
- `/uploads/admin/categories/qa-media-step285-*`
- `/uploads/products/qa-category/qa-subcategory/qa-media-step285-*`

No directory deletion was performed. Empty-directory cleanup still needs explicit approval because it would modify the working tree.
