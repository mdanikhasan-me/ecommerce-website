# Step 271 Next Prompt Draft

## Recommended Next Step

Run Step 271 as a bounded owner-facing public claims/copy correction batch.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 270: audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAV_ASSET_MEDIA_AUDIT.md
* Step 270 restored three accidental public asset deletions from HEAD.
* Step 270 committed report/evidence only.
* Public content/navigation was technically accepted, but owner-facing launch copy needs cleanup.
* Remaining media risk was documented: 14 product seed image remotes, 1 Sony hero remote, 1 sample-order remote, and remote brand placeholders remain.

Goal for Step 271:
Make a bounded public claims/copy correction batch for launch honesty and payment/tracking clarity.

This is a text/content-only task. Do not redesign UI and do not change payment/order/auth behavior.

Read first:

* audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAV_ASSET_MEDIA_AUDIT.md
* audit-reports/270-public-storefront-content-nav-asset-media-audit/asset-media-content-summary.json
* src/app/(store)/checkout/page.tsx
* src/frontend/components/checkout/CheckoutClient.tsx
* src/frontend/components/layout/Footer.tsx
* src/frontend/components/content/TrackOrderLookup.tsx
* src/app/(store)/faq/page.tsx
* src/app/(store)/shipping/page.tsx
* src/app/(store)/about/page.tsx
* src/frontend/components/layout/Header.tsx
* tests related to content quality, payment-disabled boundaries, and storefront guardrails

Allowed work:

* Replace unsupported or premature public claims with neutral factual copy.
* Keep changes small, owner-neutral, and text-only.
* Add/update tests only if needed to protect the corrected copy.
* Create audit-reports/271_PUBLIC_CLAIMS_COPY_CORRECTION_LOG.md.
* Create audit-reports/272_NEXT_PROMPT_DRAFT.md.

Candidate corrections:

* Replace "Secure checkout" with neutral wording such as "Checkout" or "Order checkout".
* Clarify footer payment copy while online payments are disabled. Do not change payment logos or layout unless a text-only label is enough.
* Soften FAQ tracking/email/SMS promises unless real launch behavior is already implemented.
* Align shipping/FAQ/checkout delivery timing to one factual policy.
* Align About category wording with active launch categories, or keep it generic without promising paused categories.

Strict guardrails:

* Do not change footer layout, newsletter layout, payment-logo assets, category image assets, product images, or PromoSection visuals.
* Do not enable payment providers.
* Do not change checkout/order/payment/auth logic.
* Do not create orders.
* Do not click Place Order.
* Do not submit payment/coupon/order forms.
* Do not restore Flash Deals.
* Do not edit Prisma schema or migrations.
* Do not run migrations, db push, seed/reset, SQL, Docker setup, provider CLI, package updates, or deployment.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, customer/order PII, payment secrets, or private connection strings.
* Do not download, generate, replace, optimize, rename, or recompress images.
* Do not add unsupported claims like trusted, premium, best, fast, authentic, guaranteed, secure payment, or secure checkout.
* Do not use git add . or git add -A.

Validation:

* git status --short
* git diff --cached --name-only
* git diff --check -- <exact changed files>
* node scripts/audit-ai-marketing-copy.mjs
* node scripts/audit-search-verification-readiness.mjs
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

Report requirements:

Create audit-reports/271_PUBLIC_CLAIMS_COPY_CORRECTION_LOG.md with:

1. Scope and starting state.
2. Files changed.
3. Claims/copy issues fixed.
4. Claims/copy intentionally left for owner approval.
5. Confirmation no UI redesign/payment/auth/order behavior changed.
6. Tests added/updated, if any.
7. Validation results.
8. Remaining risks.
9. Recommended next step.

Commit:

Stage exact changed files only.

Suggested commit message:

fix: neutralize premature public storefront claims

Final response format:

1. Summary of Step 271 work.
2. Files changed/staged/committed.
3. Claims/copy fixes made.
4. Payment/footer wording result.
5. Tracking/delivery/category wording result.
6. Validation results.
7. Commit hash/oneline, or reason no commit happened.
8. Confirmation no prohibited files/actions occurred.
9. Remaining risks.
10. Recommended next step.
```
