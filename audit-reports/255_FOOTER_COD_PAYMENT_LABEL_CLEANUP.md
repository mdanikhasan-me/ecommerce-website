# Step 255 - Footer COD Payment Label Cleanup

## 1. Scope

This step made a focused footer correction after owner feedback that Cash on Delivery should not appear beside payment-card and mobile wallet brand logos in the footer's `We accept` row.

The work was limited to removing the COD display asset from the footer payment-logo list, documenting the change, and preparing the next prompt draft. No checkout, payment provider, newsletter API, route, backend, database, SEO, tracking, seller, or product lifecycle behavior changed.

## 2. Latest Commit Verification

Latest commit before edits:

```text
789ac03 fix: redesign footer responsive composition
```

This matched the expected starting point.

## 3. Files Inspected

- `src/frontend/components/layout/Footer.tsx`
- `src/shared/assets.ts`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/cod.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `package.json`

## 4. Files Changed

- `src/frontend/components/layout/Footer.tsx`
- `audit-reports/255_FOOTER_COD_PAYMENT_LABEL_CLEANUP.md`
- `audit-reports/256_NEXT_PROMPT_DRAFT.md`

`src/frontend/components/layout/NewsletterForm.tsx` was inspected through Step 253 context but was not changed in this batch.

## 5. Why COD Was Removed From `We Accept`

COD is a checkout/order option, not a payment-card, wallet, or network brand logo. Displaying COD beside bKash, Nagad, Visa, and Mastercard made the footer row read like mixed payment branding rather than a clean brand/logo row.

## 6. Final Payment-Logo List

The footer `We accept` row now displays only:

- bKash
- Nagad
- Visa
- Mastercard

The COD SVG asset remains in the repo and shared asset map for other appropriate contexts, but it is no longer rendered in this footer logo row.

## 7. COD Separate-Note Decision

No separate visible COD note was added. The footer is intentionally compact after Step 253, and adding a sentence such as `Cash on Delivery is shown at checkout where available.` would add clutter to the payment row. COD guidance should be handled in checkout or payment-method UI later if needed.

## 8. Desktop Footer Result

Desktop footer remains compact. Removing COD reduces the visual noise in the payment row while preserving the Step 253 max-width, no-service-strip composition.

## 9. Mobile Footer Result

Mobile footer remains compact. The payment row now shows four brand logos only, reducing width pressure and removing the mixed COD label from the brand row.

## 10. Payment/Checkout Backend Confirmation

Confirmed:

- No checkout/payment backend behavior changed.
- No payment provider was enabled.
- No payment gateway config changed.
- No checkout route or order behavior changed.
- No payment asset files changed.

## 11. Browser/Visual QA Result

Reduced production browser QA passed.

Runtime route/viewport check:

- Routes checked: `/`, `/deals`, `/api/admin/flash-sales`.
- Viewports checked: 390, 700, 768, 1366.
- Result: passed.
- No horizontal overflow.
- No browser runtime failures reported by the helper.
- `/deals` remained removed/404.
- `/api/admin/flash-sales` remained removed/404.

Footer DOM payment-row check:

- `paymentAlts`: `bKash`, `Nagad`, `Visa`, `Mastercard`.
- `hasCashOnDeliveryLogo`: `false`.
- `hasPaymentBrands`: `true`.
- `footerMentionsCod`: `false`.
- Checked at 390, 700, 768, and 1366 widths.

## 12. Validation Results

Final validation results:

- `git diff --check -- src/frontend/components/layout/Footer.tsx src/frontend/components/layout/NewsletterForm.tsx audit-reports/255_FOOTER_COD_PAYMENT_LABEL_CLEANUP.md audit-reports/256_NEXT_PROMPT_DRAFT.md`: passed; Git reported a line-ending warning for `Footer.tsx` only.
- `node scripts/boilabin-terminal-loop-state.mjs`: passed.
- `node scripts/boilabin-advisor-state.mjs`: passed.
- `npm run db:url:safety`: passed; no database connection attempted; `DATABASE_URL` local; `SHADOW_DATABASE_URL` local; shadow database separate; local migration ready yes.
- `node scripts/audit-ai-marketing-copy.mjs`: completed with exit code 0 and existing findings inventory; this step did not introduce new footer claims.
- `node scripts/audit-search-verification-readiness.mjs`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 373/373 tests.
- `npm run build`: passed.

## 13. Remaining Risks

- COD may still need factual placement in checkout/payment-method UI later.
- Owner may want another visual review pass for the footer row after seeing COD removed.

## 14. Recommended Next Step

Run Step 256: product detail, cart, and checkout visual QA planning and browser review without changing checkout/payment logic.
