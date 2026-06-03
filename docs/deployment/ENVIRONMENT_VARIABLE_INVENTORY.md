# Environment Variable Inventory

## Purpose

This inventory lists environment variable names and deployment decisions for Boilabin without including secret values. It is a prelaunch checklist for local, staging, and production setup.

Do not paste real values into this document.

## Inventory Source Files

This inventory was built from read-only inspection of:

- `.env.example`
- `.env.local.example`
- `package.json`
- `prisma/schema.prisma`
- `next.config.js`
- `src/backend/auth/host.ts`
- `src/backend/auth/config.ts`
- `src/backend/auth/index.ts`
- `src/backend/config/payment.ts`
- `src/backend/config/site.ts`
- `src/backend/security/request-guard.ts`
- `src/backend/security/csp.ts`
- `src/backend/seo/urls.ts`
- selected local guardrail/smoke scripts by static text search

Real private env files are intentionally excluded.

## Variable Categories

- Database variables
- Auth/OAuth variables
- Public canonical URL variables
- Request guard and CSRF variables
- CSP/security variables
- Payment disabled-state variables
- Provider-managed host signal variables
- Local-only script variables
- Future variables needing human decision

## Local-Only Variables

These are used for local development, local validation, local browser checks, or local admin recovery. They must not use production secrets.

| Variable | Purpose | Environment | Secret level | Placeholder exists | Required before staging | Required before production | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | App database connection string | local/staging/production | highly sensitive | yes | yes | yes | Must point to the correct environment database. Do not print values. |
| `SHADOW_DATABASE_URL` | Prisma shadow database for migration tooling | local/staging decision | highly sensitive | yes | needs human decision | needs human decision | Required for local migration generation. Staging/prod migration use needs separate approval. |
| `AUTH_URL` | Auth.js canonical app origin | all | non-secret | yes | yes | yes | Must match staging/production origin when hosted. |
| `NEXTAUTH_URL` | NextAuth canonical app origin | all | non-secret | yes | yes | yes | Must match `AUTH_URL` unless a reviewed reason exists. |
| `AUTH_SECRET` | Auth.js signing/encryption secret | all | highly sensitive | yes | yes | yes | Use strong unique value per environment. |
| `NEXTAUTH_SECRET` | Alternate/fallback auth secret | all | highly sensitive | yes | needs human decision | needs human decision | Keep consistent with auth plan. |
| `AUTH_TRUST_HOST` | Auth trusted host behavior | all | non-secret | yes | yes | yes | Production value depends on provider/proxy trust model. |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site origin | all | public | yes | yes | yes | Future production canonical is `https://boilabin.com`; staging indexing must still be blocked. |
| `APP_URL` | App/API origin used by guards and local testing | all | non-secret | yes | yes | yes | Set to the hosted staging/production origin outside local development. |
| `CSRF_ALLOWED_ORIGINS` | Additional allowed request origins | all | non-secret but security-sensitive | yes | yes | yes | Raw comma-separated origins only; avoid wildcards. |
| `ENABLE_CSP_REPORT_ONLY` | Enables route-aware CSP report-only header | staging/future production | non-secret | yes | no | no | Disabled by default; enable only for deliberate CSP checks. |
| `ENABLE_CSP_REPORT_COLLECTION` | Enables sanitized CSP report ingestion | staging/future production | non-secret | yes | no | no | Disabled by default; needs logging/storage approval before production. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | staging/production if Google auth used | non-secret | yes | needs human decision | needs human decision | Environment-scoped OAuth app. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | staging/production if Google auth used | highly sensitive | yes | needs human decision | needs human decision | Store only in secret manager. |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Public flag for online payment availability | all | public | yes | yes | yes | Must remain disabled until payment backend/webhooks/reconciliation are approved. |
| `BOILABIN_BROWSER_PATH` | Optional local browser executable path for smoke checks | local | non-secret | no | no | no | Local tooling only; do not require in staging. |
| `BOILABIN_LOCAL_ADMIN_EMAIL` | Optional local admin selector for local password helper | local | secret if it identifies an account | no | no | no | Use only in the current shell for local recovery. |
| `BOILABIN_LOCAL_ADMIN_PASSWORD` | Local admin password input for local helper | local | highly sensitive | no | no | no | Never commit, print, or reuse in production. |
| `NEXT_TELEMETRY_DISABLED` | Disables Next telemetry for local smoke child processes | local/CI | non-secret | no | no | no | Used by local smoke helpers. |
| `NODE_ENV` | Runtime mode signal | all | non-secret | no | provider-managed | provider-managed | Normally set by framework/provider. |

## Staging Required Variables

Staging should have these configured in the provider secret manager before hosted QA:

- `DATABASE_URL`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET` or an approved `NEXTAUTH_SECRET` strategy
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_SITE_URL`
- `APP_URL`
- `CSRF_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS`

Needs human decision before staging:

- `SHADOW_DATABASE_URL`, only if staging migration tooling is explicitly approved.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, only if Google OAuth is tested in staging.
- `ENABLE_CSP_REPORT_ONLY` and `ENABLE_CSP_REPORT_COLLECTION`, only for deliberate report-only CSP checks.

