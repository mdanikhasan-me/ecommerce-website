# Step 382 Current Category Image Code Map Before Fix

## Read context used

- Step 116 established canonical source-controlled fallback category assets under `public/assets/categories/*.jpg`.
- Step 267 fixed stale category image cache behavior by adding deterministic version query strings for static `/assets/categories/*` paths.
- Step 276 documented current managed local upload roots and treated `public/uploads/admin/categories` as category admin upload storage for data URL persistence.
- Step 309 explicitly mapped parent category uploads to `/uploads/admin/categories/<category>/image-<timestamp>-<random>.webp` and subcategory media to the special `/assets/categories/subcategories/<subcategory>.webp` exception.
- Step 319 fixed cleanup path resolution for `/assets/categories/subcategories/**`.
- Steps 320 and 321 left category SVG icon edits and `public/uploads/admin/banners/hero/` pending; they are not part of this step.

## Current data flow before this fix

1. Admin image selection happens in `src/frontend/components/admin/CategoryEditorForm.tsx` through `AdminImageField`.
2. The form uploads selected files immediately with `fetch('/api/admin/categories/upload')` and sends `owner` derived from the category slug/name.
3. The upload API is `src/app/api/admin/categories/upload/route.ts`.
4. That route calls `persistAdminCategoryImageFile()` in `src/backend/admin/category-image-upload.ts`.
5. `persistAdminCategoryImageFile()` builds a category upload path with `buildManagedCategoryUploadPath()` and calls `persistOptimizedImageUpload()` with `filenameStrategy: 'unique'`.
6. `buildManagedCategoryUploadPath()` currently points parent category media to `public/uploads/admin/categories/<category>` and public URLs under `/uploads/admin/categories/<category>`.
7. `persistOptimizedImageUpload()` adds a timestamp and random UUID suffix when `filenameStrategy` is `unique`.
8. That is why an Electronics upload returns a path shaped like `/uploads/admin/categories/electronics/electronics-mq3xabpq-26c7400d.webp`.
9. The admin form places that returned URL in the category `image` field.
10. On save, `src/app/api/admin/categories/[id]/route.ts` parses the JSON payload and calls `persistAdminUpload(payload.image, { purpose: 'categories', ownerSlugOrId: slug, mediaId: 'image', categoryKind })`.
11. Because the uploaded value is already a normal URL and not `data:image/`, `persistAdminUpload()` returns it unchanged.
12. The DB field is `Category.image`.
13. Homepage category cards call `getCategoryMediaPath(category)` from `src/shared/category-media.ts` through `src/frontend/components/home/FeaturedCategories.tsx`.
14. The All Categories subcategory cards call `getSubcategoryMediaPath(child)` from `src/shared/category-media.ts` through `src/app/(store)/category/page.tsx`.
15. `getCategoryMediaPath()` currently lets clean saved DB images override fallback assets, while rejecting known legacy `/images/categories/*`, remote Unsplash/Pexels, SVG, and data URL values.
16. Cleanup uses `deleteReplacedAdminUploads()` and `deleteManagedAdminUpload()` from `src/backend/admin/admin-utils.ts`, with path classification in `src/backend/admin/media-lifecycle.ts`.
17. Before this fix, cleanup recognizes `/uploads/admin/**`, `/uploads/products/**`, and `/assets/categories/subcategories/**`, but not a clean parent folder like `/uploads/categories/**`.

## Current baseline facts

- `public/assets/categories/electronics.jpg` exists and has SHA-256 `75b478cf761d743fcd63e56e17f91c867c94caa063eaa215f8b74fdc117e2ab8`.
- `public/uploads/categories` does not exist before the fix.
- `public/uploads/admin/categories/electronics/electronics-mq3xabpq-26c7400d.webp` exists before the fix and has SHA-256 `01613a38d9b617427cfe1fb856caaef01fd4d98e67308ab23c722abca76c90c5`.
- Local DB `Electronics.image` is `/images/categories/electronics.jpg`, which `getCategoryMediaPath()` treats as legacy and falls back to `/assets/categories/electronics.jpg?v=75b478cf761d`.
- The unauthenticated browser cannot view the admin edit form in this headless session; it redirects `/admin/categories/cmnw0j8s5000i4ebtm8c61504` to `/auth/login?callbackUrl=...`.

## Before screenshots

- `audit-reports/382-category-media-source-of-truth/screenshots-before/home-before-1250x900.png`
- `audit-reports/382-category-media-source-of-truth/screenshots-before/category-before-1250x900.png`
- `audit-reports/382-category-media-source-of-truth/screenshots-before/admin-electronics-before-1250x900.png` redirects to login because no admin session is available in the isolated headless browser.
