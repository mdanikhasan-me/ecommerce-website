# Step 259 Next Prompt Draft

## Recommended Next Step

Run Step 259 as a focused local-only hydrated product-detail and authenticated checkout visual QA preflight.

Why:

- Step 258 completed the footer YouTube/social/payment icon correction.
- Step 256 safely checked product detail only with scripts disabled because hydrated product detail posts product-view tracking.
- Full product-detail interactions and authenticated checkout shell still need coverage with explicit no-order/no-payment guardrails.

## Copy Paste Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed state:

* Step 258 added the footer YouTube social link and tuned footer social/payment icon scale.
* Latest expected commit should be `fix: add footer youtube link and tune icon scale`.
* Footer social row now includes Facebook, Instagram, and YouTube.
* Footer YouTube URL should be `https://www.youtube.com/@Boilabin`.
* Footer payment row should still show bKash, Nagad, Visa, and Mastercard only.
* COD must not return to the footer `We accept` row.

Goal for Step 259:
Plan and run safe preflight checks for hydrated product-detail and authenticated checkout visual QA without mutating product-view tracking or creating orders unless an explicit local-only reset/cleanup strategy is verified first.

Read first:

* `audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA_AND_POLISH.md`
* `audit-reports/258_FOOTER_SOCIAL_YOUTUBE_AND_ICON_SCALE.md`
* `src/frontend/components/product/ProductDetailClient.tsx`
* `src/app/api/products/[id]/view/route.ts`
* `src/backend/commerce-stats.ts`
* `src/app/(store)/checkout/page.tsx`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* `src/frontend/components/cart/CartDrawer.tsx`
* `scripts/local-browser-runtime-check.mjs`
* `scripts/local-runtime-smoke.mjs`
* `scripts/reset-commerce-signals.mjs`

Allowed deliverables:

* `audit-reports/259_HYDRATED_PRODUCT_CHECKOUT_QA_PREFLIGHT.md`
* optional screenshots only under `audit-reports/259-hydrated-product-checkout-screenshots/`

Do not edit source files in this step unless a tiny visual-only issue is proven and I explicitly approve continuing beyond preflight.

Strict guardrails:

* Do not change product-view tracking behavior.
* Do not disable product-view tracking in production.
* Do not create orders.
* Do not submit checkout.
* Do not call payment providers.
* Do not change payment behavior or gateway config.
* Do not change cart state logic, price logic, stock logic, product visibility, API shapes, auth behavior, SEO, Prisma schema, migrations, seed/reset behavior, or admin behavior.
* Do not run migrations, db push, seed/reset, destructive SQL, Docker setup, provider CLI, package updates, or deployment.
* Do not read private env files or print secrets/full DB URLs/tokens/cookies/credentials/auth headers/private connection strings/customer/order PII.
* Do not touch footer, newsletter, payment-logo assets, category media assets, Flash Deals, seller marketplace, tracking provider integration, or mobile app implementation.

Tasks:

1. Verify current git status and latest commit.
2. Reconfirm product-view mutation risk from code.
3. Determine whether a safe local-only product-view reset/cleanup path exists without destructive DB commands or migrations.
4. Determine whether authenticated checkout shell can be visually loaded with a safe local test account/session without submitting an order.
5. If either area is not safe, skip browser interaction and document the blocker.
6. If safe, capture a minimal screenshot set for hydrated product-detail interactions and authenticated checkout shell without order submission.
7. Create the audit report with:
   * scope
   * latest commit verification
   * working tree status
   * product-view mutation decision
   * checkout-auth fixture decision
   * routes safely tested
   * routes skipped and why
   * screenshots captured or skipped
   * validation results
   * confirmation no prohibited behavior changed
   * remaining risks
   * recommended next step

Validation:

* `git diff --check -- audit-reports/259_HYDRATED_PRODUCT_CHECKOUT_QA_PREFLIGHT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

If report-only, stage exact report/screenshot files and commit:

`docs: audit hydrated product checkout qa preflight`

Final response format:

1. Summary of Step 259 work
2. Files changed/staged/committed
3. Product-view tracking decision
4. Checkout authenticated-shell decision
5. Browser/screenshot result
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```

## Validation Results

This is a prompt draft only. Validation belongs to the Step 258 commit that created this file.
