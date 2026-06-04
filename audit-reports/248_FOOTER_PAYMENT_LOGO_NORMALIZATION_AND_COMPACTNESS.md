# Step 248 - Footer Payment Logo Normalization And Compactness

## Scope

Step 248 focused only on footer payment-logo display and compactness after the reference-aligned footer update. The goal was to show existing public payment SVG assets as footer trust indicators without enabling checkout gateways or changing any payment backend behavior.

## Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/248_FOOTER_PAYMENT_LOGO_NORMALIZATION_AND_COMPACTNESS.md`
- `audit-reports/249_NEXT_PROMPT_DRAFT.md`

`src/frontend/components/layout/NewsletterForm.tsx` was inspected but not changed.

## Payment Asset Inspection

Existing public payment SVG assets:

| Asset | SVG metadata | Used in footer |
| --- | --- | --- |
| `public/assets/payments/cod.svg` | `width="52" height="28" viewBox="0 0 52 28"` | Yes |
| `public/assets/payments/bkash.svg` | `width="124" height="114" viewBox="0 0 124 114"` | Yes |
| `public/assets/payments/nagad.svg` | `width="89" height="116" viewBox="0 0 89 116"` | Yes |
| `public/assets/payments/visa.svg` | `viewBox="0 0 1000 324.68"` | Yes |
| `public/assets/payments/mastercard.svg` | `width="1000" height="618" viewBox="0 0 1000 618"` | Yes |

`src/shared/assets.ts` also defines a Stripe asset path, but `public/assets/payments/stripe.svg` is not present, so Stripe was not displayed.

## Issue Found

The footer previously used `PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable)` from backend payment configuration. Because online payment flags are disabled by default, the footer only displayed Cash on Delivery.

That was technically aligned with checkout availability, but it did not meet the visual footer reference goal of showing existing payment/trust logos as public footer indicators.

## Fix Made

- Replaced footer payment-logo sourcing with a footer-local display list built from `PAYMENT_ASSETS`.
- Added a source comment: `Footer display only; does not enable checkout gateways.`
- Displayed only existing public SVG files: COD, bKash, Nagad, Visa, and Mastercard.
- Removed boxed logo tiles, borders, shadows, and dark backgrounds around payment logos.
- Normalized payment logo heights and max widths per asset shape.
- Removed the footer text that said displayed methods follow checkout availability.
- Updated the service-strip payment copy so it points users to checkout for actual availability instead of implying the logo row enables payment methods.

## Compactness Changes

- Hid the service strip on mobile and reduced desktop service-strip height.
- Reduced footer vertical padding across the main content, payment/newsletter row, and legal bar.
- Reduced footer grid gaps, social icon sizes, logo size, mobile accordion chrome, and newsletter spacing.
- Kept mobile footer accordions closed by default.
- Kept the inline mobile newsletter submit button from the prior footer reference alignment.

## Behavior Preserved

- No checkout payment gateways were enabled.
- No payment backend config, checkout flow, webhook, order, API, tracking, seller, database, Prisma, or deployment behavior changed.
- No route behavior changed.
- No new payment claims were added.
- No unavailable or missing payment-logo asset was referenced.

## Browser QA Result

- Reduced production browser runtime check passed with `next start` on `http://127.0.0.1:3132`.
- Checked `/`, `/category`, `/category/electronics`, `/search?q=phone`, `/cart`, `/track-order`, `/deals`, and `/api/admin/flash-sales`.
- Checked viewports: `mobile-390`, `mobile-430`, `tablet-768`, and `desktop-1366`.
- Result: 32/32 page and viewport checks passed.
- Result: 7/7 accessibility sanity checks passed.
- No horizontal overflow, broken visible images, console errors, server errors, failed requests, or image failures were reported.
- Removed Flash routes remained removed/noindex in the browser runtime check.
- Built output includes all selected footer payment asset paths: COD, bKash, Nagad, Visa, and Mastercard.

## Validation Results

Commands run:

| Command | Result |
| --- | --- |
| `git diff --check -- src/frontend/components/layout/Footer.tsx src/frontend/components/layout/NewsletterForm.tsx audit-reports/248_FOOTER_PAYMENT_LOGO_NORMALIZATION_AND_COMPACTNESS.md audit-reports/249_NEXT_PROMPT_DRAFT.md` | Passed |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed |
| `node scripts/boilabin-advisor-state.mjs` | Passed after adding the required `## Recommended Next Step` section to Step 249 |
| `npm run db:url:safety` | Passed; no database connection attempted; app and shadow DB URL shapes classified local and separate |
| `node scripts/audit-ai-marketing-copy.mjs` | Reported the known 52 existing findings in README/docs/seed/source areas; no footer-specific new finding was introduced |
| `node scripts/audit-search-verification-readiness.mjs` | Passed |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | Passed after Step 249 metadata fix: 373/373 |
| `npm run build` | Passed |
| Reduced production browser runtime check | Passed |

Notes:

- The first `npm test` run failed because the newly created Step 249 prompt draft did not have a parser-detectable `## Recommended Next Step` section. The report-only metadata was fixed, then `node scripts/boilabin-advisor-state.mjs` and `npm test` both passed.
- The content-quality audit continues to report the same known 52 findings outside the footer change scope. This step did not add footer hype copy.

## Commands Intentionally Not Run

- No Prisma migration commands.
- No `prisma db push`.
- No seed/reset commands.
- No SQL commands.
- No Docker commands.
- No deployment/provider commands.
- No package install/update commands.
- No checkout/payment provider configuration commands.

## Prohibited Areas Confirmation

No backend payment integration, tracking, seller marketplace, Prisma schema, migrations, SEO media/category behavior, Flash Deals, checkout behavior, or private environment files were touched.

## Remaining Risks

- The footer displays payment logos as public trust indicators only; checkout availability still depends on existing payment configuration.
- bKash and Nagad are tall mark-shaped SVGs, so their visual footprint differs naturally from wide card-network logos.
- Human visual approval is still recommended because this is a presentation change.

## Recommended Next Step

Run a focused human footer visual acceptance checkpoint on desktop, tablet, and mobile. If accepted, proceed to a docs-only audit-trail cleanup or the next non-footer technical task.
