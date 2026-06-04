# Step 246 - Next Prompt Draft

## Recommended Next Step

Recommended next step: Step 247 - tracking-safe product detail, cart, and checkout visual QA preflight.

The footer redesign should be committed first if final validation passes. After that, the next useful technical move is to resume the previously deferred product detail/cart/checkout visual QA, but only after explicitly controlling product-view tracking risk.

## Why This Is The Safest Next Step

Step 243-246 focused on the public storefront footer. The next major public buyer surfaces are:

- product detail pages,
- cart page and cart drawer,
- checkout unauthenticated redirect and checkout shell,
- account-protected buyer flow entry points.

However, the existing browser helper's default route set includes a product detail page, and product detail client behavior can interact with product-view tracking. That makes the next step a better fit for a tracking-safe QA preflight rather than a casual browser sweep.

The next task should not implement payment, tracking providers, seller marketplace, product lifecycle, or backend behavior changes. It should first prove which product/cart/checkout browser checks can be run without unwanted mutations, then run only the safe checks.

## Copy-Paste Codex Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Goal for Step 247:
Perform a tracking-safe product detail, cart, and checkout visual QA preflight, then run only the safe browser checks.

Context:

* Step 243-246 redesigned the public storefront footer.
* Footer redesign should already be committed before this step begins.
* Product-detail browser checks may trigger existing product-view tracking behavior.
* Do not casually run the default browser route set if it includes product detail routes.
* Do not implement payment, tracking provider integration, seller marketplace, product lifecycle, or backend behavior changes.

Read first:

* `audit-reports/245_FOOTER_BROWSER_VISUAL_QA.md`
* `scripts/local-browser-runtime-check.mjs`
* `src/frontend/components/product/ProductDetailClient.tsx`
* product view API route files
* cart page/client files
* checkout page/client files
* footer reports from Step 243-246 only for context

Allowed files:

Audit reports only unless a tiny no-runtime test/helper clarification is clearly needed:

* `audit-reports/247_PRODUCT_CART_CHECKOUT_VISUAL_QA_PREFLIGHT.md`
* optional `audit-reports/248_PRODUCT_CART_CHECKOUT_BROWSER_QA.md`
* optional `audit-reports/249_NEXT_PROMPT_DRAFT.md`

Do not edit source files unless the preflight finds a tiny directly related browser-helper documentation issue and the change is explicitly safe.

Strict guardrails:

* Do not change backend behavior.
* Do not change tracking behavior.
* Do not add tracking provider integration.
* Do not disable product-view tracking in production behavior.
* Do not change payment behavior.
* Do not create real orders.
* Do not submit checkout.
* Do not call payment providers.
* Do not change seller marketplace behavior.
* Do not change product lifecycle behavior.
* Do not change Prisma schema or migrations.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not touch footer/newsletter/payment-logo/category-image/media asset files unless explicitly approved by a dedicated visual step.
* Do not restore Flash Deals or `/api/admin/flash-sales`.
* Do not use broad staging.

Tasks:

1. Verify latest state
   * Run `git status --short`.
   * Run `git log -1 --oneline`.
   * Confirm no staged files.

2. Preflight product-detail tracking risk
   * Inspect product detail client behavior and product view API behavior.
   * Determine whether visiting a product detail page with JS enabled will write product-view tracking data.
   * Do not run product-detail browser QA until this is classified.

3. Define safe browser route set
   * Include cart and checkout redirect checks if they do not create orders or payment calls.
   * Include product detail only if the visit can be run without unwanted tracking mutation or if the report explicitly accepts local-only view tracking as a known side effect.
   * Keep `/deals` and `/api/admin/flash-sales` removed checks.

4. Run validation
   * `npm run db:url:safety`
   * `npm run typecheck`
   * `npm run lint`
   * `npm test`
   * `npm run build`

5. Run browser QA only for safe routes
   * Prefer production `next start` mode after a fresh build.
   * Use a reduced route list rather than the default helper route set if product detail remains unsafe.
   * Check desktop and mobile.
   * Record horizontal overflow, broken visible images, console errors, failed requests, no protected prefetch regressions, and removed Flash route/API status.

Create:

* `audit-reports/247_PRODUCT_CART_CHECKOUT_VISUAL_QA_PREFLIGHT.md`

If browser QA is run, also create:

* `audit-reports/248_PRODUCT_CART_CHECKOUT_BROWSER_QA.md`

Create a next prompt if the step succeeds:

* `audit-reports/249_NEXT_PROMPT_DRAFT.md`

Reports must include:

* files changed,
* product-detail tracking risk classification,
* safe route set,
* skipped route set and why,
* validation results,
* browser QA results if run,
* confirmation no payment/tracking/provider/order mutation work was implemented,
* confirmation no footer/media/payment-logo/category image files were touched,
* remaining risks,
* recommended next step.

Commit:

Only if validation passes and only allowed files changed, stage exact changed files only.

Suggested commit message if reports only:

`docs: add product cart checkout visual qa preflight`

Final response format:

1. Summary of Step 247 work
2. Files changed/staged/committed
3. Product-detail tracking risk result
4. Safe browser QA route result
5. Validation results
6. Browser QA result, if run
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```

## Notes For The Next Operator

- Do not use `node scripts/local-browser-runtime-check.mjs --help`; the helper does not implement `--help` and will run the default route set.
- To run a reduced route set without editing files, import the helper module and mutate `BROWSER_RUNTIME_ROUTES` in the one-off Node command before calling `runBrowserRuntimeCheck`.
- Rebuild before production browser QA if `next dev` or a dev browser helper run occurred earlier in the same task.
- Keep exact-file staging and no broad staging.
