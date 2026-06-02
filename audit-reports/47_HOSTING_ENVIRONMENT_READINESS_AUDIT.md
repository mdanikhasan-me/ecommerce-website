# Step 47: Hosting and Environment Readiness Audit

Date: 2026-06-02

## 1. Scope of Step 47

Created a pre-launch hosting and environment readiness audit for the Bangladesh-focused ecommerce project.

This was planning and audit only. No deployment was attempted. No hosting provider integration was added. No runtime behavior, API behavior, auth behavior, CSP enforcement, distributed rate limiting, payment, tracking, seller marketplace, database schema, migration, footer, payment-logo asset, visual styling, homepage/category visual, or product lifecycle behavior was changed.

## 2. Files Changed

Changed in this Step 47 task:

- `audit-reports/47_HOSTING_ENVIRONMENT_READINESS_AUDIT.md`

No production code, environment template, package dependency, or runtime config file was changed.

## 3. Current Env/Config Inventory

Env keys present in `.env.example` and `.env.local.example`:

| Variable | Current example role | Visibility category | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Local app PostgreSQL database | Server-only secret | Must never be public. Active environment still classifies as remote-looking. |
| `SHADOW_DATABASE_URL` | Local Prisma shadow database | Server-only secret | Required for local migration generation; missing in active environment. |
| `AUTH_URL` | Local Auth.js app origin | Server-only config | Use localhost locally; hosted origin later. |
| `NEXTAUTH_URL` | Local NextAuth app origin | Server-only config | Used by auth/site config; use hosted origin later. |
| `AUTH_SECRET` | Auth.js secret | Server-only secret | Must be strong and unique per environment. |
| `NEXTAUTH_SECRET` | Legacy/alternate auth secret | Server-only secret | Kept as fallback; must be strong if used. |
| `AUTH_TRUST_HOST` | Trusted host switch | Server-only config | Local example is `true`; production value depends on trusted host/proxy setup. |
| `NEXT_PUBLIC_SITE_URL` | Future canonical site URL | Public config | Safe to be public; currently `https://boilabin.com`. |
| `APP_URL` | Local app/API origin for request guards | Server-only config | Use localhost locally; hosted origin later if needed. |
| `CSRF_ALLOWED_ORIGINS` | Allowed mutation origins | Server-only config | Raw comma-separated origins only; no wildcards. |
| `ENABLE_CSP_REPORT_ONLY` | Route-aware CSP report-only flag | Server-only config | Disabled by default. Does not enforce CSP. |
| `ENABLE_CSP_REPORT_COLLECTION` | CSP report endpoint flag | Server-only config | Disabled by default. Enable only with logging policy approval. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Server-side provider config | Not a secret like the client secret, but should still be environment-scoped. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Server-only secret | Must never be public. |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Online payment UI availability flag | Public config | Must remain `false` until payment backend/webhooks/reconciliation are implemented. |

Runtime/config files inspected:

