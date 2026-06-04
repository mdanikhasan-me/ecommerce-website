# Step 254 - Next Prompt Draft

## Validation Results

Step 254 prompt draft created after the Step 253 footer redesign.

## Recommended Next Step

Run the public storefront footer QA checkpoint prompt below before moving to product detail, cart, checkout, homepage, category, or media refinement.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 253: audit-reports/253_FOOTER_SCREENSHOT_DRIVEN_REDESIGN.md
* Step 253 redesigned the footer composition across mobile, tablet/square, and desktop.
* Footer service strip was removed.
* Footer link groups were reduced to Shop, Support, Account, and Legal.
* Newsletter was tightened only in light inline footer mode.
* Payment logos remain display-only and unboxed.
* Reduced production browser QA passed after the final footer changes.
* Screenshots were captured under audit-reports/253-footer-screenshots/.

Goal for Step 254:
Run a no-edit public storefront screenshot QA pass after the footer redesign, then decide whether the footer is accepted or whether a narrowly scoped follow-up is still needed.

This is QA/report-only unless a tiny documentation clarification is needed.

Read first:

* audit-reports/253_FOOTER_SCREENSHOT_DRIVEN_REDESIGN.md
* src/frontend/components/layout/Footer.tsx
* src/frontend/components/layout/NewsletterForm.tsx
* scripts/local-browser-runtime-check.mjs
* package.json

Allowed work:

* Create one audit report only:
  * audit-reports/254_PUBLIC_STOREFRONT_FOOTER_QA_CHECKPOINT.md
* Capture a small screenshot set only under:
  * audit-reports/254-footer-qa-screenshots/
* Run safe local validation and browser QA.
* Do not edit source files unless a critical typo in the new audit report itself needs correction.

Strict guardrails:

* Do not edit Footer.tsx or NewsletterForm.tsx in this step.
* Do not edit source/API/backend/auth/checkout/payment/tracking/seller/Prisma/SEO/catalog/media files.
* Do not change payment backend behavior or payment gateway configuration.
* Do not change newsletter API behavior.
* Do not restore Flash Deals, /deals, or /api/admin/flash-sales.
* Do not change category media assets, Baby & Kids restoration, Toys rollback, or product lifecycle behavior.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not read private env files.
* Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not stage broadly.

QA routes:

* /
* /category
* /search?q=phone
* /cart
* /track-order
* /deals
* /api/admin/flash-sales

QA viewports:

* 360
* 390
* 430
* 480
* 600
* 700
* 768
* 900
* 1024
* 1366

Screenshot minimum:

* mobile 390 home footer
* square 700 home footer
* tablet 768 home footer
* desktop 1366 home footer
* one category/search footer screenshot if safe

Report requirements:

Create audit-reports/254_PUBLIC_STOREFRONT_FOOTER_QA_CHECKPOINT.md with:

1. scope
2. files changed, if any
3. latest commit verification
4. working tree status
5. screenshot set captured
6. mobile footer QA result
7. tablet/square footer QA result
8. desktop footer QA result
9. payment logo QA result
10. newsletter QA result
11. route/browser QA result
12. validation results
13. confirmation no source/runtime/prohibited files were changed
14. remaining risks
15. recommended next step

Validation:

Run:

* git diff --check -- audit-reports/254_PUBLIC_STOREFRONT_FOOTER_QA_CHECKPOINT.md
* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* node scripts/audit-ai-marketing-copy.mjs
* node scripts/audit-search-verification-readiness.mjs
* npm run typecheck
* npm run lint
* npm test
* npm run build

Commit:

If only the Step 254 report and optional Step 254 screenshot folder are changed, and validation passes, stage exact files only.

Commit message:

docs: add post-footer public storefront QA checkpoint

Final response format:

1. Summary of Step 254 QA
2. Files changed/staged/committed
3. Screenshot QA result
4. Browser QA result
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
