# Step 290 Next Prompt Draft

## Recommended Next Step

Proceed to Step 290: ProductCard/listing density and price-line rhythm polish.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 289: `audit-reports/289_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md`
* Step 289 polished homepage product-section rhythm after the ProductCard/filter foundation and local catalog media baseline.
* Homepage product sections now use shared `ProductGrid` rhythm classes.
* Homepage product grids max at four desktop columns so the 8-item sections render as clean two-row sections.
* Browser evidence passed with 0 horizontal overflow, 0 broken visible images, 0 failed requests, 0 console errors, and 10 product-view POST interceptions.
* Build passed.

Goal for Step 290:
Polish shared ProductCard/listing density and price-line rhythm for category/search/new-arrivals/product-detail related grids without changing behavior, media, backend, or API contracts.

This is a frontend layout/accessibility polish step only.

Read first:

* `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
* `audit-reports/288_CATALOG_PRODUCT_MEDIA_LOCALIZATION.md`
* `audit-reports/289_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md`
* `audit-reports/289-homepage-product-grid-rhythm-polish/responsive-browser-evidence.json`
* `src/frontend/components/product/ProductCard.tsx`
* `src/frontend/components/home/ProductGrid.tsx`
* `src/app/(store)/category/[slug]/page.tsx`
* `src/app/(store)/search/page.tsx`
* `src/app/(store)/new-arrivals/page.tsx`
* `src/app/(store)/products/[slug]/page.tsx`
* `src/app/globals.css`
* existing ProductCard/runtime/layout tests

Allowed work:

* Make small, scoped ProductCard/listing layout improvements to reduce awkward title/price wrapping and improve scan rhythm.
* Keep cart, wishlist, compare, product link, tracking, rating, badge, image-source, and stock behavior unchanged.
* Keep API/auth/payment/tracking/seller/CSP/rate-limit/product lifecycle/mobile implementation unchanged.
* Keep media sources unchanged; do not add, remove, regenerate, relocalize, optimize, or edit images/SVGs/assets.
* Add or update no-DB tests for ProductCard/listing rhythm and behavior preservation.
* Create Step 290 report and browser evidence.

Suggested safe targets:

* ProductCard text/price layout classes only.
* Optional listing grid gap classes in category/search/new-arrivals only if necessary.
* Related-products section only if a shared ProductCard adjustment naturally improves it.

Strict guardrails:

* Do not touch header.
* Do not touch footer.
* Do not touch newsletter.
* Do not touch payment-logo assets.
* Do not touch `PromoSection.tsx`.
* Do not touch `public/assets/products/**`.
* Do not touch `public/uploads/**`.
* Do not touch category images.
* Do not touch hero/banner images.
* Do not edit Prisma schema.
* Do not create migrations.
* Do not run migrations, seed, reset, db push, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not change API/auth/payment/tracking/seller/CSP/rate-limit/product lifecycle/mobile implementation.
* Do not restore Flash Deals or Flash Sales.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, customer/order PII, private upload filenames, full local paths, or raw private media contents.
* Do not use `git add .` or `git add -A`.

Stop conditions:

* Stop if polish requires media asset changes.
* Stop if ProductCard runtime behavior changes would be required.
* Stop if route/API/backend changes would be required.
* Stop if validation fails for a task-caused reason outside the allowed scope.

Validation:

Run and record:

* `git status --short`
* `git diff --cached --name-only`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted ProductCard/listing rhythm tests
* `node scripts/audit-local-asset-dependencies.mjs --evidence`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`
* production HTTP smoke
* production browser evidence across mobile/tablet/desktop for `/`, `/category/electronics`, `/search?q=phone`, `/new-arrivals`, `/products/iphone-15-pro-128gb`, `/cart`, `/checkout`, `/deals`, and `/api/admin/flash-sales`

Required report:

Create:

* `audit-reports/290_PRODUCT_CARD_LISTING_DENSITY_POLISH.md`

Report must include:

1. Scope and starting state
2. Files inspected
3. ProductCard/listing rhythm issues found
4. Frontend changes made
5. Behavior preservation
6. Media/source asset preservation
7. Accessibility checks
8. Browser evidence
9. Tests added/updated
10. Validation results
11. Exact files changed/staged
12. Confirmation no prohibited files/actions occurred
13. Remaining risks
14. Recommended next step

Create:

* `audit-reports/291_NEXT_PROMPT_DRAFT.md`

Commit:

Stage exact files only after validation passes. Do not use broad staging.

Suggested commit message if frontend polish succeeds:

`fix: polish storefront product card listing rhythm`

Final response format:

1. Summary of Step 290 work.
2. Whether source/test changes or report-only.
3. Files changed/staged/committed.
4. ProductCard/listing rhythm improvements.
5. Behavior preservation result.
6. Accessibility result.
7. Media/source asset preservation result.
8. Browser/rendered result.
9. Tests added/updated.
10. Validation results.
11. Commit hash/oneline, or reason no commit happened.
12. Confirmation no prohibited files/actions occurred.
13. Remaining risks.
14. Recommended next step.
```
