# Step 265 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 264: `audit-reports/264_PRODUCT_DETAIL_SCREENSHOT_DESIGN_CORRECTION.md`
* Product-detail responsive visual density was corrected.
* Product-view tracking was protected during browser QA with CDP request interception and a local proxy sentinel.
* Final product-view guardrail result: product-view POST attempts were fulfilled by CDP, 0 continued to server, 0 seen by proxy, 0 forwarded to Next.
* Validation passed: db safety, Prisma local validate/generate, typecheck, lint, tests, and build.

Goal for Step 265:
Run a cart and checkout-shell visual density audit and safe visual correction batch.

This is a visual/frontend task only. Do not submit orders. Do not create carts through API calls. Do not make payment calls. Do not change checkout/order/payment/auth behavior.

Read first:

* `audit-reports/264_PRODUCT_DETAIL_SCREENSHOT_DESIGN_CORRECTION.md`
* `src/app/(store)/cart/page.tsx`
* `src/app/(store)/checkout/page.tsx`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* cart UI/components/store files if present
* existing checkout/cart tests
* `scripts/local-browser-runtime-check.mjs`

Allowed work:

* Inspect cart and checkout-shell rendering.
* Use existing local browser/CDP smoke approach for non-submitting visual QA.
* Fix small visual/responsive issues in cart and checkout shell only if screenshot evidence supports them.
* Add or update no-DB visual/source guardrail tests only if useful.
* Create `audit-reports/265_CART_CHECKOUT_SHELL_VISUAL_AUDIT.md`.
* Create `audit-reports/266_NEXT_PROMPT_DRAFT.md`.
* Optional screenshots only under `audit-reports/265-cart-checkout-screenshots/`.

Strict guardrails:

* Do not submit checkout.
* Do not create real orders.
* Do not make payment calls.
* Do not change checkout/order/payment backend behavior.
* Do not change cart business logic, pricing, totals, coupon behavior, shipping, stock checks, auth redirects, or API response shapes.
* Do not call order, payment, coupon, return, or product-view mutation APIs manually.
* Do not touch backend/API behavior unless only reading.
* Do not touch Prisma schema, migrations, seeds, reset/db-push scripts, SQL, Docker, deployment, packages, provider config, payment/tracking/seller/lifecycle/CSP/rate-limit/mobile app work.
* Do not touch footer, newsletter, payment-logo files, category/banner/media assets, or `PromoSection.tsx`.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.

Browser QA requirements:

* Use local-only browser QA.
* Check `/cart` at 360, 390, 430, 700, 768, 1024, and 1366 widths.
* Check `/checkout` as an unauthenticated visitor and confirm it does not expose the checkout form before auth.
* If authenticated checkout fixture is unavailable, do not force it; document that authenticated checkout-shell visual QA remains blocked until the local fixture is created.
* Do not click Place Order or any payment handoff.
* Do not manually call mutation APIs.
* Confirm no horizontal overflow, broken visible images, runtime errors, or unnamed buttons.

Validation:

* `git diff --check -- <exact changed files>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-local-auth-fixture-readiness.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

If source files change and validation passes, stage exact changed files only and commit with:

`fix: improve cart and checkout shell visual readiness`

If the step is audit-only, commit with:

`docs: audit cart checkout shell visual readiness`

Final response format:

1. Summary of Step 265 cart/checkout-shell work
2. Files changed/staged/committed
3. Screenshot diagnosis result
4. Cart mobile result
5. Cart tablet/desktop result
6. Checkout unauthenticated-shell result
7. Authenticated checkout-shell blocker/result
8. Implementation result
9. Behavior preservation result
10. Footer/payment-logo/asset regression result
11. Screenshot/viewport QA result
12. Validation results
13. Commit hash/oneline, or reason no commit happened
14. Confirmation no prohibited files/actions occurred
15. Remaining risks
16. Recommended next step
```
