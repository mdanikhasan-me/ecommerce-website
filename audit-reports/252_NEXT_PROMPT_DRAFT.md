# Step 252 - Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 251: `audit-reports/251_FOOTER_RESPONSIVE_BREAKPOINT_FIX.md`
* Step 251 fixed the footer middle/tablet/square-ish breakpoint issue.
* Footer now has separate mobile, tablet, and desktop layout behavior.
* Payment logos remain display-only footer indicators and do not enable checkout gateways.
* No payment/backend/DB/deployment/API/SEO behavior changed.

Goal for Step 253:
Run a final public storefront visual screenshot QA checkpoint across the main public flows before moving away from footer work.

This should be verification/audit first. Do not redesign unless a clear regression is found.

Read first:

* `audit-reports/251_FOOTER_RESPONSIVE_BREAKPOINT_FIX.md`
* `src/frontend/components/layout/Footer.tsx`
* `src/frontend/components/layout/NewsletterForm.tsx`
* existing browser QA scripts

Check routes:

* `/`
* `/category`
* `/category/electronics`
* `/search?q=phone`
* `/cart`
* `/track-order`
* `/deals`
* `/api/admin/flash-sales`

Check viewports:

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

Strict guardrails:

* Do not change payment backend behavior.
* Do not enable payment providers.
* Do not change newsletter API behavior.
* Do not touch DB, Prisma, migrations, Docker, deployment, provider CLI, tracking, seller, product lifecycle, SEO canonical/noindex/schema, category media assets, or removed Flash routes.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, package updates, or deployment commands.
* Do not print secrets or full DB URLs.
* Do not stage broadly.

Validation:

* `npm run db:url:safety`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Create:

* `audit-reports/253_PUBLIC_STOREFRONT_VISUAL_QA_CHECKPOINT.md`

The report must include:

1. scope
2. files changed, if any
3. routes checked
4. viewports checked
5. footer responsive result
6. public storefront visual result
7. browser/screenshot evidence
8. validation results
9. confirmation no prohibited behavior changed
10. remaining risks
11. recommended next step

Final response format:

1. Summary of Step 253 work
2. Files changed, if any
3. Routes/viewports checked
4. Footer responsive result
5. Public storefront visual result
6. Validation results
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```

## Recommended Next Step

Run Step 253 as a final public storefront visual screenshot QA checkpoint across the expanded viewport set before moving to non-footer work.
