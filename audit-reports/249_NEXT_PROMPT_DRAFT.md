# Step 249 - Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 248: `audit-reports/248_FOOTER_PAYMENT_LOGO_NORMALIZATION_AND_COMPACTNESS.md`
* Step 248 normalized footer payment logo display using existing public SVG assets only.
* The footer payment logos are display-only trust indicators and do not enable checkout gateways.
* No checkout/payment backend, tracking, seller, Prisma, migration, DB, deployment, or package behavior changed.

Goal for Step 250:
Perform a focused human/browser footer visual acceptance checkpoint after the payment-logo normalization and compactness pass.

This should be audit/verification only unless a tiny footer-only fix is clearly required.

Read first:

* `audit-reports/248_FOOTER_PAYMENT_LOGO_NORMALIZATION_AND_COMPACTNESS.md`
* `src/frontend/components/layout/Footer.tsx`
* `src/frontend/components/layout/NewsletterForm.tsx`
* `public/assets/payments/cod.svg`
* `public/assets/payments/bkash.svg`
* `public/assets/payments/nagad.svg`
* `public/assets/payments/visa.svg`
* `public/assets/payments/mastercard.svg`

Check:

* footer on desktop, tablet, and mobile
* service strip compactness
* mobile accordion spacing
* newsletter input and submit button alignment
* payment logo row includes COD, bKash, Nagad, Visa, and Mastercard
* payment logos have no boxes, dark backgrounds, shadows, or tile wrappers
* payment logo row remains display-only and does not imply payment enablement
* no footer overflow or cramped text
* no broken visible images
* no console errors

Strict guardrails:

* Do not change checkout/payment backend behavior.
* Do not enable payment providers.
* Do not touch tracking, seller marketplace, product lifecycle, Prisma schema, migrations, DB setup, or deployment config.
* Do not run migrations, db push, seed, reset, SQL, Docker, or provider CLI commands.
* Do not print secrets or full DB URLs.
* Do not modify non-footer UI unless explicitly approved.
* Do not stage or commit broad file sets.

Validation:

* `npm run db:url:safety`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Create:

* `audit-reports/250_FOOTER_VISUAL_ACCEPTANCE_CHECKPOINT.md`

The report must include:

1. scope
2. files changed, if any
3. browser/human QA result
4. payment logo display result
5. mobile/tablet/desktop compactness result
6. validation results
7. confirmation no payment/backend/DB/deployment behavior changed
8. remaining risks
9. recommended next step

Final response format:

1. Summary of Step 250 work
2. Files changed, if any
3. Footer visual acceptance result
4. Payment-logo display result
5. Validation results
6. Confirmation no prohibited files/actions occurred
7. Remaining risks
8. Recommended next step
```

## Recommended Next Step

Run Step 250 as a focused footer visual acceptance checkpoint before making any further footer or payment-logo presentation changes.
