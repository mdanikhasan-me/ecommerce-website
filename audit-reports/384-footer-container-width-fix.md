# Step 384 - Footer Container Width Fix

## Root Cause

The storefront page shell uses the shared `.container-site` class for homepage sections. That class is full width with responsive side padding:

`w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24`

The footer already sat inside `.container-site`, but its real content rows were capped again with `mx-auto max-w-6xl`. On large screens this made the footer content stay at 1152px while the homepage sections above continued to use the full `.container-site` content width. The mismatch became severe on 2K and 4K screens.

## Homepage Container System

Homepage sections and product/category rails use `.container-site` as the page shell. The measured content box grows with the viewport while keeping responsive side padding:

| Viewport | Homepage content left | Homepage content width |
| --- | ---: | ---: |
| 1366x768 | 64px | 1228px |
| 1920x1080 | 96px | 1718px |
| 2560x1440 | 96px | 2358px |
| 3840x2160 | 96px | 3638px |

## Footer Before

The footer content rows used `mx-auto max-w-6xl`, which produced these mismatches before the fix:

| Viewport | Footer row left delta | Footer row width delta |
| --- | ---: | ---: |
| 1366x768 | +102px | -204px |
| 1920x1080 | +379px | -758px |
| 2560x1440 | +699px | -1398px |

## What Changed

Changed the footer main content row and bottom legal row from capped rows to full-width rows inside the existing `.container-site` shell:

- Before: `mx-auto max-w-6xl ...`
- After: `w-full ...`

No footer content was removed. Payment logos and newsletter content stayed in place.

## Final Footer Rule

Footer now uses the same outer `.container-site` responsive content width as the homepage sections above it. The footer top columns, payment/newsletter row, and bottom legal row share the same aligned inner width.

## Measurement Proof After Fix

Measured with local browser/CDP at `http://localhost:3001` after the code change:

| Viewport | Homepage left | Footer left | Left diff | Homepage width | Footer width | Width diff | Overflow | Payment logos | Newsletter overflow |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| 1366x768 | 64px | 64px | 0px | 1228px | 1228px | 0px | false | 4 | false |
| 1440x900 | 64px | 64px | 0px | 1302px | 1302px | 0px | false | 4 | false |
| 1520x900 | 64px | 64px | 0px | 1382px | 1382px | 0px | false | 4 | false |
| 1920x1080 | 96px | 96px | 0px | 1718px | 1718px | 0px | false | 4 | false |
| 2560x1440 | 96px | 96px | 0px | 2358px | 2358px | 0px | false | 4 | false |
| 3840x2160 | 96px | 96px | 0px | 3638px | 3638px | 0px | false | 4 | false |
| 768x1024 | 24px | 24px | 0px | 710px | 710px | 0px | false | 4 | false |
| 390x844 | 16px | 16px | 0px | 358px | 358px | 0px | false | 4 | false |

## Screenshot Folder

`audit-reports/384-footer-container-width-fix/screenshots/`

Captured files:

- `homepage-footer-1366x768.png`
- `homepage-footer-1440x900.png`
- `homepage-footer-1520x900.png`
- `homepage-footer-1920x1080.png`
- `homepage-footer-2560x1440.png`
- `homepage-footer-3840x2160.png`
- `homepage-footer-768x1024.png`
- `homepage-footer-390x844.png`

## Responsive QA Result

- No horizontal overflow was detected at the requested desktop, 2K, 4K, tablet, or mobile sizes.
- Footer no longer compresses into a narrow centered 1152px column on large screens.
- Footer does not become unstructured edge-to-edge because `.container-site` still provides responsive side padding.
- Payment logos remain visible in every measured viewport.
- Newsletter input/button stayed inside the footer container in every measured viewport.
- Tablet layout wraps into readable columns.
- Mobile layout remains compact with existing accordion-style link groups.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `tests/navbar-banner-footer-polish.test.ts`
- `audit-reports/384-footer-container-width-fix.md`
- `audit-reports/384-footer-container-width-fix/measurements-before.json`
- `audit-reports/384-footer-container-width-fix/measurements-after.json`
- `audit-reports/384-footer-container-width-fix/screenshots/*.png`

## Validation Results

- `npm run typecheck` - passed
- `npm run lint` - passed
- `npx tsx --test tests/navbar-banner-footer-polish.test.ts` - passed, 4 tests
- `npm run build` - passed
- `npm test` - passed, 722 tests

## Guardrail Confirmation

- Step 382 category media storage logic was not touched.
- Category upload/storage logic was not touched.
- Checkout/payment gateway logic was not touched.
- Payment logos were not removed or hidden.
- Payment logic was untouched.
- `public/assets/icons/ui/categories/*.svg` was left unstaged and untouched by this step.
- `public/uploads/admin/banners/hero/` was left unstaged and untouched by this step.
- No database migration was created.
- No fake content was added.

## Commit And Push

- Commit message: `fix: align footer with storefront container`
- Commit hash: pending exact-file commit; final hash is reported in the Codex final response because embedding a commit's own final hash in the committed report would change that hash.
- Push result: pending final `git push origin main`; final push result is reported in the Codex final response.
