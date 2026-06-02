# Step 48: Provider-Neutral First Staging Deployment Runbook

Date: 2026-06-02

## 1. Scope of Step 48

Created a provider-neutral first staging deployment runbook and risk checklist for the pre-launch Boilabin ecommerce project.

This was documentation, planning, and audit only. No deployment was attempted. No hosting provider was chosen. No provider-specific config, dependency, runtime behavior, API behavior, auth behavior, CSP enforcement, Redis/KV rate limiting, database schema, migration, footer, payment-logo asset, visual styling, homepage/category visual, payment backend, tracking API, seller marketplace, or product lifecycle behavior was changed.

## 2. Files Changed

Changed in this Step 48 task:

- `audit-reports/48_PROVIDER_NEUTRAL_STAGING_RUNBOOK.md`

No production code, environment template, package dependency, hosting config, or runtime config file was changed.

## 3. Current Staging Readiness Verdict

Current verdict: **not ready to attempt first staging deployment yet**.

The app remains safe for local/pre-launch work, and baseline validation passes, but first staging needs more setup decisions before deployment is attempted.

Current known blockers:

- No hosting provider selected.
- Domain bought but not connected to hosting.
- `.env.local` missing.
- Active `DATABASE_URL` classifies as remote-looking.
- `SHADOW_DATABASE_URL` missing.
- Local DB readiness is `no`.
- Product lifecycle migration paused.
- DB-backed authenticated testing still blocked.
- Distributed production-grade rate limiting not implemented.
- Payment backend, tracking API, and seller marketplace intentionally paused.
- CSP is report-only capable but not enforcement-ready.

## 4. Pre-Staging Prerequisites

Before staging is attempted:

- Choose a hosting provider, but keep this runbook provider-neutral until that decision is made.
- Choose a staging URL, such as a provider preview URL or a staging subdomain.
- Decide whether staging will be public but noindexed, password-protected, IP-restricted, or accessible only to trusted testers.
- Create a staging database that is separate from production and separate from any remote database currently used for development.
- Decide whether staging will use seeded test data, imported sanitized data, or a fresh empty dataset.
- Generate staging-only secrets.
- Configure staging Auth.js URLs to match the exact staging origin.
- Configure staging CSRF allowed origins to include only staging and intentional local test origins.
- Keep online payment, tracking, seller marketplace, and product lifecycle migration paused unless a later step explicitly resumes them.
- Decide a staging migration policy before any schema changes are applied.
- Confirm deployment logs will not print secret values.
- Confirm no demo/admin credentials are published publicly.
- Run local validation before deploying: `npm run db:url:safety`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

## 5. Staging Env Variable Checklist

Required or likely required staging variables:

| Variable | Staging guidance |
| --- | --- |
| `DATABASE_URL` | Staging PostgreSQL app database only. Must not be production. Must not be printed. |
| `SHADOW_DATABASE_URL` | Use only if staging migration tooling is explicitly approved; otherwise keep migration generation local. Must be separate from `DATABASE_URL`. |
| `AUTH_URL` | Exact staging app origin. |
| `NEXTAUTH_URL` | Exact staging app origin; should match `AUTH_URL` origin. |
| `AUTH_SECRET` | Strong staging-only secret. |
| `NEXTAUTH_SECRET` | Strong staging-only secret if used as fallback. |
| `AUTH_TRUST_HOST` | Decide after provider/proxy behavior is known; do not blindly copy production assumptions. |
| `NEXT_PUBLIC_SITE_URL` | Choose policy intentionally: production canonical for final SEO rehearsal, or staging/noindex policy for private staging. |
| `APP_URL` | Exact staging app origin. |
| `CSRF_ALLOWED_ORIGINS` | Raw comma-separated staging origin and approved local test origins only. No wildcards. |
| `GOOGLE_CLIENT_ID` | Staging OAuth client if Google auth is tested. |
| `GOOGLE_CLIENT_SECRET` | Staging OAuth secret. Server-only. |
| `ENABLE_CSP_REPORT_ONLY` | Default `false`; enable only for intentional report-only checks. |
| `ENABLE_CSP_REPORT_COLLECTION` | Default `false`; enable only if sanitized logging/storage policy is approved. |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Must remain `false`. |

