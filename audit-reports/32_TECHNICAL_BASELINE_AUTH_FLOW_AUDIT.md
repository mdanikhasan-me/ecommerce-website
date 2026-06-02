# Step 32: Technical Baseline and Auth Flow Audit

Date: 2026-06-02

## Scope

This checkpoint resumed the technical roadmap after the footer experiments. It verified baseline build health, migration readiness, protected route behavior, and safe local production smoke checks.

Footer visual work was intentionally stopped. No footer layout, newsletter styling, payment logo, payment backend, database, Prisma schema, migration, tracking, seller marketplace, or unrelated UI work was performed.

## Files Changed

Changed in this Step 32 task:

- `audit-reports/32_TECHNICAL_BASELINE_AUTH_FLOW_AUDIT.md`

No code files were changed in this step.

Important worktree note: the repository already had many pre-existing modified/untracked files from earlier roadmap steps, including footer-related files. Those files were not edited during this Step 32 audit.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed. No database connection attempted. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings/errors. Next.js reported only the standard `next lint` deprecation notice. |
| `npm test` | Passed: 119 tests, 27 suites, 0 failures. |
| `npm run build` | Passed. Next.js production build completed successfully. |

## Production Build Result

Production build passed with `next build`.

Build output confirmed the relevant protected/private routes remain dynamic where expected:

- `/account/profile`
- `/admin/dashboard`
- `/checkout`
- `/order/[orderNumber]/confirmation`
- `/products/[slug]`
- `/search`
- `/category/[slug]`

No build regression was found.

## DB and Migration Readiness

Current safe classification from `npm run db:url:safety`:

| Item | Result |
| --- | --- |
| `.env.local` | Missing |
| `.env` | Present, but secrets were not printed |
| `.env.example` | Present |
| `DATABASE_URL` | Remote-looking |
| `SHADOW_DATABASE_URL` | Missing |
| Local migration ready | No |

No database connection was attempted. No database was touched.

Step 7C lifecycle migration cannot be rerun safely yet. It should remain paused until both `DATABASE_URL` and `SHADOW_DATABASE_URL` classify as local.

## Protected Route and Auth Audit

### Login

- `src/app/(store)/auth/login/page.tsx` uses `getSafeCallbackUrl(...)` before passing callback URLs into the login form.
- Existing safe callback URL tests passed.

Result: no obvious open-redirect regression found in the login page source.

### Account/Profile

- `src/middleware.ts` redirects unauthenticated `/account/*` requests to login based on absence of a session cookie.
- `src/app/(store)/account/profile/page.tsx` also calls `auth()` and redirects unauthenticated users before querying the user record.

Result: unauthenticated profile access remains protected.

### Checkout

- `src/app/(store)/checkout/page.tsx` calls `auth()` and redirects unauthenticated users to `/auth/login?callbackUrl=/checkout&reason=checkout`.

Result: checkout remains protected from unauthenticated checkout UI access.

### Admin

- `src/middleware.ts` redirects unauthenticated `/admin/*` requests to login based on absence of a session cookie.
- `src/app/(admin)/admin/layout.tsx` calls `auth()` and checks `ADMIN` / `SUPER_ADMIN` roles before rendering the admin shell or querying notification count.
- Admin API helpers in `src/backend/admin/admin-utils.ts` and `src/backend/admin/product-editor.ts` still enforce `ADMIN` / `SUPER_ADMIN`.

Result: admin pages and sampled admin APIs remain protected by server-side role checks.

### Order Confirmation

- `src/app/(store)/order/[orderNumber]/confirmation/page.tsx` calls `auth()` before querying order details.
- Unauthenticated requests return `notFound()`.
- Non-admin users are scoped to `userId: session.user.id`.
- `ADMIN` and `SUPER_ADMIN` roles can access without owner scoping.

Result: the Step 1 order confirmation PII fix remains intact. No unauthenticated public order confirmation PII exposure was found.

### API Mutation Protection

- `protectMutationRequest(...)` remains present in the shared guard at `src/backend/security/request-guard.ts`.
- Source search confirmed it is still applied across high-risk custom mutation APIs, including account profile/address mutations, order creation, auth registration, contact/newsletter/reviews/returns, product view, and admin mutation routes.
- Mutation request guard tests passed.

Result: Step 1 CSRF/Origin/Referer mutation guardrails remain intact.

### Auth Host Guardrails

- `src/backend/auth/config.ts` still uses `trustHost: shouldTrustAuthHost()`.
- `src/backend/auth/host.ts` remains present with local production verification support and production warning behavior.
- Auth host tests passed.
- Local production smoke check returned `/api/auth/session` status `200` with no `UntrustedHost` runtime error.

