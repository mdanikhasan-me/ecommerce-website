# Step 264 Next Prompt Draft

## Recommended Next Step

Run Step 264 as a product-detail visual readiness and correction batch with product-view tracking blocked at the browser/CDP network layer.

## Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 263: `audit-reports/263_STOREFRONT_SCREENSHOT_DESIGN_CORRECTION.md`
* Step 263 improved public storefront responsive visual density for home, category, and search pages.
* Step 263 committed only visual frontend files, screenshot evidence, and audit reports.
* Product detail pages were intentionally not browser-smoked because product-detail visits may call the product-view tracking endpoint.

Goal for Step 264:
Run a product-detail page visual readiness and correction batch without touching checkout, payment, auth, backend behavior, database schema, footer/newsletter/payment-logo assets, or product lifecycle work.

Important tracking guardrail:

* Do not call `/api/products/*/view` manually.
* If browser QA visits product detail pages, block `/api/products/*/view` at the browser/CDP network layer and classify that blocked tracking request as expected.
* If product detail screenshots cannot be captured without triggering product-view tracking, stop and create the report with a clear blocker.

Read first:

* `audit-reports/263_STOREFRONT_SCREENSHOT_DESIGN_CORRECTION.md`
* `audit-reports/263-storefront-design-screenshots/qa-summary.json`
* product detail route files under `src/app/(store)/products/[slug]/`
* product detail/frontend components under `src/frontend/components/product/`
* `src/frontend/components/layout/Header.tsx`
* `src/frontend/components/product/ProductCard.tsx`
* related tests for product detail/runtime stability

Allowed work:

* Visual-only edits to product-detail page/components if needed.
* Screenshot-first diagnosis for mobile, tablet, and desktop.
* Use local production browser QA with product-view tracking blocked.
* Create product-detail screenshot artifacts under `audit-reports/264-product-detail-screenshots/`.
* Create `audit-reports/264_PRODUCT_DETAIL_VISUAL_READINESS.md`.
* Create `audit-reports/265_NEXT_PROMPT_DRAFT.md`.
* Commit only if validation passes and staged files are exact.

Strict guardrails:

* Do not change backend/API behavior.
* Do not change product-view tracking implementation.
* Do not change checkout, cart payment flow, auth/session logic, order logic, Prisma schema, migrations, seed/reset/db push, or SQL.
* Do not edit footer, newsletter, payment-logo assets, PromoSection, category images, banner images, or unrelated media assets.
* Do not enable payment, tracking providers, seller marketplace, distributed rate limiting, CSP enforcement, mobile app implementation, or product lifecycle migration.
* Do not deploy.
* Do not install packages or update dependencies.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.
* Do not use broad staging commands such as `git add .` or `git add -A`.

Suggested routes/viewports:

* `/products/iphone-15-pro-128gb`
* `/products/samsung-galaxy-s24-ultra-256gb`
* fallback to one existing product slug discovered from committed source/seed if either route is unavailable
* mobile: 360, 390, 430
* tablet/square: 700, 768, 900
* desktop: 1024, 1366

Visual checks:

* product media sizing and cropping
* title/price/rating/stock density
* buy/add-to-cart panel spacing
* quantity and action controls touch sizing
* product description/specification sections
* related products/product cards
* no horizontal overflow
* no visible broken images
* footer regression check: YouTube present, bKash/Nagad/Visa/Mastercard present, COD absent

Validation commands:

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

Commit message if safe:

```text
fix: improve product detail responsive visual flow
```

Final response format:

1. Summary of Step 264 product-detail visual work
2. Files changed/staged/committed
3. Product-view tracking guardrail result
4. Screenshot diagnosis result
5. Implementation result
6. Mobile result
7. Tablet/square result
8. Desktop result
9. Footer regression result
10. Screenshot/viewport QA result
11. Validation results
12. Commit hash/oneline, or reason no commit happened
13. Confirmation no prohibited files/actions occurred
14. Remaining risks and recommended next step
```
