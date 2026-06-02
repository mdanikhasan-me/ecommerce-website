# Step 31 Payment Logo Containment Fix Log

## Scope

Footer-only emergency visual fix for the payment-logo row. No database, Prisma, migrations, product lifecycle, security, SEO logic, seller marketplace, payment backend, checkout payment config, tracking, auth, product/category/search logic, or unrelated homepage sections were changed.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/31_STEP_31_PAYMENT_LOGO_CONTAINMENT_FIX_LOG.md`

Inspected but not edited in this step:

- `public/assets/payments/bkash.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/cod.svg`

Note: the direct payment SVG files were already modified in the working tree before this step.

## Current Payment Assets Found

`public/assets/payments/` contains:

- `bkash.svg` - SVG, 8021 bytes, root `width="1200" height="800" viewBox="-37.0635 -39.1825 321.217 235.095"`
- `nagad.svg` - SVG, 4619 bytes, root `width="1200" height="800" viewBox="-45 -32.75825 390 196.5495"`
- `visa.svg` - SVG, 1493 bytes, root `width="1200" height="800" viewBox="-74.7 -40.204 647.4 241.224"`
- `mastercard.svg` - SVG, 931 bytes, root `width="1200" height="800" viewBox="-96 -98.908 832 593.448"`
- `cod.svg` - SVG, 288 bytes, root `width="52" height="28" viewBox="0 0 52 28"`

## Asset Inspection Result

- bKash: transparent SVG, very large intrinsic canvas, dark text that is naturally low-contrast on the dark footer, excessive canvas/whitespace for a compact footer row.
- Nagad: transparent SVG, very large intrinsic canvas, visually usable but canvas is oversized for raw rendering.
- Visa: transparent SVG, very large intrinsic canvas, usable but needs bounded rendering to avoid uneven sizing.
- Mastercard: transparent SVG, very large intrinsic canvas, usable but needs bounded rendering to avoid uneven sizing.
- COD: present in the folder but intentionally excluded from the footer.

## Stale Footer Path Cleanup Result

Searched for the removed footer-specific payment subfolder path patterns. Final result: no matches outside this historical note after cleanup.

## Final Payment Asset Paths Used

- `/assets/payments/bkash.svg`
- `/assets/payments/nagad.svg`
- `/assets/payments/visa.svg`
- `/assets/payments/mastercard.svg`

## Direct-Folder Normalized Copies

No final normalized copy files were kept. A wrapper-copy approach was tested during this step, but Chrome rendered the nested SVG references blank inside the footer. Those temporary direct-folder wrapper files were removed before the final implementation.

## Payment Logo Slot Strategy

The footer now uses a local `FooterPaymentLogos` renderer with:

- fixed 32px-high slots
- CSS grid row with `repeat(4,max-content)`
- controlled gaps
- one non-focusable image per logo
- `object-cover object-center` inside each fixed slot
- no CSS transform scaling
- no logo boxes or heavy badges
- no reliance on raw intrinsic dimensions for layout

Final slot widths:

- bKash: `4.5rem` mobile, `5.25rem` larger screens
- Nagad: `4.5rem` mobile, `5.25rem` larger screens
- Visa: `3.65rem` mobile, `4.2rem` larger screens
- Mastercard: `3.1rem` mobile, `3.6rem` larger screens

This makes the row predictable and prevents overlap/stretch while keeping the current direct payment assets.

## COD Exclusion Confirmation

- Footer does not reference `cod.svg`.
- Browser/CDP confirmed no footer image source or alt text contains COD/Cash.

## Payment Status Text Confirmation

Footer source and browser text checks found no public payment-readiness text such as:

- planned
- coming soon
- awaiting approval
- approved
- payment gateway not ready
- COD-only text

## Contact Link Confirmation

Bottom legal row still includes:

- Privacy
- Terms
- Contact

## Browser/CDP Verification Results

Environment:

- Production app served with `npm run start -- -p 3100`
- Headless Chrome via Chrome DevTools Protocol
- Route checked: `/privacy`

| Viewport | Footer height | Payment row width | Logos loaded | Logos visible | Overlap pairs | Direct assets | Overflow | Contact | COD/status text |
|---|---:|---:|---|---|---:|---|---|---|---|
| 390px mobile | 360px | 270px | Yes | Yes | 0 | Yes | No | Yes | No |
| 430px mobile | 360px | 270px | Yes | Yes | 0 | Yes | No | Yes | No |
| 768px tablet | 331px | 317px | Yes | Yes | 0 | Yes | No | Yes | No |
| 1024px tablet/laptop | 291px | 317px | Yes | Yes | 0 | Yes | No | Yes | No |
| 1366px desktop | 265px | 317px | Yes | Yes | 0 | Yes | No | Yes | No |

Screenshot notes:

- Final 390px mobile screenshot was captured and inspected.
- Final 1366px desktop screenshot was captured and inspected.
- bKash remains darker than the others because the current source asset contains dark official text, but it is contained, visible, and no longer overlaps or explodes out of the row.

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

## Production Build Result

Passed after the final footer payment-logo containment changes.

## Whether Visuals Changed

Yes. Footer-only payment-logo visuals changed.

## Remaining Risks

- The current bKash SVG is inherently dark against the footer. The footer now improves it with bounded sizing and a subtle light drop-shadow, but a better official light/monochrome bKash asset would improve readability further.
- The direct payment assets still use large 1200x800 intrinsic canvases, so the footer uses fixed slots and `object-cover` to contain/crop the visible artwork safely.
- Human review on a real mobile device is still recommended because brand-logo optical balance is subjective.
