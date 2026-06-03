# Staging Deployment Runbook

## Purpose

This runbook turns the current prelaunch blockers into a provider-neutral staging checklist for Boilabin.

It is for planning and review before any hosted deployment. It does not choose a provider, configure a provider, deploy code, connect DNS, run migrations, seed data, enable payment, enable tracking, or launch seller marketplace features.

## What This Runbook Does Not Do

- It does not deploy the app.
- It does not configure hosting, DNS, databases, object storage, email, payment, tracking, monitoring, or analytics.
- It does not approve production launch.
- It does not run Prisma migrations, `db push`, seed, reset, or destructive SQL.
- It does not enable online payment, tracking APIs, seller marketplace routes, enforced CSP, distributed rate limiting, or mobile app implementation.
- It does not restore Flash Deals. `/deals` and `/api/admin/flash-sales` must remain removed unless a future approved product step reintroduces them.

## Preconditions

- The working tree should be reviewed before staging-related commits.
- `npm run db:url:safety` should pass without printing private connection strings.
- Local validation should pass: Prisma local validate/generate, typecheck, lint, tests, and build.
- Any staging migration must be handled in a separate approved database step.
- Real secrets must live only in the selected provider secret manager.
- Staging must be treated as non-production but still sensitive.

## Provider Selection Checklist

- Supports the current Next.js version and server runtime needs.
- Supports server-side environment variables and secret management.
- Supports stable staging and production URLs.
- Supports deploy logs without exposing secrets.
- Supports rollbacks to a previous deploy.
- Supports domain/DNS setup for `https://boilabin.com` later.
- Supports a managed PostgreSQL option or integrates cleanly with a chosen managed PostgreSQL provider.
- Supports persistent media/upload strategy or integrates with an object storage/CDN provider.
- Supports Bangladesh user performance needs through a nearby or globally cached edge/CDN layer.
- Supports monitoring/error reporting hooks.
- Has a clear policy for build-time environment variables versus runtime environment variables.

## Staging URL And DNS Rules

- Use a staging URL that is separate from `https://boilabin.com`.
- Do not point production DNS at staging.
- Do not connect production DNS until staging passes validation, smoke checks, and human review.
- Staging must not be indexed by search engines.
- Staging auth callback URLs must exactly match the staging origin.
- Staging CSRF allowed origins must include only intended first-party staging/local origins.
- Do not use localhost values for hosted staging auth or CSRF configuration.

## Secret Manager Setup Rules

- Use the hosting provider secret manager or an approved secret manager.
- Never commit real secrets to docs, examples, reports, screenshots, chat, or source control.
- Keep staging and production secrets separate.
- Rotate staging secrets if they are pasted into an unsafe location.
- Restrict who can read or update production secrets.
- Store auth secrets, OAuth secrets, database connection strings, future email secrets, future payment secrets, future tracking secrets, and future Redis/KV secrets as server-only secrets.
- Never expose secret values through `NEXT_PUBLIC_*`.

## Staging Database Rules

- Staging database must be separate from production.
- Staging database must be separate from local development.
- Staging database connection strings must not be printed in terminal output, reports, screenshots, or chat.
- Staging data may contain sensitive test customer/order data and must be handled as sensitive.
- Backups should be enabled before staging is used for realistic QA.
- Do not use `prisma db push` for controlled launch migration history.

## Migration Safety Rules

- Migrations require a separate approved DB step.
- Migration generation should happen in a safe local environment with a local app DB and separate local shadow DB.
- Migration deployment to staging must use an approved runbook and reviewed migration files.
- Do not run migrations against production accidentally.
- Do not reset or seed staging/production without explicit approval.
- Do not use destructive SQL as a casual rollback.
- Confirm the target database identity before any migration command.
- Keep a backup and restore point before staging migration testing.

## Build And Validation Sequence

Recommended non-mutating validation before staging deploy:

1. `npm run db:url:safety`
2. `npm run db:prisma:local:validate`
3. `npm run db:prisma:local:generate`
4. `npm run typecheck`
5. `npm run lint`
6. `npm test`
7. `npm run build`
8. `node scripts/audit-prelaunch-env-readiness.mjs`

After the first staging deploy, run route smoke checks, browser checks, auth boundary checks, media checks, SEO metadata checks, and admin access checks with approved staging credentials.

## Staging Smoke Test Checklist

