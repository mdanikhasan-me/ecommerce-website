# Step 30 Footer Visual Asset Path Fix Log

## Scope

Footer-only visual correction and payment asset path cleanup. No database, Prisma, migrations, product lifecycle, security, SEO logic, seller marketplace, payment backend, checkout payment config, tracking, auth, product/category/search logic, or unrelated homepage sections were changed.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `audit-reports/29_STEP_29_FINAL_FOOTER_REBUILD_LOG.md`
- `audit-reports/30_STEP_30_FOOTER_VISUAL_ASSET_PATH_FIX_LOG.md`

Note: direct payment SVG assets in `public/assets/payments/` were inspected and used, but not edited by this step. They were already modified in the working tree before this step.

## Current Payment Assets Found

`public/assets/payments/` currently contains:

- `bkash.svg` - 8021 bytes
- `cod.svg` - 288 bytes
- `mastercard.svg` - 931 bytes
- `nagad.svg` - 4619 bytes
- `visa.svg` - 1493 bytes

No removed footer-specific payment asset folder exists.

## Stale Footer Asset References Found And Fixed

Found stale footer-specific payment asset references in:

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/29_STEP_29_FINAL_FOOTER_REBUILD_LOG.md`

Fixes:

- `Footer.tsx` now uses direct current payment assets from `public/assets/payments/`.
- The Step 29 report was marked as superseded and no longer contains stale removed-folder paths.
- A final repository search for the old footer-specific payment subfolder references returned no matches.

## Final Payment Asset Paths Used By Footer

- `/assets/payments/bkash.svg`
- `/assets/payments/nagad.svg`
- `/assets/payments/visa.svg`
- `/assets/payments/mastercard.svg`

COD is intentionally excluded from the footer allowlist.

## Final Footer Layout Summary

- Desktop: left side holds brand, tagline, contact info, and social icons; right side holds compact newsletter and payment logos; bottom row holds copyright and legal links.
- Mobile/tablet: brand, tagline, contact, newsletter, and a compact utility row with socials plus payment logos; bottom legal row remains compact.
- Footer remains semantic with `<footer>`, labeled social nav, accessible newsletter input, labeled payment group, and keyboard-accessible links.

## Logo And Brand Treatment Changes

- Brand mark is stronger again with a larger circular treatment.
- Footer uses the light mark variant on the dark background.
- Brand wordmark text is larger and more prominent than Step 29.

## Newsletter Visual Changes

- Newsletter remains inside the footer.
- Form behavior and `/api/newsletter` POST flow are unchanged.
- Input and button use compact but more polished 36px controls.
- Form stayed inline in browser checks at all tested widths.

## Social And Payment Layout Changes

- Social links now live with the brand/contact block on desktop.
- Payment logos live under the newsletter on desktop.
- Mobile/tablet use a compact utility row with socials on the left and payment logos on the right.
- Payment logos use fixed clipped slots, direct SVG paths, optical zoom, `object-contain`, and a subtle light drop-shadow to offset dark logo text on the dark footer.
- No boxes or badges were added behind logos.

## Mobile Visual Changes

- 390px and 430px widths render a compact footer at 360px height.
- Newsletter stays inline.
- Social/payment row stays in one band.
- No horizontal overflow.
- Final 390px screenshot was captured and inspected.

## Tablet Visual Changes

- 768px tablet footer height: 331px.
- 1024px tablet footer height: 291px.
- Payment logos remain direct, loaded, visible, and grouped.
- No horizontal overflow.

## Desktop Visual Changes

- 1366px desktop footer height: 265px.
- Brand/contact/socials sit on the left.
- Newsletter/payment logos sit on the right.
- Final 1366px screenshot was captured and inspected.
- No horizontal overflow.

## Payment Logo Visibility Confirmation

Browser/CDP confirmed all four footer payment logos load and are visible at:

- 390px mobile
- 430px mobile
- 768px tablet
- 1024px tablet
- 1366px desktop

## Direct Payment Asset Confirmation

Browser/CDP confirmed all visible footer payment images use direct paths from `/assets/payments/` for bKash, Nagad, Visa, and Mastercard.

## COD And Payment Status Text Confirmation

- Footer does not render `cod.svg`.
- Footer does not render Cash on Delivery/COD logo text.
- Footer does not contain public payment readiness text such as planned, coming soon, awaiting approval, approved, or payment gateway not ready.
- Targeted source search against footer files returned no forbidden payment/COD/status text matches.

## Contact Confirmation

Bottom legal row includes:

- Privacy
- Terms
- Contact

## Browser/CDP Verification Notes

Environment:

- Production app served locally with `npm run start -- -p 3100`
- Headless Chrome via Chrome DevTools Protocol
- Static route checked: `/privacy`

| Viewport | Footer height | Overflow | Direct assets | Logos loaded | Logos visible | Newsletter inline | Contact present | COD/status text | Divider |
|---|---:|---|---|---|---|---|---|---|---|
| 390px mobile | 360px | No | Yes | Yes | Yes | Yes | Yes | No | No |
| 430px mobile | 360px | No | Yes | Yes | Yes | Yes | Yes | No | No |
| 768px tablet | 331px | No | Yes | Yes | Yes | Yes | Yes | No | No |
| 1024px tablet | 291px | No | Yes | Yes | Yes | Yes | Yes | No | No |
| 1366px desktop | 265px | No | Yes | Yes | Yes | Yes | Yes | No | No |

Screenshot notes:

- Final 390px mobile screenshot captured and inspected.
- Final 1366px desktop screenshot captured and inspected.
- A multi-viewport screenshot loop was flaky in CDP, so final cross-viewport verification used one-target-per-viewport DOM checks plus single mobile/desktop screenshots.

## Validation Commands Run

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm test`

## Validation Results

- `npm run build`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed. Existing Next.js `next lint` deprecation notice only.
- `npm test`: passed, 119 tests passing, 0 failing.

## Whether Visuals Changed

Yes. Footer-only visuals changed.

## Remaining Risks

- The direct payment SVGs have very large intrinsic canvases (`1200x800`), so the footer uses clipped/zoomed slots for optical balance. This should be manually reviewed once more on a real device.
- bKash includes dark official text, which is naturally lower contrast on a dark footer. A subtle drop-shadow improves readability without adding logo boxes.
- Direct payment assets were already modified in the worktree before this step; this step did not edit their SVG paths/colors.