Future variables not needed for first staging unless later approved:

- Redis/Upstash/rate-limit credentials.
- Payment gateway credentials.
- Tracking/analytics credentials.
- Email/SMS provider credentials.
- Seller payout credentials.

## 6. Staging Database / Migration Policy

Current database status:

```text
DATABASE_URL: remote-looking
SHADOW_DATABASE_URL: missing
Shadow database separate: no
Local migration ready: no
```

Policy:

- Do not point staging at production data.
- Do not run `prisma db push` for controlled migration history.
- Do not run migrations until there is a reviewed staging database and migration plan.
- Prefer generating migrations locally after local PostgreSQL and a separate local shadow database are ready.
- Review migration SQL before applying to staging.
- Keep product lifecycle migration paused until local DB readiness is fixed.
- Use sanitized seed/test data for staging.
- Do not import customer PII into staging unless explicitly approved and protected.
- Confirm backup/rollback path before applying any staging migration.

Allowed to defer for first staging:

- Full product lifecycle migration.
- Full DB-backed authenticated contract tests, if clearly documented as deferred.
- Production-like data volume, if staging is only a smoke environment.

Not allowed:

- Production DB credentials in staging.
- Remote-looking development DB used casually for staging migration work.
- Seed/reset/db-push commands without explicit staging approval.

## 7. Auth.js Staging Policy

Staging Auth.js requirements:

- `AUTH_URL` and `NEXTAUTH_URL` must use the exact staging origin.
- `AUTH_URL` and `NEXTAUTH_URL` should resolve to the same origin.
- `AUTH_SECRET` / `NEXTAUTH_SECRET` must be strong and staging-specific.
- Google OAuth needs staging callback URLs configured before Google login can be tested.
- `AUTH_TRUST_HOST` should be decided after the hosting provider/proxy model is known.
- Do not expose auth secrets in logs or client code.
- Do not use production OAuth secrets in staging.

Post-staging auth checks:

- `/api/auth/session` returns safely without `UntrustedHost`.
- `/auth/login` renders.
- Login callback URLs stay internal and safe.
- `/account/profile` redirects unauthenticated users to login.
- `/checkout` redirects unauthenticated users to login.
- `/admin/dashboard` redirects unauthenticated users to login.
- Authenticated admin role checks are verified only with staging test accounts.

## 8. Canonical / Noindex / Robots Staging Policy

Current canonical behavior:

- `src/backend/seo/urls.ts` defaults to `https://boilabin.com`.
- Localhost is rejected as a canonical site URL.
- `robots.ts` disallows private routes and points sitemap to the canonical sitemap URL.
- `sitemap.ts` uses canonical URLs and can fall back to static entries if DB-backed entries fail.

Staging indexing policy must be explicit:

- If staging is public, prevent accidental indexing using provider controls, access restriction, or a noindex strategy approved in a later step.
- Do not submit staging URLs to search engines.
- Do not replace production canonical with localhost.
- If staging uses `NEXT_PUBLIC_SITE_URL=https://boilabin.com`, verify that staging pages are not indexable as duplicate public pages.
- If staging uses a staging canonical/noindex strategy, document it and verify the rendered metadata.

Post-staging SEO checks:

- `/robots.txt` returns 200.
- `/sitemap.xml` returns 200.
- Private routes remain disallowed in robots.
- Canonical URLs are intentional and not localhost.
- Search/faceted pages retain noindex behavior where expected.
- Product/category canonical output is verified only against safe staging data.

## 9. Payment / Tracking / Seller Paused-State Policy

Payment:

- Keep `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS=false`.
- Cash on Delivery may remain available for staged order-flow testing if staging DB/test accounts exist.
- Do not enable bKash, Nagad, card, Stripe, gateway initiation, webhook handling, or reconciliation.
- Do not add payment secrets.
- Do not add payment CSP domains.

Tracking:

- Keep tracking API/integration paused.
- Do not add analytics/tracking domains or secrets.
- Do not add tracking CSP sources.

Seller marketplace:

- Keep seller marketplace launch behavior paused.
- Do not enable seller routes beyond existing foundation without ownership, moderation, payout, and compliance review.

Product lifecycle:

