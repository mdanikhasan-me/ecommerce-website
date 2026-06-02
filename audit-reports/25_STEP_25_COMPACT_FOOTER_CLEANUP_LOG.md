# Step 25 Compact Footer Cleanup Log

Date: 2026-06-02

## Summary

Rebuilt the storefront footer into a compact, controlled footer-only layout. The standalone homepage newsletter block was removed and the existing newsletter behavior was moved into the footer. The footer no longer renders the COD logo and no payment or checkout logic was changed.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/frontend/components/home/PromoSection.tsx`
- `src/app/(store)/page.tsx`
- `audit-reports/25_STEP_25_COMPACT_FOOTER_CLEANUP_LOG.md`

Note: `src/app/(store)/page.tsx` already contained prior Step 13/visibility changes in the working tree. Step 25 only removed the `NewsletterSection` import and render from that file.

## Old Footer Problems Found

- Social links were placed under the brand/contact block instead of being cleanly grouped on the right side.
- Payment icons were isolated in a bottom strip, making the footer feel split and less intentional.
- Footer payment rendering used `PAYMENT_GATEWAYS`, which currently exposes the COD logo because COD is the only active payment method.
- A separate large newsletter section still rendered on the homepage, adding vertical height below the main content before the footer.
- The footer lacked a compact right-side sequence for newsletter, socials, and payment methods.

## Duplicated or Obsolete Footer Code Removed

- Removed the standalone `NewsletterSection` export from `src/frontend/components/home/PromoSection.tsx`.
- Removed the standalone newsletter render from `src/app/(store)/page.tsx`.
- Removed footer dependency on `PAYMENT_GATEWAYS`.
- Removed footer-specific COD logo display path.
- Removed footer-specific payment class entry for `Cash on Delivery`.

## Newsletter Moved

From:

- Standalone homepage section: `NewsletterSection` in `src/frontend/components/home/PromoSection.tsx`
- Rendered near the end of `src/app/(store)/page.tsx`

To:

- Compact footer newsletter card inside `src/frontend/components/layout/Footer.tsx`
- Existing newsletter API behavior is preserved through `NewsletterForm`
- Newsletter submissions now use `source: "footer"`

No new backend newsletter system was added.

## Final Footer Layout Summary

Left side:

- Boilabin mark and brand name
- Short brand text
- Email, phone, and address

Right side:

- Compact newsletter signup
- Social links
- Planned online payment icons

Bottom strip:

- Copyright
- Privacy, Terms, and Contact links

The footer keeps the existing dark brand direction while reducing vertical padding and large empty space.

## COD and Payment Asset Cleanup Summary

- COD logo usage was removed from the footer UI.
- Footer no longer imports or renders `PAYMENT_GATEWAYS`.
- Footer uses existing non-COD assets: bKash, Nagad, Visa, and Mastercard.
- Payment copy is modest and states that online payments are planned and checkout remains COD until gateways are approved.
- No payment gateway logic was enabled.
- No asset files were deleted.

## Whether COD Logo Usage Was Removed

Yes, from the footer UI.

The global `public/assets/payments/cod.svg` asset was not deleted because it is still referenced by shared payment configuration and checkout-related flows.

## Responsive Behavior Notes

- Desktop uses a two-column layout: brand/contact left, newsletter/social/payment right.
- Mobile stacks cleanly with the newsletter first on the right-side content block, then socials, then payment icons.
- Payment icons use fixed compact badge heights to avoid oversized logos.
- Contact/email text uses `min-w-0` and truncation where needed to reduce overflow risk.

## Accessibility Notes

- Footer uses semantic `<footer>`.
- Footer has a screen-reader heading.
- Contact details are grouped in an `<address>`.
- Social links are in a labeled `<nav>` and each icon-only link has an `aria-label`.
- Newsletter input has an accessible `aria-label`.
- Newsletter submit button remains keyboard accessible with visible focus styles.
- Payment icons use empty `alt` plus `aria-hidden`, with the wrapper carrying an accessible planned-payment label.
- Footer legal links are in a labeled `<nav>`.

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

## Visual Verification

Source-level and build-level checks were completed for:

- Newsletter inside footer
- Social links after newsletter
- Payment area after socials
- No footer COD logo render path
- Compact footer padding/classes
- Responsive stacking classes

Automated browser screenshot verification was not performed because no browser automation/screenshot tool was available in this environment.

## Whether Visuals Changed

Yes.

This was an intentional footer-only visual cleanup.

## Remaining Risks

- Final pixel-level desktop/tablet/mobile visual review should still be done in a browser.
- Payment icons are shown as planned online options, not active checkout methods; copy should be revisited when real payment gateways are implemented.
- COD asset remains in the project because checkout/payment configuration still needs it.
