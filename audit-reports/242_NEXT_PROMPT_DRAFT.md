# Step 242 - Next Prompt Draft

## Purpose

This prompt continues the Boilabin public storefront visual workflow after the Step 239-242 batch. It should not be run until Step 239-242 validation and commit are complete.

## Validation Results

- Step 239-242 source validation passed before commit:
  - `npm run db:url:safety`
  - `node scripts/audit-ai-marketing-copy.mjs` with no new finding in the changed footer/source files
  - `node scripts/audit-search-verification-readiness.mjs`
  - `npm run typecheck`
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Runtime/browser QA passed with the reduced non-mutating production browser route set documented in `audit-reports/241_PUBLIC_STOREFRONT_BROWSER_VISUAL_QA.md`.
- Commit status should be verified from `git log -1 --oneline` before running the next prompt.

## Recommended Next Step

Proceed to a narrower second public storefront visual QA batch focused on product detail, cart drawer, and checkout visual boundary review. This should be planning and visual QA first, with implementation only if a small, clearly visual, non-behavioral issue is found.

## Copy-Paste Codex Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed step:

* Step 239-242 public storefront UI/UX batch, if committed.
* Confirm the latest commit before continuing.

Goal:
Run a focused second storefront visual QA batch for product detail, cart drawer, and checkout visual boundaries without changing backend behavior.

Read first:

* audit-reports/239_PUBLIC_STOREFRONT_UIUX_SYSTEM_AUDIT.md
* audit-reports/240_PUBLIC_STOREFRONT_UIUX_IMPLEMENTATION_REPORT.md
* audit-reports/241_PUBLIC_STOREFRONT_BROWSER_VISUAL_QA.md
* audit-reports/242_NEXT_PROMPT_DRAFT.md
* src/frontend/components/product/ProductDetailClient.tsx
* src/frontend/components/cart/CartDrawer.tsx
* src/frontend/components/checkout/CheckoutClient.tsx
* src/app/(store)/products/[slug]/page.tsx
* src/app/(store)/cart/page.tsx
* src/app/(store)/checkout/page.tsx
* scripts/local-runtime-smoke.mjs
* scripts/local-browser-runtime-check.mjs

Allowed work:

* Create one audit/report file for this focused visual QA step.
* Inspect product detail, cart drawer, and checkout visual surfaces.
* Run safe validation and smoke checks.
* Implement only tiny visual-only fixes if they are clearly needed and do not affect behavior.
* If product-detail browser checks would trigger product-view tracking writes, skip the mutating browser route and document why.

Strict guardrails:

* Do not change backend behavior.
* Do not change route behavior.
* Do not change auth/session logic.
* Do not change checkout logic or payment logic.
* Do not change tracking behavior.
* Do not change seller marketplace logic.
* Do not change Prisma schema or migrations.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not read private env files.
* Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not restore Flash Deals, /deals, or /api/admin/flash-sales.
* Do not restore public/assets/categories/baby-kids.jpg.
* Do not undo Toys & Collectibles.
* Do not change canonical URLs, noindex rules, JSON-LD/schema behavior, sitemap, robots, or search-verification behavior.
* Do not add fake trust, premium, best, authentic, fast, guaranteed, payment, or seller claims.
* Do not stage broadly.

Validation:

* git diff --check -- <exact changed files and report file>
* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* node scripts/audit-ai-marketing-copy.mjs
* node scripts/audit-search-verification-readiness.mjs
* npm run typecheck
* npm run lint
* npm test
* npm run build

Browser/smoke:

* Use only safe non-mutating browser or HTTP smoke routes.
* Do not run browser automation that triggers product-view tracking writes unless a dedicated approved tracking-safe test mode exists.

Report:

Create one detailed report:

* audit-reports/243_PRODUCT_DETAIL_CART_CHECKOUT_VISUAL_QA.md

The report must include:

1. files inspected
2. files changed, if any
3. product-detail visual QA result
4. cart drawer visual QA result
5. checkout visual boundary result
6. smoke/browser checks run or skipped
7. validation results
8. confirmation no prohibited files/actions occurred
9. remaining risks
10. recommended next step

Commit:

If changes are made and validation is acceptable, stage exact changed files only and commit with an appropriate message.

Final response format:

1. Summary of focused product/cart/checkout visual QA
2. Files changed/staged/committed
3. Product-detail result
4. Cart drawer result
5. Checkout visual-boundary result
6. Browser/smoke result
7. Validation results
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no prohibited files/actions occurred
10. Remaining risks
11. Recommended next step
```