- `next.config.js`
- `src/middleware.ts`
- `src/backend/security/csp.ts`
- `src/backend/security/rate-limit.ts`
- `src/backend/security/request-guard.ts`
- `src/backend/auth/config.ts`
- `src/backend/auth/host.ts`
- `src/backend/auth/index.ts`
- `src/backend/config/site.ts`
- `src/backend/config/payment.ts`
- `src/backend/seo/urls.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `package.json`

## 4. Local-Only Env Requirements

Local development should use:

- `DATABASE_URL` pointing to a dedicated local app database, such as `boilabin_local`.
- `SHADOW_DATABASE_URL` pointing to a separate local shadow database, such as `boilabin_shadow`.
- `AUTH_URL=http://localhost:3000`.
- `NEXTAUTH_URL=http://localhost:3000`.
- `APP_URL=http://localhost:3000`.
- `CSRF_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3100`.
- `AUTH_TRUST_HOST=true` for local/trusted local production verification.
- `NEXT_PUBLIC_SITE_URL=https://boilabin.com` for future canonical SEO identity.
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS=false`.
- `ENABLE_CSP_REPORT_ONLY=false`.
- `ENABLE_CSP_REPORT_COLLECTION=false`.

Local-only notes:

- Hosting is not required for local development.
- The bought domain is not related to DB readiness.
- Do not use hosted/remote DB URLs for local migration or DB-backed tests.
- `.env.local` is currently missing.

## 5. Future Staging Env Requirements

Before first staging deployment, define a staging environment intentionally:

- Staging app URL, for example `https://staging.boilabin.com` or the provider preview URL.
- `AUTH_URL` and `NEXTAUTH_URL` matching the exact staging app origin.
- Strong staging `AUTH_SECRET` / `NEXTAUTH_SECRET`.
- Staging `DATABASE_URL` pointing only to an approved staging database, not production.
- If migrations are generated locally first, keep `SHADOW_DATABASE_URL` local; if staging migration tooling is later approved, use a separate non-production shadow database.
- `NEXT_PUBLIC_SITE_URL` policy decision: either keep canonical as `https://boilabin.com` for production-like SEO checks or use a staging-specific noindex/canonical policy. Do not let staging be indexed accidentally.
- `APP_URL` and `CSRF_ALLOWED_ORIGINS` including only staging/local origins that are intentionally allowed.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for staging OAuth callback URLs if Google auth is tested.
- `ENABLE_CSP_REPORT_ONLY=false` by default; enable only for deliberate staging CSP checks.
- `ENABLE_CSP_REPORT_COLLECTION=false` by default; enable only when logs are approved and sanitized.
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS=false` until payment backend/webhook/reconciliation work is complete.

Staging must not reuse production secrets.

## 6. Future Production Env Requirements

Before first production deployment, define:

- Hosted production origin: `https://boilabin.com`.
- DNS records pointing the bought domain to the chosen hosting provider.
- `AUTH_URL=https://boilabin.com`.
- `NEXTAUTH_URL=https://boilabin.com`.
- Strong production `AUTH_SECRET` / `NEXTAUTH_SECRET`.
- Production `DATABASE_URL` for the production PostgreSQL database.
- A reviewed migration/deploy plan before any production schema change.
- `NEXT_PUBLIC_SITE_URL=https://boilabin.com`.
- `APP_URL=https://boilabin.com`.
- `CSRF_ALLOWED_ORIGINS=https://boilabin.com` plus any intentional first-party production origins only.
- Production Google OAuth credentials and allowed callback URL.
- `AUTH_TRUST_HOST` set only according to the chosen trusted host/proxy/provider behavior.
- `ENABLE_CSP_REPORT_ONLY=false` unless deliberate production report-only rollout is approved.
- `ENABLE_CSP_REPORT_COLLECTION=false` unless logging/storage policy is approved.
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS=false` until online payment implementation is complete.
- Future Redis-compatible rate-limit env only after provider approval.

Production should not launch with demo credentials, placeholder secrets, or staging database credentials.

## 7. Server-Only Secret Inventory Categories

Must remain server-only and must not be exposed through `NEXT_PUBLIC_*`, browser bundles, logs, screenshots, docs, or chat:

- Database connection strings: `DATABASE_URL`, `SHADOW_DATABASE_URL`.
- Auth secrets: `AUTH_SECRET`, `NEXTAUTH_SECRET`.
- OAuth secrets: `GOOGLE_CLIENT_SECRET`.
- Future OAuth/provider secrets.
- Future Redis/rate-limit credentials: Redis URLs, Redis tokens, Upstash REST URLs/tokens.
- Future payment gateway credentials: bKash/Nagad/card/Stripe secrets, webhook secrets, merchant IDs where sensitive.
- Future tracking/analytics secrets or API keys if not explicitly public.
- Email/SMS provider secrets.
- Admin/internal tokens.
- Session cookies, authorization headers, bearer tokens, CSRF tokens.
- Internal admin data, PII, phone numbers, delivery addresses, payment data, and raw request bodies.

## 8. Public Env Value Review

Current public values found:

| Variable | Public safety review |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Safe as a public canonical origin. Current value should remain `https://boilabin.com`; do not replace with localhost for SEO. |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Safe as a public feature flag. Must remain `false` until online payment backend, webhook verification, and reconciliation are implemented. |

No Redis, DB, auth secret, OAuth secret, payment secret, or tracking secret should ever use `NEXT_PUBLIC_*`.

## 9. Domain/Canonical/Auth.js Host Readiness Notes

Current state:

- Website is pre-launch.
- Domain has been bought but hosting is not connected.
- Future canonical domain is `https://boilabin.com`.
- SEO helper defaults to `https://boilabin.com` and rejects localhost canonical origins.
- `robots.ts` disallows private routes such as admin, API, account, checkout, auth, cart, order, and track-order.
- `sitemap.ts` uses canonical URLs and falls back to static entries if DB-backed sitemap queries fail.

