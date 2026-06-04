# Step 266 Next Prompt Draft

## Recommended Next Step

Run the Step 266 prompt below to audit and clean up known remote storefront product image source risks using local assets where safe, while preserving cart, checkout, payment, auth, and order behavior.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 265: `audit-reports/265_CART_CHECKOUT_SCREENSHOT_DESIGN_CORRECTION.md`
* Cart page and cart drawer responsive visual composition were improved.
* Checkout remained at the unauthenticated login boundary.
* No order, payment, coupon, return, review, auth-submit, or product-view server request was allowed.
* Strict image-inclusive browser QA found known remote Unsplash-backed product/seed image decode risks outside Step 265 scope.

Goal for Step 266:
Create a dedicated remaining remote product/seed image source cleanup plan and, only where safe, replace stale remote storefront product image references with committed local assets. This is a media/source-of-truth cleanup step, not a cart/checkout rewrite.

Read first:

* `audit-reports/265_CART_CHECKOUT_SCREENSHOT_DESIGN_CORRECTION.md`
* `audit-reports/116_STOREFRONT_IMAGE_SOURCE_OF_TRUTH_REPAIR.md`
* `src/shared/assets.ts`
* `src/shared/category-media.ts`
* `prisma/seed.ts`
* `scripts/repair-storefront-image-sources.mjs`
* `scripts/repair-known-broken-image-urls.mjs`
* `audit-reports/265-cart-checkout-screenshots/final-strict-summary.json`
* `audit-reports/265-cart-checkout-screenshots/final-summary.json`

Allowed work:

* Audit remote product/seed image references that appear in current storefront-visible product cards, product recommendations, or hero/product fixtures.
* Prefer existing committed local assets when they clearly match the product.
* Add local image assets only if they are already available in the repo or can be safely derived from existing committed local screenshot/image evidence.
* Update tests or browser checks only for source-of-truth image mapping and visible-image stability.
* Create `audit-reports/266_REMOTE_PRODUCT_IMAGE_SOURCE_CLEANUP.md`.
* Create `audit-reports/267_NEXT_PROMPT_DRAFT.md`.

Strict guardrails:

* Do not change cart, checkout, order, payment, auth, pricing, coupon, shipping, stock, or product visibility behavior.
* Do not run migrations, db push, seed/reset, destructive SQL, or deployment.
* Do not touch Prisma schema or migrations.
* Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, or mobile app implementation.
* Do not touch footer, newsletter, payment-logo, PromoSection, or unrelated visual layout files.
* Do not replace images with generic/ambiguous assets if the product match is not clear.
* Do not print secrets, full DB URLs, credentials, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.
* Do not click Place Order, submit checkout, call payment providers, or manually call mutation APIs.
* Do not use broad staging commands.

Browser QA requirements:

* Run production browser screenshot/runtime QA for storefront pages where the remote images were previously visible.
* Use the existing product-view CDP block if product detail pages are opened.
* Fail if `/api/orders`, payment APIs/provider hosts, `/api/coupons/validate`, returns/reviews mutations, auth credential submit, order confirmation navigation, or unblocked product-view reaches the server.
* Preserve evidence for any remaining remote images that are intentionally left for a later step.

Validation:

* `git diff --check -- <changed files and reports>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

* Use exact-file staging only.
* Commit message if source/assets change: `fix: localize remaining storefront product images`
* Commit message if report-only: `docs: audit remaining storefront product image risks`

Final response format:

1. Summary of Step 266 work
2. Files changed/staged/committed
3. Remote image audit result
4. Image source-of-truth changes
5. Browser QA result
6. Mutation/network guardrail result
7. Validation results
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no prohibited files/actions occurred
10. Remaining risks
11. Recommended next step
```