- Keep lifecycle schema migration paused until local DB/shadow DB readiness is fixed.

## 10. Rate-Limit Policy Before Distributed Storage

Current rate limiter:

- In-memory, per-process.
- Protects register, contact, newsletter, reviews POST, orders POST, and search suggestions.
- Response contract is `429`, `{ error: 'Too many requests. Please try again shortly.' }`, and `Retry-After` / `X-RateLimit-*` headers.

Staging policy:

- It is acceptable for first staging smoke testing if the limitation is documented.
- Do not treat in-memory staging limits as production-grade.
- Do not add Redis/KV dependencies during first staging unless a later implementation step approves it.
- If staging uses multiple instances/serverless workers, document that rate limits are not shared.
- Before production promotion, choose a distributed rate-limit strategy or document explicit launch risk acceptance.

## 11. CSP Policy Before Enforcement

Current CSP state:

- Route-aware CSP helper exists.
- CSP is report-only capable.
- CSP is disabled by default.
- CSP report collection endpoint exists.
- Report collection is disabled by default.
- No enforced CSP exists.
- No payment/tracking domains are included.

Staging policy:

- Do not enforce CSP in first staging.
- Keep `ENABLE_CSP_REPORT_ONLY=false` by default.
- For deliberate CSP testing, set `ENABLE_CSP_REPORT_ONLY=true` on staging only and verify no runtime breakage.
- Keep `ENABLE_CSP_REPORT_COLLECTION=false` unless sanitized logging/storage policy is approved.
- Do not add payment/tracking domains to CSP before those integrations exist.
- Verify there is no `Content-Security-Policy` enforced header unless a later task explicitly approves enforcement.

## 12. Post-Staging Browser Smoke Checklist

Run in desktop and mobile viewports after staging exists:

- `/`
- `/auth/login`
- `/auth/register`
- `/cart`
- `/checkout`
- `/account/profile`
- `/admin/dashboard`
- `/category`
- one category detail page if staging data exists
- `/search`
- one product detail page if staging data exists
- `/order/BLB-UNAUTHORIZED-SMOKE/confirmation`
- `/robots.txt`
- `/sitemap.xml`

For each route, record:

- HTTP status.
- Redirect behavior.
- Console errors.
- Runtime exceptions.
- Obvious mobile layout breakage.
- Obvious desktop layout breakage.
- Auth requirement behavior.
- Whether any PII is exposed.

Expected unauthenticated behavior:

- `/account/profile` redirects to login.
- `/checkout` redirects to login.
- `/admin/dashboard` redirects to login.
- unauthorized order confirmation returns not found or otherwise does not expose order PII.

## 13. Post-Staging API / Security Smoke Checklist

Non-destructive API/security checks:

- `GET /api/auth/session` returns safely.
- Mutation guard blocks cross-origin unsafe requests with `403` and `{ error: 'Invalid request origin' }`.
- Rate limiter returns the existing `429` contract when intentionally exceeded in a controlled test.
- `POST /api/security/csp-report` returns disabled-by-default `404` when collection is disabled.
- Contact/newsletter/register validation-first failures return safe generic responses.
- Admin APIs reject unauthenticated requests.
- Account APIs reject unauthenticated requests.
- Order confirmation route does not expose PII without owner/admin access.
- Security headers are present.
- Enforced CSP header is absent unless explicitly approved.

Do not:

- Create real payment orders.
- Call live external payment APIs.
- Send real tracking/analytics data.
- Use production credentials.
- Use real customer PII.

## 14. Post-Staging SEO Smoke Checklist

After staging exists:

- Verify `NEXT_PUBLIC_SITE_URL` policy is intentional.
- Verify homepage canonical output.
- Verify product/category canonical output only with safe staging data.
- Verify no localhost canonical URLs.
- Verify `/robots.txt` disallows private routes.
- Verify `/sitemap.xml` returns safe URLs.
- Verify search and faceted category pages are noindex where expected.
- Verify Open Graph image route renders.
- Verify structured data does not expose private/internal data.
- Confirm staging is not accidentally submitted to search engines.

## 15. Secret / Log Safety Checklist

Before and after staging deployment:

