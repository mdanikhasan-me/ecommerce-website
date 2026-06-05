# Step 288 Next Prompt Draft

Copy-paste this prompt into Codex for the next step.

## Validation Results

Step 288 has not run yet. This draft exists so the next step can continue from the committed Step 287 ProductCard/filter foundation.

## Recommended Next Step

Proceed to Step 288: homepage section and product-grid rhythm polish, using the improved ProductCard foundation while keeping header, footer, newsletter, payment-logo assets, PromoSection, media assets, backend behavior, Prisma, payment, tracking, seller marketplace, CSP/rate-limit, and mobile app implementation out of scope.

```text
/plan

We are continuing the step-by-step UI/UX recovery workflow for the Bangladesh-focused pre-launch Boilabin e-commerce project.

Latest completed step:

* Step 287: `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
* Step 287 improved the repeated ProductCard/listing/filter accessibility foundation.
* ProductCard action labels, rating semantics, filter fieldsets/radiogroup, mobile filter dialog metadata, and sort labeling were improved.
* Step 287 preserved product links, cart/wishlist/compare behavior, filter/sort query behavior, product-view tracking, media paths, SEO architecture, payment/checkout behavior, and route behavior.

Your task for Step 288:
Perform a bounded homepage section and product-grid rhythm polish pass.

Goal:
Improve homepage readability and scan rhythm around repeated product sections now that the ProductCard foundation is safer, without touching header, footer, newsletter, payment logos, PromoSection, media assets, backend behavior, or route/data behavior.

Read first:

* `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
* `audit-reports/287-storefront-card-filter-accessibility-foundation/summary.json`
* `audit-reports/287-storefront-card-filter-accessibility-foundation/responsive-browser-evidence.json`
* `src/app/(store)/page.tsx`
* `src/frontend/components/home/ProductGrid.tsx`
* `src/frontend/components/product/ProductCard.tsx`
* `src/app/globals.css`
* related no-DB tests for runtime/UI readiness

Allowed implementation:

* Homepage product-section rhythm and spacing only.
* `ProductGrid` section header/card-grid structure only.
* Tiny reusable classes in `src/app/globals.css` only if clearly useful and scoped.
* No-DB tests for homepage/product-grid source contracts.
* Browser/screenshot evidence under `audit-reports/288-homepage-product-grid-rhythm/`.
* Create `audit-reports/288_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md`.
* Create `audit-reports/289_NEXT_PROMPT_DRAFT.md`.

Allowed files:

* `src/app/(store)/page.tsx`
* `src/frontend/components/home/ProductGrid.tsx`
* `src/app/globals.css`
* exact new or updated no-DB tests
* `audit-reports/288_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md`
* `audit-reports/289_NEXT_PROMPT_DRAFT.md`
* `audit-reports/288-homepage-product-grid-rhythm/**`

Strict guardrails:

* Do not touch header files.
* Do not touch footer files.
* Do not touch newsletter files.
* Do not touch payment-logo assets.
* Do not touch PromoSection.
* Do not touch homepage hero files.
* Do not touch category image assets, product image files, `public/assets`, or `public/uploads`.
* Do not change ProductCard behavior unless a tiny source-level adjustment is strictly necessary and tested.
* Do not change database queries, product visibility policy, metadata, JSON-LD, canonical/noindex behavior, API behavior, auth behavior, checkout behavior, payment behavior, tracking behavior, seller behavior, CSP/rate-limit behavior, product lifecycle behavior, or mobile app implementation.
* Do not edit Prisma schema or migrations.
* Do not run migrations, seed, reset, db push, destructive SQL, Docker, provider CLI, deployment, package installs, or dependency updates.
* Do not restore removed promotion routes.
* Do not add remote static UI assets.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, customer/order PII, upload filenames, or raw private media values.
* Do not use `git add .` or `git add -A`.

Validation commands:

* `git status --short`
* `git log -5 --oneline`
* `git diff --cached --name-only`
* `git diff --check -- <exact changed files>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted new/updated tests
* `node scripts/audit-local-asset-dependencies.mjs --evidence`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`
* production HTTP smoke if build passes
* production browser evidence if source changes can affect layout

Browser evidence:

Use production mode after build where possible. If visiting product detail, preserve product-view POST interception.

Required report:
Create `audit-reports/288_HOMEPAGE_PRODUCT_GRID_RHYTHM_POLISH.md` with:

1. Scope and starting state
2. Files inspected
3. Files changed
4. Homepage rhythm issues found
5. ProductGrid improvements made
6. Behavior preservation result
7. Media/copy/SEO guardrail result
8. Browser/screenshot evidence result
9. Tests added/updated
10. Validation results
11. Exact files staged/committed
12. Confirmation no prohibited files/actions occurred
13. Remaining risks
14. Recommended next step

Staging and commit:

Stage exact files only. Verify with `git diff --cached --name-only`.

Suggested commit message:

```text
fix: polish homepage product grid rhythm
```

Final response format:

1. Summary of Step 288 work
2. Whether this included source/test changes or was report-only
3. Files changed/staged/committed
4. Homepage rhythm improvements
5. ProductGrid improvements
6. Behavior preservation result
7. Browser/screenshot evidence result
8. Tests added/updated
9. Validation results
10. Commit hash/oneline, or reason no commit happened
11. Confirmation no prohibited files/actions occurred
12. Remaining risks
13. Recommended next step
```
