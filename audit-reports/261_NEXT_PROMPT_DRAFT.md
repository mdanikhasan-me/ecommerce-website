# Step 261 Next Prompt Draft

## Validation Results

Step 260 validation passed, including DB URL safety, Prisma local validate/generate, readiness audits, targeted fixture tests, typecheck, lint, full tests, and build.

## Recommended Next Step

Run Step 261 only after the owner supplies a local-only buyer password outside git, then create the guarded local buyer fixture and perform no-submit authenticated checkout shell QA.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 260: `audit-reports/260_AUTHENTICATED_CHECKOUT_LOCAL_FIXTURE_AND_QA.md`
* Step 260 added local-only authenticated checkout buyer fixture guardrails, readiness audit script, docs, and no-DB tests.
* Validation passed: DB URL safety, Prisma local validate/generate, advisor/workflow audits, targeted fixture tests, typecheck, lint, full tests, and build.
* Authenticated checkout browser shell QA was intentionally skipped because the owner has not yet supplied a local-only buyer password/session.

Goal for Step 261:
Create or verify the local-only buyer fixture, then run authenticated checkout shell QA without placing an order.

This step must stop before any order creation or payment action.

Read first:

* `audit-reports/260_AUTHENTICATED_CHECKOUT_LOCAL_FIXTURE_AND_QA.md`
* `scripts/create-local-buyer-fixture.mjs`
* `scripts/audit-local-auth-fixture-readiness.mjs`
* `tests/local-buyer-fixture-guardrail.test.ts`
* `tests/authenticated-checkout-qa-guardrail.test.ts`
* `.env.local.example`
* `README.md`
* `src/app/(store)/checkout/page.tsx`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* `src/app/api/orders/route.ts`

Precondition:

* The owner must set `BOILABIN_LOCAL_BUYER_PASSWORD` outside git with a strong local-only password.
* Do not print the password or full buyer email.
* Do not write the password into committed files.

Allowed work:

1. Run safe readiness checks:
   * `git status --short`
   * `git diff --cached --name-only`
   * `npm run db:url:safety`
   * `npm run db:prisma:local:validate`
   * `node scripts/audit-local-auth-fixture-readiness.mjs`
2. If DB URL-shape readiness is local/separate and the owner supplied a local-only buyer password outside git, run:
   * `npm run auth:buyer:local`
3. Start a local app only if needed for browser QA.
4. Log in as the local-only buyer using the local login page.
5. Add a product to cart through normal local UI or restore a client-side cart fixture only if no server DB mutation is needed.
6. Visit `/checkout`.
7. Verify only the authenticated checkout shell:
   * delivery step renders
   * payment step can be reached after local form validation
   * disabled payment placeholders remain disabled
   * review step can be reached
   * `Place Order` is visible but not clicked
   * no order confirmation route is reached
   * no order API submit occurs
   * no payment API/network call occurs
8. Capture screenshots if browser QA succeeds:
   * `audit-reports/261-authenticated-checkout-screenshots/checkout-390.png`
   * `audit-reports/261-authenticated-checkout-screenshots/checkout-700.png`
   * `audit-reports/261-authenticated-checkout-screenshots/checkout-1366.png`
9. Create `audit-reports/261_AUTHENTICATED_CHECKOUT_SHELL_QA.md`.

Strict guardrails:

* Do not click `Place Order`.
* Do not create orders.
* Do not call payment gateways.
* Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle migration, or mobile implementation.
* Do not run Prisma migrations.
* Do not run `prisma db push`.
* Do not run seed/reset/destructive SQL.
* Do not print secrets, full DB URLs, full buyer email, password, auth cookies, tokens, headers, customer/order PII, payment secrets, or private connection strings.
* Do not edit Prisma schema or migrations.
* Do not change checkout behavior, order API behavior, auth behavior, cart pricing, stock behavior, API response shapes, SEO, footer, newsletter, payment logos, category-media, or visual design.
* Do not install packages or update dependencies.
* Do not deploy.

Stop conditions:

* Stop if `git diff --cached --name-only` is not empty.
* Stop if DB URL safety is not local/separate.
* Stop if `BOILABIN_LOCAL_BUYER_PASSWORD` is missing.
* Stop if the fixture helper refuses to run.
* Stop if login fails.
* Stop if browser QA would require clicking `Place Order`.
* Stop if any order/payment network request is about to be sent.
* Stop if any validation fails for a reason unrelated to the known local-only environment constraints.

Validation:

Run:

* `git diff --check -- audit-reports/261_AUTHENTICATED_CHECKOUT_SHELL_QA.md audit-reports/261-authenticated-checkout-screenshots`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-local-auth-fixture-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit only if validation passes and the staged set is exact.

Commit message if browser QA succeeds:

```text
test: verify local authenticated checkout shell
```

Commit message if blocked report-only:

```text
docs: record authenticated checkout shell qa blocker
```

Final response format:

1. Summary of Step 261 authenticated checkout shell QA
2. Files changed/staged/committed
3. Fixture creation result
4. Login/session result
5. Checkout shell QA result
6. Screenshot result
7. No-order/no-payment confirmation
8. Validation results
9. Commit hash/oneline, or reason no commit happened
10. Confirmation no prohibited files/actions occurred
11. Remaining risks
12. Recommended next step
```