Auth readiness:

- Local auth testing should use localhost/127.0.0.1.
- `authConfig` uses `secret: AUTH_SECRET ?? NEXTAUTH_SECRET`.
- `authConfig` uses `trustHost: shouldTrustAuthHost()`.
- `shouldTrustAuthHost()` trusts local origins for local work and can detect managed host signals.
- Production needs matching `AUTH_URL` and `NEXTAUTH_URL` origins.
- Production should not blindly enable `AUTH_TRUST_HOST`; it should match the selected trusted reverse proxy or managed hosting setup.

Hosting is needed before public indexing, OAuth production callback testing, and production Auth.js host verification.

## 10. Database Readiness Notes

Current Step 45 / Step 47 DB readiness:

```text
Database URL safety check: no database connection attempted.
DATABASE_URL: remote-looking
SHADOW_DATABASE_URL: missing
Shadow database separate: no
Local migration ready: no
```

Deployment implications:

- Local DB-backed authenticated tests remain blocked.
- Product lifecycle migration remains paused.
- Product detail and authenticated DB flows cannot be fully verified safely against local data.
- First staging deployment needs a clearly approved staging database plan.
- First production deployment needs a clearly approved production database plan.
- No migrations should be run until local migration generation and review are safe.

No database connection was attempted in Step 47.

## 11. Rate-Limit / Distributed Storage Hosting Dependency Notes

Current rate limiter:

- In-memory and per-process.
- Used by register, contact, newsletter, reviews POST, orders POST, and search suggestions.
- Safe for local development and no-DB tests.
- Not production-distributed.

Hosting dependency:

- Multi-instance/serverless production needs Redis-compatible shared storage or a similar distributed store.
- Step 46 recommends adapter-first Redis-compatible storage after hosting/provider direction is chosen.
- If hosting lands on Vercel/serverless, prefer a current Redis Marketplace/Upstash-style option rather than relying on the old Vercel KV product name.
- Add compatibility tests before implementation.
- Preserve the current `429`, `{ error }` body, rate-limit headers, and sanitized logging behavior.

Production launch with only in-memory rate limiting remains a security/abuse risk.

## 12. CSP / Security Header Readiness Notes

Security headers in `next.config.js`:

- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY`.
- `X-DNS-Prefetch-Control: off`.
- `X-Permitted-Cross-Domain-Policies: none`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`.
- `Strict-Transport-Security` only when `NODE_ENV === 'production'`.

Image config:

- Remote images currently allow `images.unsplash.com`, `uploadthing.com`, `utfs.io`, and `lh3.googleusercontent.com`.
- SVG optimization is hardened with attachment disposition and SVG CSP.

CSP current state:

- Route-aware CSP helper exists.
- CSP is report-only only.
- CSP is disabled by default.
- CSP report collection endpoint exists.
- Report collection is disabled by default.
- No enforced `Content-Security-Policy` has been added.
- Payment/tracking domains have not been added.

Before deployment:

- Keep CSP disabled or report-only until route smoke checks pass.
- Do not enable report collection in production until log storage/retention/access policy is approved.
- Do not add payment/tracking CSP sources until those integrations exist.

## 13. Payment / Tracking / Seller Marketplace Paused-State Notes

Payment:

