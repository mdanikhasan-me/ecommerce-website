# 300 Category Page UI/UX And Subcategory Media Pipeline

## Summary

Redesigned the public `/category` page body to match the approved All Categories direction:

- desktop uses a two-column department rail plus selected detail panel;
- mobile/tablet uses compact accessible disclosure rows with Electronics open by default;
- subcategories render before the `View All [Category]` CTA;
- the removed service/trust strip copy is not present;
- missing subcategory images render as neutral empty media wells, not fake photos.

Admin category image upload already existed through `Category.image` and the shared `CategoryEditorForm`. This step kept main category image uploads on the existing `/uploads/admin/categories/<category>/...` path and added a specific subcategory image path under `/assets/categories/subcategories/<subcategory>.webp`.

## Files Changed

- `src/app/(store)/category/page.tsx`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-paths.ts`
- `src/shared/category-media.ts`
- `tests/admin-media-storage-policy.test.ts`
- `tests/category-media.test.ts`
- `tests/category-page-uiux.test.ts`
- `tests/image-upload-validation.test.ts`
- `tests/media-path-taxonomy.test.ts`
- `audit-reports/300-category-page-uiux-and-media/browser-category-qa-evidence.json`
- `audit-reports/300-category-page-uiux-and-media/screenshots/*.png`
- `audit-reports/300_CATEGORY_PAGE_UIUX_AND_SUBCATEGORY_MEDIA_PIPELINE.md`
- `audit-reports/300_NEXT_PROMPT_DRAFT.md`

## Existing Pipeline Findings

- `/category` previously used `src/app/(store)/category/page.tsx` as a plain server-rendered accordion over active top-level categories and active children.
- Homepage category cards use `src/frontend/components/home/FeaturedCategories.tsx`, `getCategoryConfig`, and `src/shared/category-media.ts`.
- Prisma already supports category and subcategory images through `Category.image`; no schema or migration was needed.
- Admin create/edit pages already render `CategoryEditorForm`, which already includes `AdminImageField`.
- The admin upload backend already validates image data URLs, MIME/type match, size, dimensions, decoded pixels, and optimizes with Sharp.
- Main category uploads already persisted through `persistAdminUpload` to `/uploads/admin/categories/<category>/...`.
- Public `/category` did not render subcategory images before this step.

## Admin Subcategory Upload

Implemented/fixed public subcategory upload support:

- create/update category routes now pass `categoryKind: 'subcategory'` when `parentId` is set;
- subcategory image uploads use the existing safe upload pipeline;
- stable slug filenames are supported for this path;
- traversal and unsafe segments still pass through `sanitizeMediaPathSegment`;
- replacement cleanup can consider only the narrow managed prefix `/assets/categories/subcategories/`;
- broader `/assets/` source-code assets remain protected.

Final paths:

- main category admin uploads: `/uploads/admin/categories/<category>/<media>-<timestamp>-<random>.webp`
- subcategory admin uploads: `/assets/categories/subcategories/<subcategory>.webp`

## Icon Strategy

No new icon files were added. The page reuses:

- `lucide-react` category icons from `src/frontend/components/category/category-config.tsx`;
- local UI icons through `LocalIcon` for chevrons/grid.

## Media Confirmations

- No fake product photos were hardcoded.
- No random remote images or AI placeholder images were added.
- Missing subcategory images render as neutral empty blocks.
- Public subcategory images render only when the row has local/admin-managed media accepted by `getSubcategoryMediaPath`.

## UI Confirmations

- `View All Electronics` appears after `Mobile Phones`, `Laptops`, `Audio`, and `Wearables`.
- `100% Authentic`, `Fast Delivery`, and `Easy Support` are not present in the category UI.
- Desktop rail selected state is driven by `/category?department=<slug>`.
- Mobile/tablet disclosure rows use native `details/summary` semantics and are keyboard accessible.

## Screenshot QA

Evidence file:

- `audit-reports/300-category-page-uiux-and-media/browser-category-qa-evidence.json`

Screenshots:

- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1920x1080-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1920x1080-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1536x864-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1536x864-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1366x768-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1366x768-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1280x720-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/desktop-1280x720-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-1024x768-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-1024x768-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-820x1180-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-820x1180-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-768x1024-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/tablet-768x1024-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-430x932-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-430x932-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-390x844-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-390x844-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-390x844-default-fullpage.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-375x812-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-375x812-fashion.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-360x800-default.png`
- `audit-reports/300-category-page-uiux-and-media/screenshots/mobile-360x800-fashion.png`

Browser/device sizes tested:

- desktop: 1920x1080, 1536x864, 1366x768, 1280x720
- tablet: 1024x768, 820x1180, 768x1024
- mobile: 430x932, 390x844, 375x812, 360x800

Findings:

- console/runtime log count: 0 in captured QA evidence;
- horizontal overflow: none detected;
- hydration errors: none observed in console/runtime evidence;
- `View All Electronics` ordering: passed for default Electronics state;
- removed benefit strip: absent;
- fake/remote subcategory images: absent;
- header/footer overlap: none observed in representative screenshots.

The in-app Browser plugin was unavailable, so screenshots were captured through the repo's existing local Chrome DevTools Protocol browser approach.

## Validation Results

- `npm run db:url:safety`: pass.
- `npm run prisma:local:validate`: missing script. Repo suggests `db:prisma:local:validate`.
- `npm run prisma:local:generate`: missing script. Repo suggests `db:prisma:local:generate`.
- `npm run db:prisma:local:validate`: pass.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` file lock renaming `node_modules/.prisma/client/query_engine-windows.dll.node`; active local Next dev server processes were present on port 3000.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass, 496 tests.
- `npm run build`: pass.

## Remaining Risks Or Blockers

- Prisma generate could not complete while the active local Next dev server held the Prisma engine DLL. No schema change was made, and build/typecheck/tests passed with the existing generated client.
- Full authenticated admin browser upload verification was not performed because this task did not alter auth fixtures and the public/admin code path was verified through route/helper tests instead.
- The new `/assets/categories/subcategories/` folder is a narrow managed exception inside the broader protected `/assets/` tree. Tests document this boundary.

## Manual Staging Commands

No commit was made because Prisma generate is still blocked by the local Windows file lock.

```bash
git add "src/app/(store)/category/page.tsx"
git add "src/app/api/admin/categories/route.ts" "src/app/api/admin/categories/[id]/route.ts"
git add "src/backend/admin/admin-utils.ts" "src/backend/admin/image-processing.ts" "src/backend/admin/media-lifecycle.ts" "src/backend/admin/media-paths.ts"
git add "src/shared/category-media.ts"
git add "tests/admin-media-storage-policy.test.ts" "tests/category-media.test.ts" "tests/category-page-uiux.test.ts" "tests/image-upload-validation.test.ts" "tests/media-path-taxonomy.test.ts"
git add "audit-reports/300-category-page-uiux-and-media" "audit-reports/300_CATEGORY_PAGE_UIUX_AND_SUBCATEGORY_MEDIA_PIPELINE.md" "audit-reports/300_NEXT_PROMPT_DRAFT.md"
```

Recommended commit message after clearing the Prisma DLL lock:

```txt
feat: redesign categories page and support subcategory media
```

## Next Recommended Step

Stop or restart the active local Next dev server, rerun `npm run db:prisma:local:generate`, then stage the exact files above and commit if it passes.
