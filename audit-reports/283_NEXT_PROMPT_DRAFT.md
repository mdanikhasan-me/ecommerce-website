# Step 283 Next Prompt Draft

## Validation Results

Draft only. Step 282 validation is recorded in `audit-reports/282_PUBLIC_CLAIMS_COPY_CORRECTION.md`.

## Recommended Next Step

Run a public storefront copy and browser acceptance QA pass to verify the Step 282 wording in rendered pages before moving to another prelaunch blocker.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 282: `audit-reports/282_PUBLIC_CLAIMS_COPY_CORRECTION.md`
* Step 282 corrected unsupported public claims and marketing copy across README, content/SEO guidance, seed/demo product descriptions, checkout/product/FAQ/help/returns/track-order/footer/payment copy, and content-quality tests.
* Marketing-copy audit now reports 0 findings.
* Validation passed: DB URL safety, Prisma local validate/generate, targeted content/SEO/Flash tests, typecheck, lint, full tests, build, production HTTP smoke, production browser runtime check, and additional support-page HTTP smoke.
* Step 282 did not change schema, migrations, DB state, API contracts, auth, checkout behavior, payment processing, tracking behavior, seller behavior, SEO architecture, media lifecycle, assets, or visual design.

Step 283 title:
Public storefront copy and browser acceptance QA

Goal:
Review the corrected public claims in the rendered storefront and docs without making new product, payment, tracking, seller, media, schema, route, or visual changes. Confirm the Step 282 wording is honest, visible where expected, does not overflow on common viewports, and does not reintroduce unsupported claims.

This is review/audit first.

Allowed work:

* Inspect files and rendered pages.
* Run safe local validation/smoke/browser commands.
* Create the Step 283 audit report.
* Create a Step 284 next prompt draft.
* Add or adjust no-DB tests only if a clearly missed copy regression is found and the fix is text/test-only.
* Do not change runtime behavior.

Read first:

* `audit-reports/282_PUBLIC_CLAIMS_COPY_CORRECTION.md`
* `audit-reports/283_NEXT_PROMPT_DRAFT.md`
* `scripts/audit-ai-marketing-copy.mjs`
* `tests/content-quality-policy.test.ts`
* `README.md`
* `docs/CONTENT_QUALITY_GUIDELINES.md`
* `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md`
* `prisma/seed.ts`
* `src/app/(store)/checkout/page.tsx`
* `src/app/(store)/faq/page.tsx`
* `src/app/(store)/help/page.tsx`
* `src/app/(store)/returns/page.tsx`
* `src/backend/config/payment.ts`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* `src/frontend/components/content/TrackOrderLookup.tsx`
* `src/frontend/components/layout/Footer.tsx`
* `src/frontend/components/product/ProductDetailClient.tsx`

Acceptance checks:

1. Marketing copy:
   * Run `node scripts/audit-ai-marketing-copy.mjs`.
   * Confirm it still reports 0 findings.

2. Rendered copy:
   * Verify public pages still use factual wording for checkout, payment availability, delivery estimates, returns/refunds, tracking, support, and footer payment display.
   * Verify no visible public copy says `secure checkout`, `coming soon`, `after gateway setup`, `email/SMS tracking`, `24/7 support`, or `We accept` above payment logos.

3. Footer payment/social:
   * Confirm YouTube remains `https://www.youtube.com/@Boilabin`.
   * Confirm footer row still shows bKash, Nagad, Visa, Mastercard only.
   * Confirm COD remains absent from the footer payment-logo row.
   * Confirm footer layout is not redesigned.

4. Browser/smoke:
   * Run production HTTP smoke.
   * Run production browser runtime check across mobile/tablet/desktop.
   * If using product detail route, avoid submitting view/update/mutation actions beyond existing smoke behavior.
   * Confirm `/deals` and `/api/admin/flash-sales` remain 404.
   * Confirm `/checkout` remains an unauthenticated redirect.

5. Docs:
   * Confirm README and content/SEO docs are factual and do not claim launch, payment gateway, seller marketplace, provider, media lifecycle, or production-readiness status beyond what is implemented.

Strict guardrails:

* Do not edit Prisma schema.
* Do not create migrations.
* Do not run migrations.
* Do not mutate DB.
* Do not run seed/reset/db push/destructive SQL.
* Do not run Docker setup.
* Do not run provider CLI.
* Do not run package updates.
* Do not deploy.
* Do not change API response shapes, status codes, redirects, auth behavior, checkout behavior, payment processing, tracking behavior, seller behavior, CSP, rate-limit, mobile implementation, SEO architecture, product lifecycle, media lifecycle, runtime cleanup helpers, deletion behavior, or provider cleanup.
* Do not restore Flash Deals.
* Do not touch images, uploads, payment-logo assets, category images, product images, newsletter visuals, PromoSection visuals, or public visual design.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, filenames, candidate URLs, full local paths, or private uploaded file contents.
* Do not use `git add .`.
* Do not use `git add -A`.

Validation commands:

* `git status --short`
* `git log -3 --oneline`
* `git diff --cached --name-only`
* `git diff --check -- <exact changed files>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `npx tsx --test tests/content-quality-policy.test.ts tests/seo-policy.test.ts tests/flash-deals-removal.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`
* `node scripts/local-runtime-smoke.mjs --mode start --port 3130`
* `node scripts/local-browser-runtime-check.mjs --mode start --port 3131 --cdp-port 9331`

Required report:

Create:

* `audit-reports/283_PUBLIC_STOREFRONT_COPY_BROWSER_ACCEPTANCE_QA.md`

The report must include:

1. Scope and starting state.
2. Latest commit verification.
3. Files/pages inspected.
4. Marketing-copy audit result.
5. Rendered public-copy acceptance result.
6. Footer payment/social result.
7. Browser/smoke result.
8. Tests added/updated, if any.
9. Validation results.
10. Exact files changed/staged.
11. Confirmation no prohibited behavior/files were touched.
12. Remaining risks.
13. Recommended next step.

Create:

* `audit-reports/284_NEXT_PROMPT_DRAFT.md`

Recommended next step:

* If rendered copy QA passes, choose the next safest prelaunch blocker based on current reports.
* If copy/layout issues are found, draft a narrow follow-up correction prompt.
* If owner decisions are needed for policy claims, draft an owner decision checklist.

Commit:

If only reports are added:

* `docs: add storefront copy acceptance QA`

If tests or tiny copy fixes are added:

* `test: cover storefront copy acceptance`

Final response format:

1. Summary of Step 283 work.
2. Whether this was report-only or included tests/copy fixes.
3. Files changed/staged/committed.
4. Marketing-copy audit result.
5. Rendered public-copy acceptance result.
6. Footer payment/social result.
7. Browser/smoke result.
8. Tests added/updated.
9. Validation results.
10. Commit hash/oneline, or reason no commit happened.
11. Confirmation no prohibited files were touched.
12. Remaining risks.
13. Recommended next step.
```