## Production Required Variables

Production should have these configured in the provider secret manager before launch:

- `DATABASE_URL`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET` or approved auth secret strategy
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_SITE_URL`
- `APP_URL`
- `CSRF_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS`

Needs human decision before production:

- OAuth variables if social login is enabled.
- CSP report-only/report-collection flags if production reporting is approved.
- Future email, payment, tracking, storage/CDN, and distributed rate-limit variables.

## Optional/Future Variables

No production Redis/KV, SMTP, payment gateway, tracking, analytics, object-storage, or mobile-app variables are approved yet.

Future variable names should be chosen in dedicated implementation steps for:

- Distributed rate limiting storage.
- Email/transactional notification provider.
- Payment gateway credentials and webhook verification.
- Tracking provider or PII-safe order lookup.
- Persistent upload/object storage and CDN.
- Mobile app OAuth/deep-link/callback configuration.

## Payment/Tracking Disabled-State Variables

| Variable | Purpose | Required state before staging | Required state before production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Keeps bKash/Nagad online payment UI disabled until backend/webhook/reconciliation exists | disabled | disabled unless a dedicated payment launch step approves otherwise |

No tracking provider variable is currently approved. Do not introduce one incidentally during staging setup.

## CSP/Security Variables

| Variable | Purpose | Required before staging | Required before production | Notes |
| --- | --- | --- | --- | --- |
| `CSRF_ALLOWED_ORIGINS` | Origin allowlist for mutation protections | yes | yes | Include only local/staging/production origins that are intentionally allowed. |
| `ENABLE_CSP_REPORT_ONLY` | Enables report-only CSP | no | no | Use only during deliberate CSP rollout checks. |
| `ENABLE_CSP_REPORT_COLLECTION` | Enables sanitized report collection endpoint behavior | no | no | Requires logging/storage policy before production use. |
| `AUTH_TRUST_HOST` | Controls trusted host behavior | yes | yes | Depends on selected host/proxy. |

## Auth/OAuth Variables

| Variable | Purpose | Secret level | Staging | Production |
| --- | --- | --- | --- | --- |
| `AUTH_URL` | Auth origin | non-secret | required | required |
| `NEXTAUTH_URL` | NextAuth origin | non-secret | required | required |
| `AUTH_SECRET` | Auth secret | highly sensitive | required | required |
| `NEXTAUTH_SECRET` | Alternate auth secret | highly sensitive | needs human decision | needs human decision |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | non-secret | optional | optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | highly sensitive | optional | optional |

## Database Variables

| Variable | Purpose | Secret level | Staging | Production |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | App database connection string | highly sensitive | required | required |
| `SHADOW_DATABASE_URL` | Migration shadow database | highly sensitive | needs human decision | needs human decision |

Rules:

- Do not print connection strings.
- Do not reuse production database for staging.
- Do not run migrations until a dedicated DB step approves the target and rollback plan.
- Do not use `db push` for controlled launch history.

## Public NEXT_PUBLIC Variables

| Variable | Purpose | Public safety |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site origin | Safe to expose, but must be correct for SEO. |
| `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` | Public payment feature flag | Safe to expose; must remain disabled until approved. |

No secret should ever be added with a `NEXT_PUBLIC_` prefix.

## Variables That Must Never Be Committed

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `BOILABIN_LOCAL_ADMIN_PASSWORD`
- Future SMTP secrets
- Future payment provider secrets
- Future webhook signing secrets
- Future tracking provider secrets
- Future Redis/KV credentials
- Future object storage access secrets

## Staging Secret Manager Checklist

- Create a staging environment in the provider.
- Add variables only through the provider secret manager.
- Keep staging values separate from production.
- Restrict write access.
- Record owner and rotation date outside source control.
- Confirm no value appears in deploy logs.
- Confirm no variable marked secret/highly sensitive is exposed through `NEXT_PUBLIC_*`.

## Production Secret Manager Checklist

- Create production values after staging passes.
- Use distinct production secrets.
- Store database and OAuth secrets server-side only.
- Keep an emergency rotation plan.
- Confirm production `AUTH_URL`, `NEXTAUTH_URL`, `APP_URL`, and `NEXT_PUBLIC_SITE_URL` match the production origin.
- Keep online payment disabled until a dedicated payment launch step approves it.

## Unknowns Or Variables Needing Human Decision

- Hosting provider managed variables may include `VERCEL`, `NETLIFY`, `CF_PAGES`, `RENDER`, `RAILWAY_ENVIRONMENT`, or `FLY_APP_NAME`. These are provider signals, not application secrets.
- Distributed rate-limit variable names are not selected.
- Email/SMTP variable names are not selected.
- Payment provider variable names are not selected.
- Tracking/analytics variable names are not selected.
- Object storage/CDN variable names are not selected.
- Mobile app callback/deep-link variable names are not selected.
- Staging `SHADOW_DATABASE_URL` policy is not approved.
