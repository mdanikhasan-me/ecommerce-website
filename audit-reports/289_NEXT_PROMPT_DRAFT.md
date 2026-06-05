# Step 289 Next Prompt Draft

## Recommended Next Step

Proceed to Step 289: homepage/product-grid rhythm polish using the Step 287 ProductCard/filter foundation and the Step 288 source-controlled catalog product media baseline.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 288: `audit-reports/288_CATALOG_PRODUCT_MEDIA_LOCALIZATION.md`
* Step 288 created source-controlled catalog product media under `public/assets/products/catalog/`.
* Product seed image rows now use `/assets/products/catalog/**`.
* Product seed remote image count is now 0.
* Admin/runtime uploads remain under `public/uploads/products/**`.
* Browser evidence passed with 0 broken visible images and 0 failed requests.
* Build passed.

Goal for Step 289:
Return to homepage/product-grid rhythm polish using the improved ProductCard/filter foundation and the new source-controlled catalog media baseline.

This is a frontend layout/rhythm polish step only.

Read first:

* `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
* `audit-reports/288_CATALOG_PRODUCT_MEDIA_LOCALIZATION.md`
* `audit-reports/288-catalog-product-media-localization/browser-media-evidence.json`
* `src/frontend/components/product/ProductCard.tsx`
* `src/frontend/components/home/FeaturedProductRotator.tsx`
* `src/frontend/components/home/ProductGrid.tsx`
* `src/frontend/components/home/FeaturedCategories.tsx`
* `src/frontend/components/home/HeroBanner.tsx`
* `src/app/(store)/page.tsx`
* `src/app/(store)/category/[slug]/page.tsx`
* `src/app/(store)/search/page.tsx`

Allowed work:

* Make small, scoped frontend rhythm/density/alignment improvements to product grid and homepage product sections.
* Keep ProductCard behavior and response contracts stable.
* Use existing local media paths; do not add, remove, regenerate, or relocalize product/category/banner assets.
* Add or update no-DB tests for layout/rhythm/accessibility contracts if useful.
* Create Step 289 report and evidence.
* Run browser verification after implementation.

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
* Stop if product/card behavior or API contract changes would be required.
* Stop if visual changes affect paused header/footer/newsletter/payment/logo/PromoSection areas.
* Stop if validation fails for a task-caused reason outside the allowed scope.

Validation:

Run and record:

* `git status --short`
* `git diff --cached --name-only`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted frontend/product-card/layout tests
* `node scripts/audit-local-asset-dependencies.mjs --evidence`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`
* production HTTP smoke
* production browser evidence across mobile/tablet/desktop for `/`, `/category/electronics`, `/search?q=phone`, `/products/iphone-15-pro-128gb`, `/cart`, `/checkout`, `/deals`, and `/api/admin/flash-sales`

Required report:

Create:

* `audit-reports/289_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md`

Report must include:

1. Scope and starting state
2. Files inspected
3. Frontend changes made
4. ProductCard/grid behavior preservation
5. Media/source asset preservation
6. Accessibility/rhythm checks
7. Browser evidence
8. Tests added/updated
9. Validation results
10. Exact files changed/staged
11. Confirmation no prohibited files/actions occurred
12. Remaining risks
13. Recommended next step

Create:

* `audit-reports/290_NEXT_PROMPT_DRAFT.md`

Commit:

Stage exact files only after validation passes. Do not use broad staging.

Suggested commit message if frontend polish succeeds:

`fix: polish storefront product grid rhythm`

Final response format:

1. Summary of Step 289 work.
2. Files changed/staged/committed.
3. Frontend rhythm changes made.
4. Media/source asset preservation result.
5. Browser/rendered result.
6. Validation results.
7. Commit hash/oneline, or reason no commit happened.
8. Confirmation no prohibited files/actions occurred.
9. Remaining risks.
10. Recommended next step.
```