- Homepage renders.
- Category page renders.
- Search page renders.
- Product detail page renders.
- Cart renders.
- Checkout redirects or protects as expected.
- Login page renders.
- Account/profile route protects unauthenticated users.
- Admin dashboard protects unauthenticated users.
- Unauthorized order confirmation does not expose PII.
- `/robots.txt` renders with staging noindex policy or staging access protection.
- `/sitemap.xml` does not encourage indexing of staging.
- `/deals` remains removed/404.
- `/api/admin/flash-sales` remains removed/404.
- Payment remains disabled except Cash on Delivery.
- Tracking API remains disabled.
- Seller marketplace remains unlaunched.

## SEO/Robots/Noindex Rules For Staging

- Staging should not be indexed.
- Staging should use noindex headers/metadata, robots restrictions, provider access protection, or a combination approved for the provider.
- Keep `https://boilabin.com` as the future canonical production domain; do not replace the production canonical identity with localhost.
- Do not let staging sitemaps become submitted to search engines.
- Production DNS should not be connected until staging is reviewed.
- Run final production SEO checks only after the real domain points to hosting.

## Auth Callback/Host Checklist

- Set `AUTH_URL` and `NEXTAUTH_URL` to the exact staging origin.
- Use a strong staging `AUTH_SECRET` or `NEXTAUTH_SECRET` stored only in the secret manager.
- Decide `AUTH_TRUST_HOST` based on the selected provider and trusted proxy model.
- Configure Google OAuth callbacks only if staging Google auth will be tested.
- Keep staging OAuth credentials separate from production OAuth credentials.
- Confirm protected routes redirect without leaking PII.
- Confirm admin routes remain protected.
- Confirm owner/admin order confirmation behavior remains protected.

## Media And Upload Checklist

- Confirm local storefront assets load through the chosen staging host.
- Confirm remote media that remains intentionally allowed is documented.
- Confirm uploads have persistent storage before production.
- Confirm upload size, MIME, corruption, and dimension checks still run before image processing.
- Confirm generated media URLs are stable enough for future mobile apps.
- Do not replace or regenerate media without approved source/licensing.
- Do not restore Baby & Kids or undo Toys & Collectibles without a dedicated visual/media step.

## Payment And Tracking Disabled-State Checklist

- Keep `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS` disabled until gateway initiation, webhook verification, reconciliation, refunds, and settlement procedures are approved.
- Do not add payment provider domains to CSP as an incidental staging step.
- Do not enable bKash, Nagad, Stripe, or other online payment backends by environment toggle alone.
- Keep public tracking APIs disabled until a PII-safe design is approved.
- Keep Cash on Delivery as the only launch-safe payment mode unless a dedicated payment step approves more.

## Monitoring/Logging Checklist

- Choose logging and error reporting before production.
- Keep security logs sanitized.
- Do not store cookies, authorization headers, full URLs with query strings, raw request bodies, payment data, or delivery PII in logs.
- Define log retention and access control.
- Decide where CSP reports go before enabling report collection.
- Add alerting for build/deploy failures, API error spikes, auth failures, checkout errors, upload errors, and DB connectivity failures.

## Admin Credential Handoff Checklist

- Create staging admin credentials only through an approved secure process.
- Do not commit or paste admin credentials.
- Use role-appropriate access.
- Document who owns admin credential rotation.
- Rotate credentials before production launch.
- Confirm admin dashboard, product/category/banner workflows, order workflows, reports, and audit logs with approved staging credentials.

## Rollback Entry Points

- Code rollback: redeploy the last known-good deploy artifact or commit.
- Environment rollback: restore the previous secret/config snapshot in the provider.
- Database rollback: use backups or reviewed forward-fix migrations; do not casually reset or run destructive SQL.
- Media rollback: restore object storage/CDN state from backup or revert to known-good asset paths.
- DNS rollback: lower TTL before launch and keep previous routing plan documented.

## Go/No-Go Decision

Go requires:

- Staging deploy passes validation and smoke checks.
- Staging is not indexable.
- Auth and admin boundaries are verified.
- Payment/tracking/seller features remain disabled unless separately approved.
- Database backup/restore is verified.
- Monitoring and sanitized logging are configured.
- Admin credentials and rotation are approved.
- Known launch blockers have owners.

No-go if any critical security, PII, payment, migration, auth, media, or indexing issue is unresolved.

## Future Production Promotion Notes

- Production promotion should be a separate approved step.
- Production DNS should be connected only after staging passes.
- Production environment variables must be configured in the provider secret manager.
- Production migration and rollback plans must be reviewed before running.
- Future mobile app compatibility depends on stable API contracts, media URLs, auth/session planning, and payment/security decisions made during web launch.
