# Step 269 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

This is Step 269: final public storefront visual acceptance QA across key shopper-facing surfaces.

Latest completed state:

* Step 267 fixed category image replacement cache reliability.
* Step 268 accepted the homepage category image section visually across mobile, tablet, and desktop.
* Latest expected Step 267 commit: `6bfd337 fix: make category image replacements reliable`
* Step 268 should be committed as `docs: add category image visual acceptance qa` before this step starts.

Goal:

Run final public storefront visual acceptance QA across homepage, category, search, product, cart, and footer surfaces.

This is QA/report-only unless a tiny clear regression is found.

Allowed files:

* `audit-reports/269_PUBLIC_STOREFRONT_VISUAL_ACCEPTANCE_QA.md`
* `audit-reports/270_NEXT_PROMPT_DRAFT.md`
* optional focused evidence/screenshots only under `audit-reports/269-public-storefront-visual-qa/`

Do not edit source files unless a tiny obvious regression is proven and the fix is inside the public storefront visual surface only.

Strict guardrails:

* Do not edit images.
* Do not replace, generate, download, rename, recompress, or optimize images.
* Do not touch backend/API, auth, payment, checkout logic, Prisma schema, migrations, seed/reset/db push, SEO/schema/sitemap/robots, seller, tracking, mobile app, CSP, rate-limit, package updates, deployment config, or provider setup.
* Do not restore `/deals` or `/api/admin/flash-sales`.
* Do not print secrets or full DB URLs.
* Do not use broad staging.

Read first:

* `audit-reports/268_HOMEPAGE_CATEGORY_IMAGE_VISUAL_ACCEPTANCE_QA.md`
* `audit-reports/268-category-image-visual-qa/category-image-visual-evidence.json`
* latest `git status --short`
* relevant public storefront components for homepage/category/search/product/cart/footer only

QA routes:

* `/`
* `/category`
* `/category/electronics`
* `/search?q=phone`
* one available product page
* `/cart`
* `/track-order`
* `/deals`
* `/api/admin/flash-sales`

Viewport widths:

* `390`
* `430`
* `768`
* `1024`
* `1366`

Check:

* no broken visible images
* no horizontal overflow
* no obvious overlapping text
* no unreadable key labels/buttons
* category cards still show accepted owner images
* product cards look intact
* cart empty state looks intact
* footer payment/social rows remain intact
* `/deals` remains 404
* `/api/admin/flash-sales` remains 404
* no console errors
* no unexpected failed requests

Validation:

* `git diff --check -- audit-reports/269_PUBLIC_STOREFRONT_VISUAL_ACCEPTANCE_QA.md audit-reports/270_NEXT_PROMPT_DRAFT.md audit-reports/269-public-storefront-visual-qa`
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

Commit if validation passes and report/evidence only changed:

`docs: add public storefront visual acceptance qa`

Final response format:

1. Summary of Step 269 public storefront visual acceptance QA
2. Files changed/staged/committed
3. Route/viewport visual result
4. Image/layout/footer result
5. Removed route result
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```

## Recommended Next Step

Use the prompt above for Step 269 after Step 268 is committed.
