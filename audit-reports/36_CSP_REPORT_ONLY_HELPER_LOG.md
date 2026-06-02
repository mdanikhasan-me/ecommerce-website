# Step 36: CSP Report-Only Helper Log

Date: 2026-06-02

## Scope

Implemented a safe route-aware CSP foundation for report-only testing. CSP remains disabled by default and is not enforced.

Local PostgreSQL is still not ready, so database/product lifecycle migration and authenticated DB-backed flow testing remain paused.

## Files Changed

Changed in this Step 36 task:

- `src/backend/security/csp.ts`
- `src/middleware.ts`
- `.env.example`
- `README.md`
- `tests/csp.test.ts`
- `audit-reports/36_CSP_REPORT_ONLY_HELPER_LOG.md`

Notes:

- `.env.example` and `README.md` already had earlier uncommitted roadmap edits. Step 36 only added the CSP report-only env/docs pieces.
- No Prisma, database, footer, payment-logo, visual/UI, seller, payment backend, tracking, product lifecycle, or unrelated product/category/search files were edited.

## CSP Helper Summary

Added `src/backend/security/csp.ts`.

The helper provides:

- `CSP_REPORT_ONLY_HEADER`
- `isCspReportOnlyEnabled(...)`
- `classifyCspRoute(...)`
- `buildCspReportOnlyPolicyForFamily(...)`
- `getCspReportOnlyPolicy(...)`
- `getCspReportOnlyHeader(...)`
- `cspKnownImageSources`

The helper:

- Generates report-only policy strings.
- Avoids wildcard `*`.
- Avoids broad `https:`.
- Includes current known image hosts:
  - `https://images.unsplash.com`
  - `https://uploadthing.com`
  - `https://utfs.io`
  - `https://lh3.googleusercontent.com`
  - `https://placehold.co`
- Includes local report-only testing connect origins:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:3100`
- Excludes payment, gateway, tracking, and analytics domains until those integrations exist.
- Does not print or expose secrets.

## Route Family Classification Summary

| Route family | Examples | Policy shape |
| --- | --- | --- |
| `public` | `/`, `/category/electronics`, `/products/test-product`, `/search` | Page policy with Next runtime/script/style/image/connect allowances. |
| `auth` | `/auth/login`, `/auth/register` | Page policy with auth form allowance for self and Google account form target. |
| `account` | `/account/profile`, `/account/orders`, `/order/BLB-TEST/confirmation` | Private page policy. |
| `checkout` | `/cart`, `/checkout` | Checkout/cart page policy without payment gateway domains. |
| `admin` | `/admin/dashboard`, `/admin/products` | Admin page policy with `data:`/`blob:` image allowance for previews. |
| `api` | `/api/products`, `/api/admin/products`, `/api/auth/session` | Minimal API policy: `default-src 'none'` plus basic non-page directives. |
| `metadata` | `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | Minimal metadata policy with no script directive. |
| skipped static assets | `/_next/static/**`, `/_next/image/**`, `/assets/**`, `/uploads/**` | No report-only CSP header from middleware. |

## Env Flag Added

Added server-only flag to `.env.example`:

```env
ENABLE_CSP_REPORT_ONLY="false"
```

Default behavior:

- Missing or `false`: no CSP report-only header.
- `true`, `1`, or `yes`: add `Content-Security-Policy-Report-Only`.

No `NEXT_PUBLIC_` prefix was used because this is a server-side middleware/config flag.

## Report-Only Middleware Result

Report-only middleware behavior was added in `src/middleware.ts`.

The middleware now:

- Preserves existing unauthenticated `/admin/*` and `/account/*` redirects.
- Adds `Content-Security-Policy-Report-Only` only when `ENABLE_CSP_REPORT_ONLY` is explicitly enabled.
- Never adds an enforced `Content-Security-Policy` header.
- Uses route-family detection for public, auth, account/private, checkout, admin, API, and metadata routes.
- Skips static asset and upload paths.

The matcher was expanded so report-only CSP can cover safe page/API/metadata routes when enabled. With the flag disabled, no CSP header is emitted.

## Confirmation Enforced CSP Was Not Added

No enforced `Content-Security-Policy` header was added.

