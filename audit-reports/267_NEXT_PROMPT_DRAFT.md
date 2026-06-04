# Step 267 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 266: `audit-reports/266_REMOTE_PRODUCT_IMAGE_SOURCE_OF_TRUTH_CLEANUP.md`
* Step 266 localized seven high-confidence storefront product image sources to committed local assets.
* The guarded local repair updated stale local DB product image rows after `npm run db:url:safety` confirmed both DB URLs were local and separate.
* Strict production image QA passed with zero failures.
* Product-view POSTs were intercepted by CDP and none reached the server/proxy.
* `/deals` and `/api/admin/flash-sales` remained removed.
* Footer payment regression checks passed.

Goal for Step 267:
Create a remaining remote media localization decision package only. Do not add, download, generate, replace, stage, or commit image assets in this step.

Read first:

* `audit-reports/266_REMOTE_PRODUCT_IMAGE_SOURCE_OF_TRUTH_CLEANUP.md`
* `audit-reports/266-remote-product-image-qa/strict-image-qa-summary.json`
* `scripts/audit-storefront-media-sources.mjs`
* `prisma/seed.ts`
* `src/shared/assets.ts`
* `src/shared/category-media.ts`
* existing public asset folders under `public/assets/` and `public/uploads/`

Tasks:

1. Map the remaining remote media sources:
   * remaining product seed remotes
   * Sony hero remote
   * brand logo placeholder remotes
   * sample order/demo image remotes
   * repair-script-only stale remote keys

2. Classify each remaining remote source:
   * safe to leave temporarily
   * needs exact owner-provided product asset
   * could use an existing committed asset only if owner explicitly approves
   * should not be replaced because it would be ambiguous or misleading
   * demo-only and not storefront-visible

3. Produce an asset request matrix:
   * product/brand/demo item
   * current remote source type
   * desired local asset filename/path
   * required source/original quality
   * risk if left remote
   * risk if replaced incorrectly

4. Do not implement changes.
5. Do not run local DB repair scripts.
6. Do not create or modify image files.
7. Do not stage or commit anything unless explicitly requested in a later commit step.

Strict guardrails:

* Do not touch cart, checkout, order, payment, auth, product behavior, SEO, footer, newsletter, payment-logo assets, `PromoSection`, category images, Baby/Toys, Flash Deals, seller, tracking, lifecycle, mobile, CSP, rate-limit, Prisma schema, migrations, private env files, Docker, deployment, or package files.
* Do not run migrations, seed, reset, db push, destructive SQL, Docker, provider, deployment, or package update commands.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, or customer/order PII.
* Do not use `git add .` or `git add -A`.

Create:

* `audit-reports/267_REMAINING_REMOTE_MEDIA_LOCALIZATION_DECISION_PACKAGE.md`
* `audit-reports/268_NEXT_PROMPT_DRAFT.md`

Validation:

* `node scripts/audit-storefront-media-sources.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Final response format:

1. Summary of Step 267 decision package
2. Files changed
3. Remaining remote media inventory
4. Asset request matrix summary
5. Safe versus risky replacement decisions
6. Validation results
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```

## Recommended Next Step

Use the prompt above for Step 267 to create a remaining remote media localization decision package before any further product image replacements are attempted.