Result: no Auth.js trusted-host regression was found in this checkpoint.

### Residual Auth Risk

`src/middleware.ts` only checks for the presence of a session cookie and does not validate the token or role. The authoritative checks are still performed in server layouts/pages/API helpers, so this is not currently a direct bypass in the audited paths, but middleware should not be treated as the final security boundary.

## Browser Smoke-Check Result

Environment:

- Fresh local production build from `npm run build`
- Local production server: `node node_modules/next/dist/bin/next start -p 3100`
- Browser/CDP: headless Chrome via local DevTools Protocol
- Desktop viewport: 1366 x 900
- Mobile viewport: 390 x 844
- No database mutation commands were run
- No real orders, payment calls, tracking calls, seed/reset, or migrations were performed

HTTP route checks:

| Route | Result |
| --- | --- |
| `/` | 200 |
| `/auth/login` | 200 |
| `/account/profile` | 307 redirect to `/auth/login?callbackUrl=%2Faccount%2Fprofile` |
| `/checkout` | 307 redirect to `/auth/login?callbackUrl=/checkout&reason=checkout` |
| `/cart` | 200 |
| `/admin/dashboard` | 307 redirect to `/auth/login?callbackUrl=%2Fadmin%2Fdashboard` |
| `/order/BLB-UNAUTHORIZED-SMOKE/confirmation` | 404, no order detail page rendered |
| `/robots.txt` | 200 |
| `/sitemap.xml` | 200 |
| `/api/auth/session` | 200 |

Chrome/CDP checks:

| Route | Desktop | Mobile | Notes |
| --- | --- | --- | --- |
| `/` | 200 | 200 | No console errors or runtime exceptions. |
| `/auth/login` | 200 | 200 | No console errors or runtime exceptions. |
| `/account/profile` | Redirected to login | Redirected to login | No console errors or runtime exceptions. |
| `/checkout` | Redirected to login | Redirected to login | No console errors or runtime exceptions. |
| `/cart` | 200 | 200 | No console errors or runtime exceptions. |
| `/admin/dashboard` | Redirected to login | Redirected to login | No console errors or runtime exceptions. |
| `/order/BLB-UNAUTHORIZED-SMOKE/confirmation` | 404 | 404 | No console errors or runtime exceptions. |
| `/robots.txt` | 200 | 200 | No console errors or runtime exceptions. |
| `/sitemap.xml` | 200 | 200 | No console errors or runtime exceptions. |
| `/api/auth/session` | 200 | 200 | No console errors or runtime exceptions. |

An initial fast navigation loop counted some failed requests while moving between pages. A focused follow-up CDP pass on `/` and `/auth/login` showed no failed requests, so the earlier counts appear to be navigation-abort noise rather than stable missing assets.

### Product Page Smoke Check

One product detail page was intentionally not requested. `src/app/(store)/products/[slug]/page.tsx` performs database-backed product, review, and related-product queries. Because the current `DATABASE_URL` is remote-looking and the task required no database connection or modification, product page browser smoke testing was skipped for safety.

## Regressions Found

No build, typecheck, lint, test, protected route, auth host, or safe-route browser runtime regressions were found.

No accidental footer-related build regression was observed in the safe smoke checks.

## Fixes Made

No code fixes were made. This step was verification/audit only.

## Footer Files Confirmation

The following prohibited footer/payment files were not edited during this Step 32 task:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

No footer layout, newsletter styling, payment logos, or footer-related styling was touched.

## Remaining Risks

- Local migration readiness is still blocked because `.env.local` is missing, `DATABASE_URL` is remote-looking, and `SHADOW_DATABASE_URL` is missing.
- Authenticated flows with real local buyer/admin users were not fully exercised because there is no verified safe local database/test account setup yet.
- Product detail browser smoke testing was skipped because the route is DB-backed and the current database URL is not safe for local test access.
- Middleware remains a lightweight redirect convenience layer that checks cookie presence only; server-side auth and role checks remain the real protection boundary.
- The worktree is already dirty from prior roadmap steps. This checkpoint did not attempt to clean, revert, or normalize unrelated changes.

## Recommended Next Technical Step

Set up a safe local PostgreSQL app database and separate local shadow database, create `.env.local` with local-only `DATABASE_URL` and `SHADOW_DATABASE_URL`, then rerun `npm run db:url:safety`.

Once both database URLs classify as local, proceed with the paused lifecycle migration path and add authenticated local test users so product detail, account, admin, checkout, and order flows can be smoke-tested without touching remote data.
