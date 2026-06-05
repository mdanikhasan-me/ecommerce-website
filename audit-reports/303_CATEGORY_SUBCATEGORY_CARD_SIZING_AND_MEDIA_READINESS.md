# 303 Category Subcategory Card Sizing And Media Readiness

## Summary

Step 302 corrected the typography and moved missing subcategory media away from icon-filled placeholders, but it overcorrected the visual size of the subcategory cards. The `/category` subcategory area started to read like a row of small navigation buttons instead of photo-ready category cards.

Step 303 restores a middle-ground card layout while preserving the Step 302 typography, accepted ordering, mobile accordion behavior, desktop rail and detail panel, and Step 300 media pipeline.

## What Was Wrong After Step 302

- Desktop no-image subcategory cards used small row cards with `h-12 w-12` media wells.
- Future uploaded photos would have rendered in a larger card path only when an image existed, so the no-image state did not represent the real future layout.
- Mobile subcategory rows used a narrow `70px` to `84px` media column and felt cramped.
- `View All Electronics` looked visually smaller than the restored subcategory cards.

## Category Icon Confirmation

The category SVG files were not edited, regenerated, replaced, or staged in Step 303.

Protected icon paths:

- `public/assets/icons/ui/categories/electronics.svg`
- `public/assets/icons/ui/categories/fashion.svg`
- `public/assets/icons/ui/categories/home-appliances.svg`
- `public/assets/icons/ui/categories/beauty-health.svg`
- `public/assets/icons/ui/categories/sports-fitness.svg`
- `public/assets/icons/ui/categories/books-stationery.svg`
- `public/assets/icons/ui/categories/gaming.svg`
- `public/assets/icons/ui/categories/toys-collectibles.svg`
- `public/assets/icons/ui/categories/view-all.svg`

The working tree already contained manual icon changes before Step 303 edits began. Those changes were treated as user-owned and left untouched.

## Layout And Card Sizing Changes

Desktop subcategory cards now use one shared photo-ready card path for both uploaded-image and missing-image states:

- grid spacing increased to `gap-3.5`;
- desktop grid remains two columns at narrower panel widths and four columns at `xl`;
- each card uses `product-card group flex h-full flex-col`;
- media area uses `aspect-[16/10]`;
- body uses `min-h-[104px]` with compact title, description, and a `36px` arrow affordance;
- uploaded images use `object-cover` with a subtle hover scale;
- no-image cards keep the same media dimensions instead of shrinking into button rows.

Mobile subcategory rows now reserve a meaningful media area:

- row minimum height increased to `104px`;
- media width is `96px`, `104px` from `390px` width, and `112px` from `sm`;
- media height is `104px`;
- title, short copy, and arrow remain readable in a horizontal row;
- uploaded images continue to use `object-cover`.

The `View All Electronics` CTA remains after the subcategories and now uses a `72px` minimum height with larger icon and arrow controls so it aligns better with the restored card scale.

## Missing Image Slot Behavior

Missing subcategory media now renders as an empty neutral media surface inside the same photo-ready media slot used by uploaded images.

Confirmed behavior:

- no fake photos;
- no remote or hotlinked placeholder images;
- no AI placeholder images;
- no unrelated product/category photos;
- no public `coming soon`, `placeholder`, or admin/upload text;
- no category icons inside empty media surfaces.

## Future Uploaded Image Behavior

Uploaded subcategory images still resolve through `getSubcategoryMediaPath(child)` and the Step 300 upload path:

- `/assets/categories/subcategories/<subcategory>.webp`

When an uploaded image exists, it renders in the `aspect-[16/10]` desktop media well and the larger mobile row media well with `object-cover`.

## Screenshot QA

Evidence file:

- `audit-reports/303-category-subcategory-card-sizing/browser-category-subcategory-card-sizing-evidence.json`

Screenshots:

- `audit-reports/303-category-subcategory-card-sizing/screenshots/desktop-1920x1080-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/desktop-1536x864-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/desktop-1366x768-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/tablet-1024x768-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/tablet-820x1180-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/mobile-430x932-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/mobile-390x844-default.png`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/mobile-375x812-default.png`

Automated screenshot QA result:

- screenshot count: 8;
- category failures: none;
- no horizontal overflow;
- no fake image sources;
- no public placeholder/admin text;
- no icon descendants inside empty media surfaces;
- local category icon asset fetches OK;
- `View All Electronics` remains after `Mobile Phones`, `Laptops`, `Audio`, and `Wearables`;
- no console, runtime, server, or image loading errors captured.

Representative measured card/media sizes:

- desktop 1920: subcategory card about `324x307`, empty media about `322x201`;
- desktop 1366: subcategory card about `201x230`, empty media about `199x124`;
- tablet 1024: subcategory card about `273x275`, empty media about `271x169`;
- mobile 390: subcategory row about `324x106`, empty media about `104x104`;
- mobile 375: subcategory row about `309x106`, empty media about `96x104`.

## Validation Results

- `npx tsx --test tests/category-page-uiux.test.ts`: pass, 9 tests.
- `npm run db:url:safety`: pass.
- `npm run db:prisma:local:validate`: pass.
- `npm run db:prisma:local:generate`: blocked by Windows `EPERM` file lock while renaming `node_modules/.prisma/client/query_engine-windows.dll.node.tmp6448` to `node_modules/.prisma/client/query_engine-windows.dll.node`.
- Likely locking process: local Next server on port `3000`, PID `17212`, `C:\Program Files\nodejs\node.exe`, running `node_modules\next\dist\server\lib\start-server.js`.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: pass, 501 tests.
- `npm run build`: pass.

No Prisma schema, migration, or client-contract files were changed.

## Exact Files Changed

- `src/app/(store)/category/page.tsx`
- `tests/category-page-uiux.test.ts`
- `audit-reports/303-category-subcategory-card-sizing/browser-category-subcategory-card-sizing-evidence.json`
- `audit-reports/303-category-subcategory-card-sizing/screenshots/*.png`
- `audit-reports/303_CATEGORY_SUBCATEGORY_CARD_SIZING_AND_MEDIA_READINESS.md`
- `audit-reports/303_NEXT_PROMPT_DRAFT.md`

## Commit Status

Pending exact-file staging and commit. Final commit hash is recorded in the final assistant response because embedding the exact hash in the committed report would change the hash.

## Remaining Risks

- Prisma generate remains blocked locally by the Windows Prisma DLL file lock.
- Manual category SVG changes were present before Step 303 and remain unstaged/protected.
- Final visual acceptance is still human-review dependent, but screenshot and DOM evidence now match the Step 303 objective checks.

## Recommended Next Step

Stop or restart the local Next process that is locking the Prisma query engine DLL, rerun `npm run db:prisma:local:generate`, then continue with the next bounded storefront visual QA task only after confirming the working tree and protected icon edits are understood.