- `Cash on Delivery` is the only currently active payment method.
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` must remain `false`.
- Online payment gateway initiation, webhook verification, reconciliation, and settlement are not implemented.
- Payment secrets must not be added or exposed before payment work resumes.

Tracking:

- Tracking API/integration remains paused.
- Do not add tracking domains to CSP yet.
- Do not add tracking secrets or public analytics until privacy/logging policy and implementation are approved.

Seller marketplace:

- Seller foundation exists, but full seller marketplace routes/ownership flows remain paused.
- Do not enable seller marketplace behavior before seller ownership, moderation, payout, and compliance flows are ready.

Product lifecycle:

- Product lifecycle migration remains paused until local DB and shadow DB are ready.

Footer/payment-logo visuals:

- Footer and payment-logo visual work remains out of scope for this audit.

## 14. First Staging Deployment Checklist

Before staging:

- Choose hosting provider and staging URL.
- Create staging database that is separate from production.
- Decide how staging migrations will be generated/applied after local review.
- Create staging env values without production secrets.
- Set `AUTH_URL` and `NEXTAUTH_URL` to the staging origin.
- Generate strong staging auth secret.
- Configure Google OAuth staging callback if auth will be tested.
- Set `APP_URL` and `CSRF_ALLOWED_ORIGINS` to staging/local allowed origins.
- Keep online payments disabled.
- Keep tracking disabled.
- Keep seller marketplace paused.
- Keep CSP disabled or report-only only.
- Keep CSP report collection disabled unless sanitized log policy is approved.
- Decide whether staging should be noindex and prevent search engine indexing.
- Verify security headers on staging.
- Verify Auth.js host behavior on staging.
- Verify protected route redirects and role checks.
- Verify order confirmation does not expose PII.
- Verify safe browser smoke routes: home, login, cart, checkout redirect, account redirect, admin redirect, robots, sitemap.
- Verify no secrets are printed in deployment logs.

## 15. First Production Deployment Checklist

Before production:

- Choose and document hosting provider.
- Connect `https://boilabin.com` DNS to hosting.
- Provision production PostgreSQL.
- Create a reviewed migration/deploy process.
- Verify production env values are complete and secret-safe.
- Set `AUTH_URL=https://boilabin.com`.
- Set `NEXTAUTH_URL=https://boilabin.com`.
- Generate strong production auth secret.
- Configure production Google OAuth callback.
- Set `NEXT_PUBLIC_SITE_URL=https://boilabin.com`.
- Set `APP_URL=https://boilabin.com`.
- Set `CSRF_ALLOWED_ORIGINS=https://boilabin.com` plus only intentional first-party origins.
- Decide `AUTH_TRUST_HOST` based on provider/proxy trust model.
- Keep payment disabled until gateway/webhook/reconciliation work is complete.
- Keep tracking disabled until implementation/privacy review is complete.
- Keep seller marketplace disabled until ownership and operational flows are complete.
- Add distributed rate limiting or explicitly accept the risk with a launch exception.
- Verify CSP report-only smoke before considering enforcement.
- Verify robots/sitemap/canonical output after the domain resolves.
- Verify admin/account/checkout/order confirmation route protection with real production-like auth.
- Verify DB-backed product/category/search/order/admin flows against staging before production.
- Verify no demo credentials or placeholder secrets remain.
- Verify production logs are sanitized and access-controlled.
- Verify backup/restore plan for production database.

## 16. Blockers Before Deployment

Current blockers:

- No hosting provider has been selected.
- Domain is bought but not connected to hosting.
- `.env.local` is missing.
- Active `DATABASE_URL` is remote-looking.
- `SHADOW_DATABASE_URL` is missing.
- Local DB readiness is `no`.
- DB-backed authenticated testing remains blocked.
- Product lifecycle migration remains paused.
- Rate limiting remains in-memory/per-process.
- No production Redis-compatible distributed rate-limit provider is selected.
- No staging/production database plan is documented.
- No staging/production secret set is available.
- Online payment backend remains intentionally disabled.
- Tracking API remains intentionally paused.
- Seller marketplace implementation remains intentionally paused.
- CSP enforcement is not ready and should remain disabled.

## 17. Confirmation No Runtime Behavior Was Changed

Confirmed.

Step 47 changed only this audit report. It did not change:

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

## 18. Confirmation No Prohibited Files Were Touched

Confirmed Step 47 did not touch:

- `.env.local`
- real secrets
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
- distributed rate limiting
- production-only integrations

No deployment, migration, seed, reset, `db push`, SQL, Docker, or database connection command was run.

## 19. Validation Results

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed as a non-mutating safety check; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, shadow separate `no`, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## 20. Remaining Risks

- The app is safe to continue local/pre-launch work, but not ready for staging or production deployment.
- DB-backed authenticated flow testing remains blocked.
- Production launch without distributed rate limiting would leave public mutation/search endpoints weaker under scaling.
- Production launch without a staging database and migration process would be risky.
- CSP remains report-only/disabled by default and not enforcement-ready.
- Payment, tracking, seller marketplace, and product lifecycle work remain intentionally paused.
- A production deployment checklist still needs provider-specific details once hosting is chosen.
- Footer/payment-logo files remain modified in the broader worktree from earlier work, but Step 47 did not edit them.

## 21. Recommended Next Step

Continue non-DB pre-launch readiness work, or choose a hosting direction so a provider-specific staging plan can be created.

Do not attempt first staging deployment until:

- hosting provider is chosen,
- staging env values are defined,
- staging database plan is approved,
- secrets are generated safely,
- local DB readiness and DB-backed tests are unblocked or explicitly deferred with risk acceptance.
