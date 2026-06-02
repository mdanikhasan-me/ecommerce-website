# Step 27 Footer Payment Logo Recovery Log

Date: 2026-06-02

## Summary

Recovered the footer payment logo row that Step 26 hid, while keeping the footer compact and removing public payment-readiness wording. The footer now shows bKash, Nagad, Visa, and Mastercard as transparent sticker-style marks, with no COD logo and no payment status explanation text.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/27_STEP_27_FOOTER_PAYMENT_LOGO_RECOVERY_LOG.md`

Inspected but not changed:

- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/shared/assets.ts`
- `src/backend/config/payment.ts`

## What Step 26 Broke

- Hid all payment logos from the footer.
- Removed a visual trust/design element the final frontend should show.
- Left the newsletter beside an awkward vertical divider.
- Made the footer feel sparse on desktop while still not fully resolving mobile balance.

## Payment Logos Restored Confirmation

Confirmed.

The footer now renders a visible payment logo row using existing project assets.

## Payment Logos Included

- bKash
- Nagad
- Visa
- Mastercard

Stripe was not used because `public/assets/payments/stripe.svg` is not present in the project. COD was intentionally excluded.

## COD Footer Exclusion Confirmation

Confirmed.

- Footer does not reference `CASH_ON_DELIVERY`.
- Footer does not reference `cod.svg`.
- Footer does not render `Cash on Delivery`.
- The shared COD asset was not deleted because checkout/payment config still uses it outside the footer.

## Payment Status Text Removal Confirmation

Confirmed.

Footer does not include:

- `Online payments planned`
- `coming soon`
- `awaiting approval`
- `approved`
- `Checkout remains COD until gateways are approved`
- Any public explanation of internal payment setup status

Payment logos are shown as frontend visual marks only.

## Vertical Divider Removal Confirmation

Confirmed.

The Step 26 `border-l` newsletter divider was removed.

## Newsletter Compactness Changes

- Kept newsletter inside the footer.
- Kept the compact input/button behavior.
- Removed the divider/card framing around the newsletter area.
- Kept the existing newsletter API submission behavior through `NewsletterForm`.
- Did not add backend newsletter logic.

## Mobile Footer Improvements

- Mobile order remains natural: brand, contact, newsletter, socials, payment logos, legal.
- Removed the vertical divider that felt awkward on narrow screens.
- Payment logos wrap naturally instead of using boxed badges.
- Right-side footer content uses tighter gaps and no heavy panel.

## Spacing and Layout Changes

- Restored a balanced right-side content area with newsletter, socials, and payment logos.
- Increased the right column slightly to fit the compact logo row cleanly.
- Payment logos use transparent inline wrappers, not visible boxes or badges.
- Logo sizing is normalized with fixed visual dimensions and `object-contain`.
- Kept bottom strip compact with Privacy and Terms only.

## Accessibility Notes

- Semantic `<footer>` retained.
- Screen-reader footer heading retained.
- Contact details remain in an `<address>`.
- Social links remain icon-only with `aria-label`s.
- Newsletter input keeps an accessible `aria-label`.
- Focus styles remain visible on newsletter controls and social links.
- Payment logo group uses `role="img"` with `aria-label="Payment methods"`.
- Individual payment logo images are decorative with empty `alt` and `aria-hidden`.
- Legal links remain keyboard accessible.

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

## Browser/Pixels Check

Not performed.

No local browser automation tool such as Playwright or Cypress is installed, and no packages were installed. Verification was source-level plus typecheck/lint/test/build.

## Whether Visuals Changed

Yes.

This was an intentional footer-only visual recovery.

## Remaining Risks

- Final desktop/mobile pixel review should still be done in a real browser.
- The bKash and Nagad source SVGs have different intrinsic proportions, so visual balance may still need tiny class tuning after browser review.
- Payment logos are frontend design marks only; checkout/payment backend availability remains unchanged.
