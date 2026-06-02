# Step 28 Root Footer Rebuild Log

Date: 2026-06-02

## Summary

Rebuilt the footer from the root into one compact, intentional structure. Payment logos remain visible, COD is excluded from the footer, payment-status text is absent, the vertical divider is gone, and the bottom Contact link is restored.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/28_STEP_28_ROOT_FOOTER_REBUILD_LOG.md`

Inspected but not changed in this step:

- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/shared/assets.ts`
- `src/backend/config/payment.ts`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `public/assets/payments/mastercard.svg`

No database, Prisma, migration, product lifecycle, security, SEO, checkout/payment backend, auth, seller, tracking, product, category, or search files were changed.

## Footer Root Problems Found

- Footer structure had become incremental and patch-like across Steps 25, 26, and 27.
- Newsletter/social/payment layout was handled as a right column with awkward stacking at some viewport widths.
- Contact link was missing from the bottom row.
- Payment logo sizing was handled through ad hoc per-logo classes without a clear root structure.
- The layout had no single clear top/utility/bottom row model.

## Old Footer Code Removed

- Replaced the patched two-column footer body with a clear top row, utility row, and bottom row.
- Removed the Step 26-style vertical divider permanently.
- Removed the old split right-column social/payment layout.
- Replaced the previous payment logo constants with a footer-specific `FOOTER_PAYMENT_LOGOS` list.
- Kept payment logos visible and excluded COD.

## New Footer Layout Summary

Top row:

- Brand/logo
- Short brand line
- Email, phone, address
- Compact newsletter signup

Utility row:

- Social icons
- Payment logos

Bottom row:

- Copyright
- Privacy
- Terms
- Contact

## Mobile Layout Improvements

- Mobile order is compact and natural: brand, brand line, contact, newsletter, socials/payment logos, legal.
- Reduced nested spacing and removed the old divider/card feel.
- Socials and payment logos can wrap into tight rows without heavy boxes.
- Contact rows use `flex-wrap`, `min-w-0`, and truncation to reduce overflow risk.

## Payment Logos Restored Confirmation

Confirmed.

The footer displays visible payment logos.

## Payment Logos Included

- bKash
- Nagad
- Visa
- Mastercard

COD is excluded. Stripe is not included because `public/assets/payments/stripe.svg` is not present in the project.

## Payment SVG/Assets Inspected

Inspected:

- `public/assets/payments/bkash.svg`
  - `width="124" height="114" viewBox="0 0 124 114"`
  - Square-ish mark asset.
- `public/assets/payments/nagad.svg`
  - `width="89" height="116" viewBox="0 0 89 116"`
  - Tall asset with more complex internal paths.
- `public/assets/payments/visa.svg`
  - `viewBox="0 0 1000 324.68"`
  - Wide wordmark.
- `public/assets/payments/mastercard.svg`
  - `width="1000" height="618" viewBox="0 0 1000 618"`
  - Wide mark.

## SVG Files Edited or Copied

None.

The source SVGs are shared assets and may be used elsewhere. I did not edit official paths, colors, viewBoxes, or create copies. Footer-specific rendering normalizes their visual footprint without changing the assets.

## Payment Logo Size Normalization

Normalization is handled in `Footer.tsx` through footer-specific visual classes:

- bKash: `h-6 w-12`
- Nagad: `h-6 w-12`
- Visa: `h-4 w-12`
- Mastercard: `h-5 w-10`

All logos render with `object-contain`, transparent backgrounds, no boxes, no badges, and no visible payment-status text.

## COD Footer Exclusion Confirmation

Confirmed.

- Footer does not reference `PAYMENT_ASSETS.CASH_ON_DELIVERY`.
- Footer does not reference `CASH_ON_DELIVERY`.
- Footer does not reference `cod.svg`.
- Footer does not render Cash on Delivery.
- The shared COD asset was not deleted because checkout/payment config still uses it outside the footer.

## Payment-Status Text Removal Confirmation

Confirmed.

Footer does not include:

- `planned`
- `coming soon`
- `awaiting approval`
- `approved`
- `COD until gateways approved`
- Internal payment-readiness explanations

## Contact Link Restoration Confirmation

Confirmed.

The bottom legal row now includes:

- Privacy
- Terms
- Contact

## Newsletter Compactness Changes

- Kept newsletter inside the footer.
- Retained the compact `NewsletterForm` behavior.
- Removed divider/card framing around newsletter placement.
- Desktop uses inline form behavior when width allows.
- Mobile can stack input/button while keeping the section compact.
- No backend newsletter behavior changed.

## Accessibility Notes

- Semantic `<footer>` retained.
- Screen-reader footer heading retained.
- Logical DOM order follows visual order.
- Contact details remain in an `<address>`.
- Social icon links retain `aria-label`s.
- Newsletter input retains an accessible `aria-label`.
- Payment logo group uses `role="img"` with `aria-label="Payment methods"`.
- Individual payment logo images are decorative with empty `alt` and `aria-hidden`.
- Legal links are keyboard accessible.

## Validation Commands Run

| Command | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; no ESLint warnings or errors. Next.js lint deprecation notice only. |
| `npm test` | Passed; 27 suites, 119 tests. |
| `npm run build` | Passed; production build completed successfully. |

## Production Build Result

Passed.

`next build` compiled successfully, generated static pages successfully, and completed route optimization.

## Browser/Pixel Verification Result

Not performed.

Playwright and Cypress binaries were not present in `node_modules/.bin`, and no packages were installed. Verification was source-level plus typecheck/lint/test/build.

## Whether Visuals Changed

Yes.

This was an intentional footer-only visual correction.

## Remaining Risks

- Final desktop/tablet/mobile pixel review should still be done in a real browser.
- bKash and Nagad have different intrinsic SVG proportions than Visa/Mastercard, so a final browser review may still suggest small class-level sizing tweaks.
- Payment logos are frontend design marks only; checkout/payment backend availability remains unchanged.