Automated tests and local HTTP/CDP checks confirmed:

- `Content-Security-Policy-Report-Only`: present only when enabled.
- `Content-Security-Policy`: absent.

## Test Coverage Added

Added `tests/csp.test.ts` with coverage for:

- route family classification,
- static asset/upload skip behavior,
- report-only policy generation for all route families,
- no wildcard `*`,
- no broad `https:`,
- known image hosts present,
- payment/tracking domains absent,
- API and metadata minimal policies,
- env flag disabled by default,
- report-only header only when explicitly enabled,
- middleware protected-route redirects preserved,
- middleware does not add enforced CSP.

Focused test result:

```bash
npx tsx --test tests/csp.test.ts
```

Passed: 9 tests.

## Browser/CDP Report-Only Smoke Result

Used a local production server with `ENABLE_CSP_REPORT_ONLY=true`.

HTTP header checks:

| Route | Result |
| --- | --- |
| `/` | 200; report-only header present; enforced CSP absent. |
| `/auth/login` | 200; report-only header present; enforced CSP absent. |
| `/cart` | 200; report-only header present; enforced CSP absent. |
| `/checkout` | 307 to `/auth/login?callbackUrl=/checkout&reason=checkout`; report-only header present; enforced CSP absent. |
| `/admin/dashboard` | 307 to `/auth/login?callbackUrl=%2Fadmin%2Fdashboard`; report-only header present; enforced CSP absent. |
| `/robots.txt` | 200; minimal report-only header present; enforced CSP absent. |
| `/sitemap.xml` | 200; minimal report-only header present; enforced CSP absent. |

Chrome/CDP checks:

| Route | Desktop | Mobile | Result |
| --- | --- | --- | --- |
| `/` | 200 | 200 | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/auth/login` | 200 | 200 | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/cart` | 200 | 200 | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/checkout` | Redirected to login | Redirected to login | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/admin/dashboard` | Redirected to login | Redirected to login | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/robots.txt` | 200 | 200 | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/sitemap.xml` | 200 | 200 | Report-only present; enforced absent; 0 console errors; 0 runtime exceptions. |

Product detail was skipped because it is DB-backed and the current `DATABASE_URL` remains remote-looking.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/csp.test.ts` | Passed; 9 tests. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js reported only the standard `next lint` deprecation notice. |
| `npm test` | Passed; 131 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |
| Local HTTP report-only smoke | Passed. |
| Local Chrome/CDP report-only smoke | Passed. |
| `git diff --check -- src/backend/security/csp.ts src/middleware.ts .env.example README.md tests/csp.test.ts` | Passed; Git printed CRLF normalization warnings only. |

## Production Build Result

Passed with the default disabled CSP flag.

Next.js compiled successfully, generated 75 static pages, and emitted the route manifest. Middleware size increased from the new route-aware helper, but no build error occurred.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated product/category/search behavior was changed.

Specifically not touched in Step 36:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: footer and payment-logo files still appear modified in the broader worktree from earlier steps, but Step 36 did not edit them.

## Remaining Risks

- CSP is report-only only and disabled by default; it provides no enforcement until a later approved step.
- The current report-only page policy intentionally uses `'unsafe-inline'` for scripts/styles to avoid breaking Next.js hydration and JSON-LD during observation. It is not the final enforced policy.
- No CSP report ingestion endpoint was added, so browser console/CDP checks are the current feedback mechanism.
- Full Google OAuth flow was not exercised.
- Product detail and signed-in account/admin/checkout flows remain unverified under CSP because safe local PostgreSQL/test users are not ready.
- Payment/tracking/analytics domains are intentionally absent and must be modeled later when those integrations are actually implemented.
- Local DB readiness is still blocked: `.env.local` missing, `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing.

## Recommended Next Step

Keep CSP in report-only mode and disabled by default.

Next safe step depends on priority:

1. If continuing CSP work, add sanitized CSP report collection behind a server-only flag and test that it never logs full URLs, query strings, PII, or secrets.
2. If DB setup becomes available, set up local PostgreSQL and rerun `npm run db:url:safety` so authenticated DB-backed CSP and product-detail smoke tests can be performed safely.
