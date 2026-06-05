# Step 270 Next Prompt Draft

## Recommended Next Step

Run Step 270 as a report-only pre-launch public storefront content/navigation acceptance and owner-edit checklist.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 269: audit-reports/269_PUBLIC_STOREFRONT_VISUAL_ACCEPTANCE_QA.md
* Step 269 performed final public storefront visual/regression acceptance QA.
* It was report/evidence-only.
* Public storefront route/viewport QA passed after the normalized in-viewport browser pass.
* Product detail view tracking was intercepted and did not write to the server.
* Footer payment/logo checks passed: bKash, Nagad, Visa, Mastercard present; COD absent.
* /deals and /api/admin/flash-sales remained 404.
* Remaining dirty tracked files include pre-existing public asset deletions that must not be staged or modified unless explicitly approved.

Goal for Step 270:
Create a pre-launch public storefront content/navigation acceptance and owner-edit checklist.

This must be report-only unless a tiny broken link or text typo is proven and safe to fix. Prefer no source edits.

Read first:

* audit-reports/269_PUBLIC_STOREFRONT_VISUAL_ACCEPTANCE_QA.md
* audit-reports/269-public-storefront-visual-qa/public-storefront-visual-evidence.json
* README.md
* src/frontend/components/layout/Header.tsx
* src/frontend/components/layout/Footer.tsx
* src/frontend/components/home/*
* src/app/(store) route files
* src/shared/category-media.ts
* src/shared/assets.ts
* src/shared/contact.ts

Scope:

Audit public storefront content and navigation readiness for pre-launch owner review:

1. Header/navigation labels and links
2. Public home page section labels and visible calls to action
3. Category navigation and category labels
4. Search entry points
5. Product-card visible metadata expectations
6. Product-detail visible metadata expectations
7. Cart empty/filled-state copy, without creating orders
8. Track-order public copy and noindex expectation
9. Footer links, social links, contact copy, payment-logo copy
10. SEO/public metadata surfaces only where they affect owner-facing content review

Do not implement:

* visual redesign
* footer/newsletter/payment-logo/category image/PromoSection edits
* source-of-truth image replacement
* product lifecycle schema
* payment backend
* tracking backend
* seller marketplace
* mobile app implementation
* database migrations
* deployment

Strict guardrails:

* Do not stage or commit any existing dirty visual/assets files.
* Do not stage or commit public asset deletions unless this step explicitly authorizes them, which it does not.
* Do not run git add . or git add -A.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or customer/order PII.
* Do not create orders, payment calls, coupon calls, or authenticated buyer/admin actions.
* Do not run migrations, db push, seed, reset, destructive SQL, Docker setup, provider CLI, or deployment commands.
* If browser smoke is used, intercept product-view writes or skip product detail write-producing checks.

Allowed work:

* Create audit report only.
* Create a next-prompt draft only if useful.
* Run safe read-only source searches.
* Run safe route checks and browser read-only checks.
* If a tiny typo/link issue is proven and the fix is in an allowed non-visual doc/content file, stop and ask before editing.

Required report:
Create audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAVIGATION_ACCEPTANCE.md

The report must include:

1. Scope of Step 270
2. Files changed, if any
3. Header/navigation content checklist
4. Home page content checklist
5. Category/search/product content checklist
6. Cart/checkout/track-order content checklist
7. Footer/social/payment content checklist
8. SEO/public metadata content notes
9. Owner-edit checklist before launch
10. Links or content that need owner approval
11. Items intentionally skipped and why
12. Validation commands run
13. Validation results
14. Confirmation no prohibited files/actions occurred
15. Remaining risks
16. Recommended next step

Validation:

* git status --short
* git diff --cached --name-only
* npm run db:url:safety
* npm run db:prisma:local:validate
* npm run db:prisma:local:generate
* npm run typecheck
* npm run lint
* npm test
* npm run build

Build rule:

* If build fails only because local PostgreSQL is unavailable, classify it as a known environment blocker.
* If build fails for any other reason, stop and report.

Commit:

If this step is report-only and validation is acceptable, stage only:

* audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAVIGATION_ACCEPTANCE.md

Commit message:

docs: add public storefront content acceptance checklist

Final response format:

1. Summary of Step 270 work
2. Whether this was report-only
3. Files changed/staged/committed
4. Content/navigation readiness result
5. Owner-edit checklist summary
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```
