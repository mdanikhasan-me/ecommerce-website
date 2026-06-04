# Step 262 Next Prompt Draft

## Validation Results

Step 261 stopped before fixture creation because the required owner-provided local-only buyer password environment variable was missing. Safe preflight checks passed: latest commit matched Step 260, no staged files were present, DB URL safety passed, guarded Prisma validate/generate passed, and fixture readiness reported `manual-owner-action-required`.

## Recommended Next Step

Either set the required local-only buyer password outside git and rerun the authenticated checkout shell QA, or pause checkout QA and move to homepage/category/product visual refinement.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 261: `audit-reports/261_AUTHENTICATED_CHECKOUT_SHELL_QA.md`
* Step 261 was blocked before fixture creation because `BOILABIN_LOCAL_BUYER_PASSWORD` was missing from the shell environment.
* Safe preflight passed: latest commit matched Step 260, no staged files were present, DB URL safety passed, guarded Prisma validate/generate passed, and fixture readiness reported `manual-owner-action-required`.
* No fixture was created.
* No browser login was attempted.
* No checkout shell QA was run.
* No checkout submit, order creation, payment call, or gateway behavior occurred.

Goal for Step 262:
Run the authenticated checkout shell QA only if the owner has set `BOILABIN_LOCAL_BUYER_PASSWORD` outside git before starting.

Hard precondition:

* The owner must set `BOILABIN_LOCAL_BUYER_PASSWORD` in the shell environment outside git.
* Do not print it.
* Do not commit it.
* Do not write it into docs or audit reports.
* Do not paste it into final output.

Stop immediately and create a blocker report only if the password env var is still missing.

Read first:

* `audit-reports/261_AUTHENTICATED_CHECKOUT_SHELL_QA.md`
* `audit-reports/260_AUTHENTICATED_CHECKOUT_LOCAL_FIXTURE_AND_QA.md`
* `scripts/create-local-buyer-fixture.mjs`
* `scripts/audit-local-auth-fixture-readiness.mjs`
* `src/app/(store)/checkout/page.tsx`
* `src/frontend/components/checkout/CheckoutClient.tsx`
* `src/app/api/orders/route.ts`
* `src/frontend/components/cart/CartDrawer.tsx`
* `package.json`

Allowed deliverables:

* `audit-reports/262_AUTHENTICATED_CHECKOUT_SHELL_QA_RERUN.md`
* `audit-reports/263_NEXT_PROMPT_DRAFT.md`
* optional screenshots under `audit-reports/262-authenticated-checkout-screenshots/`

Allowed source changes:

No source changes by default.

Strict guardrails:

* Do not click `Place Order`.
* Do not create orders.
* Do not submit checkout.
* Do not call payment gateways.
* Do not enable payment providers.
* Do not change checkout behavior.
* Do not change order API behavior.
* Do not change auth behavior.
* Do not change cart pricing, stock behavior, product visibility, API response shapes, SEO, footer, newsletter, payment logos, category media, tracking, seller marketplace, product lifecycle, CSP, rate-limit, mobile app, or admin behavior.
* Do not run Prisma migrations.
* Do not run `prisma db push`.
* Do not run seed/reset/destructive SQL.
* Do not run Docker setup, provider CLI, package updates, or deployment.
* Do not edit Prisma schema or migrations.
* Do not read private env files directly.
* Do not print secrets, full DB URLs, full buyer email, password, password hash, auth cookies, tokens, headers, customer/order PII, payment secrets, or private connection strings.
* Do not use real customer accounts.
* Do not use production/staging credentials.
* Do not use `git add .` or `git add -A`.
* Do not stage broadly.

Phase 1 - Preflight:

Run:

* `git log -1 --oneline`
* `git status --short`
* `git diff --cached --name-only`
* check whether `BOILABIN_LOCAL_BUYER_PASSWORD` is present without printing it
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-local-auth-fixture-readiness.mjs`

Phase 2 - Fixture:

If all gates pass, run:

* `npm run auth:buyer:local`

Record only safe facts. Do not print password, hash, full buyer email, or full DB URL.

Phase 3 - Browser:

Log in locally through `/auth/login` using the local-only buyer fixture.

Watch network requests and fail if any order or payment submit request appears.

Allowed checkout QA:

* visit `/cart`
* visit `/checkout`
* inspect delivery step
* move to payment/review only without submitting checkout or payment
* verify `Place Order` visibility but do not click it

Screenshot widths:

* 390
* 700
* 768
* 1024
* 1366

Also record skipped/checked status for:

* 360
* 430
* 480
* 600
* 900

Regression checks:

* footer social row has Facebook, Instagram, YouTube
* YouTube href is `https://www.youtube.com/@Boilabin`
* footer payment row has bKash, Nagad, Visa, Mastercard
* COD absent from footer payment row
* `/deals` remains 404
* `/api/admin/flash-sales` remains 404
* cart drawer polish remains intact

Validation:

Run:

* `git diff --check -- audit-reports/262_AUTHENTICATED_CHECKOUT_SHELL_QA_RERUN.md audit-reports/263_NEXT_PROMPT_DRAFT.md audit-reports/262-authenticated-checkout-screenshots`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `node scripts/audit-local-auth-fixture-readiness.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

If checkout shell QA succeeds:

```text
test: verify local authenticated checkout shell
```

If blocked again:

```text
docs: record authenticated checkout shell qa blocker
```

Final response format:

1. Summary of Step 262 authenticated checkout shell QA rerun
2. Files changed/staged/committed
3. Safety gate result
4. Local buyer fixture result
5. Login/session result
6. Checkout shell QA result
7. No-order/no-payment network proof
8. Viewport/screenshot result
9. Footer/cart/product regression result
10. Validation results
11. Commit hash/oneline, or reason no commit happened
12. Confirmation no prohibited files/actions occurred
13. Remaining risks
14. Recommended next step
```