- Confirm deployment logs do not print full `DATABASE_URL`.
- Confirm logs do not print `AUTH_SECRET`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, cookies, authorization headers, tokens, request bodies, phone numbers, delivery addresses, or payment data.
- Confirm no `NEXT_PUBLIC_*` variable contains a secret.
- Confirm staging secrets differ from production secrets.
- Confirm `.env.local` is not committed.
- Confirm no provider dashboard variables are screenshotted or pasted publicly.
- Confirm CSP reports, if enabled, are sanitized and do not store full URLs/query strings/fragments.
- Confirm security-event logs use sanitized bounded fields only.
- Confirm deployment build output does not expose secret values.

## 16. Production Promotion Blockers

Do not promote from staging to production until:

- Hosting provider is selected and production deployment architecture is documented.
- `https://boilabin.com` DNS is connected and verified.
- Production database is provisioned and migration process is reviewed.
- Local DB/shadow DB migration readiness is fixed or an approved migration process replaces it.
- Staging DB-backed browser/API flows pass with safe staging data.
- Auth.js production URL/trusted-host behavior is verified.
- Order confirmation PII protection is verified.
- Payment remains disabled or payment backend/webhook/reconciliation are fully implemented and verified.
- Tracking remains disabled or tracking implementation/privacy review is complete.
- Seller marketplace remains disabled or seller ownership/approval/payout/compliance flows are implemented.
- Distributed rate limiting is implemented or explicit production risk acceptance is documented.
- CSP report-only has been smoke-tested before any enforcement is considered.
- Production secrets are generated and stored only in the hosting secret manager.
- No demo credentials or placeholder secrets are present.
- Backup/restore and log access policies exist.

## 17. Provider-Specific Details Intentionally Deferred

This runbook does not choose or configure:

- Vercel.
- Netlify.
- Cloudflare Pages.
- Railway.
- Render.
- Fly.io.
- VPS/self-hosting.
- Managed PostgreSQL provider.
- Redis/Upstash/provider-specific distributed rate limiting.
- DNS provider-specific records.
- Provider-specific environment variable dashboards.
- Provider-specific build/deploy commands.

Those details should be added only after the hosting provider is chosen.

## 18. Confirmation No Runtime Behavior Was Changed

Confirmed.

Step 48 changed only this runbook report. It did not change:

- runtime code
- API behavior
- response shapes
- status codes
- headers
- frontend/admin callers
- auth behavior
- CSP behavior
- rate-limit behavior
- payment behavior
- tracking behavior
- seller behavior
- product lifecycle behavior

## 19. Confirmation No Prohibited Files Were Touched

Confirmed Step 48 did not touch:

- `.env.local`
- `.env.example`
- `.env.local.example`
- real secrets
- hosting provider config
- `prisma/schema.prisma`
- `prisma/migrations/**`
- database scripts
- seed/reset/db-push scripts
- API route behavior
- auth behavior
- footer files
- newsletter visual layout
- payment-logo assets
- visual/UI styling files
- homepage/category visuals
- payment backend
- tracking API
- seller marketplace
- CSP enforcement
- Redis/KV/distributed rate limiting
- production-only integrations

No deployment, migration, seed, reset, `db push`, SQL, Docker, or database connection command was run.

## 20. Validation Results

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed as a non-mutating safety check; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, shadow separate `no`, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## 21. Remaining Risks

- First staging deployment is still blocked by missing provider, missing staging database plan, and missing staging env/secrets.
- Local DB-backed authenticated flow testing remains blocked.
- Product lifecycle migration remains paused.
- In-memory rate limiting is not production-distributed.
- CSP is not enforcement-ready.
- Payment, tracking, seller marketplace, and product lifecycle work remain intentionally paused.
- Staging indexing policy is not implemented in code; it must be chosen and verified when staging exists.
- Provider-specific build, env, DNS, log, and rollback details remain deferred.
- Footer/payment-logo files remain modified in the broader worktree from earlier work, but Step 48 did not edit them.

## 22. Recommended Next Step

Choose a hosting direction or continue non-DB pre-launch readiness work.

Before first staging deployment, create a provider-specific staging plan that fills in:

- staging URL,
- staging database,
- staging env/secrets,
- noindex/access-control policy,
- migration policy,
- logging policy,
- smoke-test execution plan.
