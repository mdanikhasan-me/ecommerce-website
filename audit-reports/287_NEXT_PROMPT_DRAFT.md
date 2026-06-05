# Step 287 Next Prompt Draft

Copy-paste this prompt into Codex for the next step.

```text
/plan

We are continuing the step-by-step technical recovery and UI/UX readiness workflow for the Bangladesh-focused pre-launch Boilabin e-commerce project.

Latest completed step:

* Step 286: `audit-reports/286_UI_UX_REDESIGN_TRANSITION_INVENTORY.md`
* Step 286 created a maximum-effort UI/UX redesign transition inventory, browser/screenshot evidence, and no-DB readiness tests.
* Step 286 did not redesign the storefront. It added inventory tooling/tests and evidence only.
* Local PostgreSQL is available enough for guarded local validation/generation and browser smoke, but DB/destructive work remains forbidden unless explicitly approved.

Your task for Step 287:
Perform the first small storefront UI/UX implementation pass focused on accessibility contract hardening for listing/product-card and filter controls only.

Goal:
Improve accessible labels/semantics for the highest-confidence storefront UI surfaces identified in Step 286 without changing layout, route behavior, API behavior, catalog behavior, media assets, payment, tracking, seller marketplace, or product lifecycle logic.

Read first:

* `audit-reports/286_UI_UX_REDESIGN_TRANSITION_INVENTORY.md`
* `audit-reports/286-ui-ux-redesign-transition-inventory/summary.json`
* `audit-reports/286-ui-ux-redesign-transition-inventory/ui-surface-inventory.json`
* `tests/ui-ux-redesign-readiness.test.ts`
* `src/frontend/components/product/ProductCard.tsx`
* `src/frontend/components/product/SearchFiltersPanel.tsx`
* related existing tests for storefront/search/product UI if present

Allowed implementation:

1. Product card accessibility only
   * Make wishlist control accessible names/titles state-aware in all variants if any variant is still generic.
   * Make compare control accessible names/titles state-aware where applicable.
   * Preserve visible UI, classes, layout, icon choices, click behavior, localStorage behavior, cart/wishlist/compare behavior, and route links.

2. Search/filter panel accessibility only
   * Add or tighten semantic grouping/labels for rating or option groups if currently ambiguous.
   * Preserve query parameter behavior, form behavior, filter logic, visible layout, and styling.

3. Tests
   * Add or extend no-DB tests that verify the accessibility contract without requiring a live database.
   * Prefer a focused test such as `tests/storefront-ui-accessibility-contract.test.ts`, or extend `tests/ui-ux-redesign-readiness.test.ts` if cleaner.
   * Tests should check source-level/accessibility contracts only and must not depend on DB state.

4. Report and next prompt
   * Create `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`.
   * Create `audit-reports/288_NEXT_PROMPT_DRAFT.md`.

Strict guardrails:

* Do not redesign the storefront broadly.
* Do not change visual styling except for minimal semantic/attribute changes needed for accessibility.
* Do not change route behavior, API behavior, response shapes, auth behavior, SEO architecture, catalog behavior, product lifecycle logic, checkout behavior, payment behavior, tracking behavior, seller marketplace behavior, or mobile-app implementation.
* Do not touch Prisma schema, migrations, seed/reset/db-push scripts, or run migrations/db push/seed/reset/destructive SQL.
* Do not add dependencies or update packages.
* Do not touch footer files, newsletter files, payment-logo assets, PromoSection, category image assets, hero/banner assets, product images, uploads, or media files.
* Do not restore removed Flash Deals routes or admin flash-sale APIs.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.
* Do not deploy.

Validation commands:

* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* targeted test command for the new/updated accessibility tests
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Browser/smoke validation:

* If the changes are purely attributes/semantics and all tests/build pass, run at least production HTTP smoke if practical:
  * `node scripts/local-runtime-smoke.mjs --mode start --port 3130`
* Run a browser check only if you change markup in a way that could affect layout or interaction.
* If testing product detail, intercept or avoid product-view POST side effects as established in Step 286.

Required report:
Create `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md` with:

1. Scope of Step 287
2. Files changed
3. Accessibility issues addressed
4. Behavior preserved
5. Tests added/updated
6. Validation results
7. Browser/smoke result, if run
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step

Staging and commit:

* Stage only the exact files changed for Step 287.
* Do not use `git add .` or `git add -A`.
* Verify staged files with `git diff --cached --name-only`.
* Commit only if validation passes.

Suggested commit message:

```text
fix: improve storefront listing accessibility foundation
```

Final response format:
Give me only:

1. Summary of Step 287 work
2. Files changed
3. Accessibility fixes made
4. Behavior preservation result
5. Tests added/updated
6. Validation results
7. Browser/smoke result
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no prohibited files/actions occurred
10. Remaining risks
11. Recommended next step
```
