# Step 263 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 262: `audit-reports/262_ADAPTIVE_CHECKOUT_OR_STOREFRONT_BATCH.md`
* Step 262 could not run authenticated checkout QA because `BOILABIN_LOCAL_BUYER_PASSWORD` was missing.
* Step 262 used the approved fallback path and polished public storefront category/search/product-card visual rhythm.
* Step 262 committed only bounded storefront visual files, screenshots, and audit reports.
* No order, payment, checkout mutation, auth fixture, migration, seed, reset, db push, or deployment was run.

Goal for Step 263:
Run authenticated checkout shell QA only if the local buyer password is now present. If the password is still missing, stop after documenting the blocker; do not keep falling back automatically.

Read first:

* `audit-reports/262_ADAPTIVE_CHECKOUT_OR_STOREFRONT_BATCH.md`
* `audit-reports/261_AUTHENTICATED_CHECKOUT_SHELL_QA.md`
* `audit-reports/260_AUTHENTICATED_CHECKOUT_LOCAL_FIXTURE_AND_QA.md`
* `scripts/audit-local-auth-fixture-readiness.mjs`
* `scripts/create-local-buyer-fixture.mjs`
* `src/app/(store)/checkout/page.tsx`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* `src/app/api/orders/route.ts`

Strict guardrails:

* Do not print secrets, passwords, full DB URLs, cookies, auth headers, payment secrets, or private connection strings.
* Do not create or place real orders.
* Do not click Place Order.
* Do not call payment APIs.
* Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app work, or product lifecycle migration.
* Do not run Prisma migrations, seed, reset, db push, or destructive SQL.
* Do not edit Prisma schema or migrations.
* Do not edit footer, newsletter, payment logos, category image assets, homepage hero imagery, or unrelated visual files.
* Do not change API response shapes, status codes, auth behavior, checkout business logic, cart pricing, stock behavior, or payment behavior.
* Do not stage broadly. Use exact-file staging only if committing.

Required preflight:

1. Run `git status --short`.
2. Run `git diff --cached --name-only`.
3. Confirm no files are staged.
4. Check whether `BOILABIN_LOCAL_BUYER_PASSWORD` is present without printing its value.
5. Run:

   * `npm run db:url:safety`
   * `npm run db:prisma:local:validate`
   * `npm run db:prisma:local:generate`
   * `node scripts/audit-local-auth-fixture-readiness.mjs`

Stop condition:

* If `BOILABIN_LOCAL_BUYER_PASSWORD` is still missing, do not create a fixture, do not login, do not open checkout as an authenticated user, and do not run fallback work. Create only `audit-reports/263_AUTHENTICATED_CHECKOUT_PASSWORD_BLOCKER.md` and recommend owner action.

Allowed work if the password is present:

1. Run the guarded local buyer fixture command only if DB safety says local-ready:

   * `npm run auth:buyer:local`

2. Start local production or dev server using the existing safe local approach.
3. Browser-check only:

   * Login page loads.
   * Buyer login succeeds with the local fixture.
   * `/checkout` renders the authenticated checkout shell.
   * Required checkout sections are visible.
   * No runtime errors occur.
   * No order is placed.
   * No payment action is triggered.
   * Do not click Place Order.

4. Capture focused screenshots under:

   * `audit-reports/263-authenticated-checkout-shell-screenshots/`

5. Create:

   * `audit-reports/263_AUTHENTICATED_CHECKOUT_SHELL_QA.md`

The report must include:

* scope
* password presence result without value
* DB safety result without URLs
* fixture readiness/result
* login result
* checkout shell result
* screenshots captured
* confirmation no order/payment mutation happened
* validation commands run
* validation results
* files changed
* remaining risks
* recommended next step

Validation commands:

* `git diff --check -- audit-reports/263_AUTHENTICATED_CHECKOUT_SHELL_QA.md audit-reports/263_AUTHENTICATED_CHECKOUT_PASSWORD_BLOCKER.md audit-reports/263-authenticated-checkout-shell-screenshots`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-local-auth-fixture-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit rules:

* If only the blocker report is created, commit message:
  `docs: record authenticated checkout password blocker`
* If checkout shell QA succeeds, commit message:
  `test: verify authenticated checkout shell`
* Stage only exact files created for Step 263.
* Do not stage source files unless a tiny non-behavioral test/helper fix is explicitly necessary and documented.

Final response format:

1. Summary of Step 263 work
2. Password readiness result
3. Files changed/staged/committed
4. Fixture/login/checkout result
5. Screenshot result
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```

## Recommended Next Step

Set `BOILABIN_LOCAL_BUYER_PASSWORD` locally outside git, then run the Step 263 prompt above to perform authenticated checkout shell QA without placing an order or triggering payment.
