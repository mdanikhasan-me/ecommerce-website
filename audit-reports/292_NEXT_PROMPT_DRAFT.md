# Step 292 Next Prompt Draft

Recommended next step: run a bounded ProductCard/listing density and price-line rhythm polish for buyer-facing product grids only.

## Recommended Next Step

Run a bounded ProductCard/listing density and price-line rhythm polish for buyer-facing product grids only, with no data-query, media asset, footer/newsletter/payment-logo, auth, payment, tracking, seller, schema, migration, or provider changes.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:
- Step 291: audit-reports/291_WHOLE_PROJECT_PRE_UIUX_CLOSURE_AND_SCORECARD.md
- Step 291 ran 20 read-only specialist lanes, created a whole-project risk ledger and 100-category readiness matrix, hardened JSON-LD serialization, and confirmed the project is ready for bounded UIUX polish but not broad redesign.

Goal for Step 292:
Run a bounded ProductCard/listing density and price-line rhythm polish for buyer-facing product grids only.

Read first:
- audit-reports/291_WHOLE_PROJECT_PRE_UIUX_CLOSURE_AND_SCORECARD.md
- audit-reports/291-whole-project-pre-uiux-closure/agents/agent-17-frontend-uiux-readiness.md
- src/frontend/components/product/ProductCard.tsx
- src/frontend/components/home/ProductGrid.tsx
- src/app/(store)/category/[slug]/page.tsx
- src/app/(store)/search/page.tsx
- src/app/(store)/new-arrivals/page.tsx
- tests/featured-categories-layout.test.ts
- tests/runtime-stability.test.ts

Allowed work:
- Small visual/UI code changes only for ProductCard/listing density and price-line rhythm.
- Focused tests for product-card/listing layout guardrails.
- Browser evidence screenshots for home, category, search, new arrivals, and product related grids.
- Create audit-reports/292_PRODUCT_CARD_LISTING_UIUX_POLISH.md and audit evidence folder.

Allowed files:
- src/frontend/components/product/ProductCard.tsx
- src/frontend/components/home/ProductGrid.tsx only if needed for grid rhythm
- src/app/globals.css only for scoped product-card/listing helpers if needed
- tests/*product* or tests/*runtime* focused test files if needed
- audit-reports/292_PRODUCT_CARD_LISTING_UIUX_POLISH.md
- audit-reports/292-product-card-listing-uiux-polish/**

Strict guardrails:
- Do not change product queries, API behavior, auth, payment, tracking, seller, SEO contracts, Prisma schema, migrations, seed/reset/db push, SQL, deployment, provider config, packages, or env files.
- Do not touch public/uploads, product/category/banner/payment/branding assets, footer, newsletter, PromoSection, payment logos, Header redesign, checkout behavior, product-view tracking logic, /deals, or /api/admin/flash-sales.
- Do not print secrets or full DB URLs.
- Use exact-file staging only.

Validation:
- git status --short
- git diff --cached --name-only
- npm run db:url:safety
- npm run db:prisma:local:validate
- npm run db:prisma:local:generate
- targeted tests for changed area
- npm run typecheck
- npm run lint
- npm test
- npm run build
- production browser evidence for affected routes with product-view POST interception

Commit:
Stage exact changed files only and commit with:
fix: polish product card listing rhythm

Stop conditions:
- Stop if any prohibited file is touched or staged.
- Stop if browser evidence shows broken visible images, missing icons, console errors, server errors, failed requests, horizontal overflow, or un-intercepted product-view writes.
- Stop if validation fails for a task-caused reason.

Final response:
Give me only:
1. Summary of Step 292 work
2. Files changed/staged/committed
3. ProductCard/listing UIUX result
4. Browser evidence result
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
