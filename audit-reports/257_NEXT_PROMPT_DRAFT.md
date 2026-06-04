# Step 257 Next Prompt Draft

## Recommended Next Step

Run Step 257 as a focused local-only hydrated product-detail and authenticated-checkout visual QA preflight.

Why:

- Step 256 safely checked product detail with scripts disabled because hydrated product detail posts to product-view tracking.
- Step 256 polished the cart drawer visual layout.
- Full product-detail interactions and authenticated checkout shell still need coverage, but only with explicit local-only guardrails.

## Copy Paste Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 256 created `audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA_AND_POLISH.md`.
* Step 256 captured product/cart/checkout visual screenshots under `audit-reports/256-product-cart-checkout-screenshots/`.
* Step 256 made one visual-only cart drawer polish in `src/frontend/components/cart/CartDrawer.tsx`.
* Product detail hydrated browser QA was intentionally skipped because `ProductDetailClient.tsx` posts to `/api/products/[id]/view`, and that endpoint writes product-view tracking rows and may increment `Product.viewCount`.

Goal for Step 257:
Plan and run only safe preflight checks for hydrated product-detail and authenticated-checkout visual QA. Do not mutate product-view tracking or create orders unless an explicit local-only reset/cleanup strategy is verified first.

Read first:

* `audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA_AND_POLISH.md`
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

* `audit-reports/257_HYDRATED_PRODUCT_CHECKOUT_QA_PREFLIGHT.md`
* optional screenshots only under `audit-reports/257-hydrated-product-checkout-screenshots/`

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
3. Determine whether a safe local-only product-view reset/cleanup path exists without using destructive DB commands or migrations.
4. Determine whether authenticated checkout shell can be visually loaded with a safe local test account/session without submitting an order.
5. If either area is not safe, skip browser interaction and document the blocker.
6. If safe, capture a minimal screenshot set for hydrated product-detail interactions and authenticated checkout shell without order submission.
7. Create the audit report with:
   * scope
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

* `git diff --check -- audit-reports/257_HYDRATED_PRODUCT_CHECKOUT_QA_PREFLIGHT.md`
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

1. Summary of Step 257 work
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

This is a prompt draft only. Validation belongs to the Step 256 commit that created this file.
