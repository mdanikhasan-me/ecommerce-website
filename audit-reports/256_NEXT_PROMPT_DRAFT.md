# Step 256 - Next Prompt Draft

## Validation Results

Step 256 prompt draft created after the Step 255 footer COD/payment-label cleanup.

## Recommended Next Step

Run the product detail, cart, and checkout visual QA batch below, keeping payment logic and product-view tracking behavior unchanged unless a later approved task explicitly controls those flows.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 255: audit-reports/255_FOOTER_COD_PAYMENT_LABEL_CLEANUP.md
* Step 255 removed COD from the footer `We accept` payment-logo row.
* Footer payment logos now show bKash, Nagad, Visa, and Mastercard only.
* COD was not separately added to the footer to avoid clutter.
* Checkout/payment backend behavior was not changed.

Goal for Step 256:
Run a large but bounded product detail, cart, and checkout visual QA batch focused on buyer-conversion surfaces, without changing payment logic or backend behavior.

This is primarily visual QA and planning. Only tiny non-behavior visual fixes may be made if they are directly supported by screenshot evidence and stay within allowed files.

Read first:

* audit-reports/255_FOOTER_COD_PAYMENT_LABEL_CLEANUP.md
* audit-reports/253_FOOTER_SCREENSHOT_DRIVEN_REDESIGN.md
* src/frontend/components/product/ProductDetailClient.tsx
* src/frontend/components/cart/CartDrawer.tsx
* src/app/(store)/cart/page.tsx
* src/frontend/components/checkout/CheckoutClient.tsx
* scripts/local-browser-runtime-check.mjs
* package.json

Allowed work:

* Create one audit report:
  * audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA.md
* Create one next prompt draft only if needed:
  * audit-reports/257_NEXT_PROMPT_DRAFT.md
* Capture a small screenshot set only under:
  * audit-reports/256-product-cart-checkout-screenshots/
* Run safe local validation and browser QA.
* Make tiny visual-only source edits only if screenshot evidence clearly shows a low-risk issue.

Allowed source files only if a tiny visual fix is required:

* src/frontend/components/product/ProductDetailClient.tsx
* src/frontend/components/cart/CartDrawer.tsx
* src/app/(store)/cart/page.tsx
* src/frontend/components/checkout/CheckoutClient.tsx

Strict guardrails:

* Do not change checkout/payment backend behavior.
* Do not enable payment providers.
* Do not change payment gateway config.
* Do not change order creation behavior.
* Do not change product-view tracking behavior unless a safe no-mutation browser strategy is explicitly documented.
* Do not run product-view tracking mutations unless the route is already known safe for this QA.
* Do not change API response shapes, auth behavior, admin behavior, Prisma schema, migrations, seed/reset, db push, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not read private env files.
* Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not change SEO canonical/noindex/schema/sitemap/robots/search-verification behavior.
* Do not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
* Do not touch category media assets, Baby & Kids restoration, Toys rollback, footer payment logos, newsletter footer layout, payment-logo assets, seller marketplace, tracking integration, or mobile app implementation.
* Do not add unsupported marketing claims.
* Do not stage broadly.

QA surfaces:

* Product detail visual scanability.
* Cart drawer clarity and empty/cart-with-items states if safe.
* Cart page clarity.
* Checkout visual boundary and unauthenticated redirect state.
* Footer remains stable after Step 255.

Browser QA:

Use existing safe local browser/runtime tooling if available.

Check at minimum:

* /
* /cart
* /checkout
* /auth/login
* /category
* /search?q=phone
* one product detail page only if product-view tracking mutation can be safely avoided or is already controlled
* /deals remains 404
* /api/admin/flash-sales remains 404

Viewports:

* 390
* 700
* 768
* 1024
* 1366

Report requirements:

Create audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA.md with:

1. scope
2. latest commit verification
3. files inspected
4. files changed, if any
5. product detail visual QA
6. cart drawer/cart page visual QA
7. checkout visual-boundary QA
8. product-view tracking mutation decision
9. browser/screenshot QA result
10. validation results
11. confirmation no payment/backend/API/DB/prohibited behavior changed
12. remaining risks
13. recommended next step

Validation:

Run:

* git diff --check -- audit-reports/256_PRODUCT_CART_CHECKOUT_VISUAL_QA.md audit-reports/257_NEXT_PROMPT_DRAFT.md src/frontend/components/product/ProductDetailClient.tsx src/frontend/components/cart/CartDrawer.tsx src/app/(store)/cart/page.tsx src/frontend/components/checkout/CheckoutClient.tsx
* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* node scripts/audit-ai-marketing-copy.mjs
* node scripts/audit-search-verification-readiness.mjs
* npm run typecheck
* npm run lint
* npm test
* npm run build

Commit:

If validation passes and only allowed files changed, stage exact changed files only.

Commit message:

chore: audit product cart checkout visual readiness

Final response format:

1. Summary of Step 256 product/cart/checkout QA
2. Files changed/staged/committed
3. Product detail QA result
4. Cart QA result
5. Checkout QA result
6. Product-view tracking decision
7. Browser/screenshot QA result
8. Validation results
9. Commit hash/oneline, or reason no commit happened
10. Confirmation no prohibited files/actions occurred
11. Remaining risks
12. Recommended next step
```
