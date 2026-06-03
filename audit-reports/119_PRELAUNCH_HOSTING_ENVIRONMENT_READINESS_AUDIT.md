# Step 119 - Prelaunch Hosting, Environment, And Deployment Readiness Audit

## Scope

Docs-only readiness audit for real-world launch blockers before hosting, staging, or production deployment.

This step did not deploy, configure hosting, connect production services, change runtime behavior, edit source/config/env/package files, edit assets, touch database rows, edit Prisma schema, or create migrations.

## Latest Commit Verified

- Latest commit verified before this step: `cdf2104 docs: plan remaining media localization`

## Initial Git Status

- Initial `git status --short`: clean.
- Initial staged files: none.

## Files Inspected

Read-only inspection covered:

- `README.md`
- `.env.example`
- `.env.local.example`
- `package.json`
- `next.config.js`
- `src/backend/security/csp.ts`
- `src/middleware.ts`
- `src/backend/auth/host.ts`
- `src/backend/auth/config.ts`
- `src/backend/seo/urls.ts`
- `src/backend/seo/robots.ts`
- `src/backend/security/rate-limit.ts`
- `src/backend/config/payment.ts`
- `src/backend/admin/image-processing.ts` and related upload references by search
- `audit-reports/23_PRELAUNCH_ENVIRONMENT_CLARIFICATION.md`
- `audit-reports/70_LOCAL_DB_READINESS_SETUP_VERIFICATION.md`
- `audit-reports/71_LOCAL_DB_SERVICE_AND_PRISMA_ENV_AUDIT.md`
- `audit-reports/76_LOCAL_DB_SERVICE_START_AND_BUILD_CHECK.md`
- `audit-reports/114_RUNTIME_READINESS_PERFORMANCE_SWEEP.md`
- `audit-reports/115_BROWSER_PERFORMANCE_ACCESSIBILITY_REMEASURE.md`
- `audit-reports/116_STOREFRONT_IMAGE_SOURCE_OF_TRUTH_REPAIR.md`
- `audit-reports/117_STOREFRONT_MEDIA_STABILITY_REMOTE_MEDIA_AUDIT.md`
- `audit-reports/118_REMAINING_MEDIA_LOCALIZATION_DECISION_PLAN.md`

One attempted read of `src/backend/seo/sitemap.ts` failed because that file does not exist; sitemap behavior is covered elsewhere by app routes/tests.

## Current Prelaunch State

Boilabin remains a pre-launch/local-development ecommerce marketplace.

- Domain is bought, but hosting/staging/production are not configured in this repo.
- Future canonical domain remains `https://boilabin.com`.
- Local app/auth testing uses localhost or 127.0.0.1.
- Build, lint, typecheck, and tests currently pass in this local environment.
- Flash Deals remains removed; guardrail tests still cover removed route/API behavior.
- Media implementation is paused until approved source assets/licensing are available.
- Payment provider integration, tracking API, seller marketplace launch work, CSP enforcement, distributed rate limiting, and mobile app implementation remain intentionally not enabled.

## Hosting And Domain Readiness

Status: needs decision before staging and production.

Ready:

- App can build locally with Next.js.
- SEO helpers keep canonical identity on `https://boilabin.com` instead of localhost.
- README explains local URL roles versus the future canonical domain.

Blocked/undecided:

- Hosting provider is not selected/configured.
- Staging URL is not defined.
- Production deployment target is not defined.
- Domain DNS is not connected to hosting.
- CDN/media strategy is not finalized.

Before launch:

- Choose hosting/staging platform.
- Define staging URL and production URL.
- Configure domain/DNS only after hosting is ready.
- Run staging smoke/browser checks before public indexing.

## Environment Variable Readiness

Status: ready for local examples; needs real staging/production secret management before deployment.

Ready:

- `.env.example` and `.env.local.example` document local-only placeholders.
- Auth, canonical URL, CSRF origins, DB/shadow DB, CSP flags, OAuth placeholders, and payment-disabled flag are documented.
- Docs warn not to commit secrets.

Blocked/undecided:

- Hosting secret manager/provider is not selected.
- Staging/production values are not created.
- Production `AUTH_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, auth secrets, OAuth values, CSRF origins, database URLs, and future SMTP/payment/tracking values are not configured.

Must not do yet:

- Do not paste real secrets into `.env.example`, `.env.local.example`, README, reports, chat, or terminal output.

## Database And Migration Readiness

Status: local URL-shape and local build readiness currently pass; staging/production database decision remains blocked.

Current local result:

- `npm run db:url:safety`: app DB local, shadow DB local, separate, local migration ready yes.
- `npm run build`: passed, including DB-backed static generation.
- Guarded Prisma validate/generate passed.

Still blocked before staging/production:

- Production/staging database provider is not selected.
- Production/staging database URLs must not be reused for local migration generation.
- Migration/deploy workflow for a real hosted DB is not approved.
- Backup/restore plan is not defined.

Must not do yet:

- Do not run migrations, `db push`, seed/reset, destructive SQL, or remote DB commands without a dedicated approved database step.

## Auth And Session Readiness

Status: local guardrails ready; staging/production origins and credential setup need decision.

Ready:

- Auth host guardrails exist in `src/backend/auth/host.ts`.
- Local auth origins are trusted for local verification.
- Production host warnings are logged safely.
- Session strategy is JWT.
- Protected route middleware covers admin/account route families by session cookie presence.
- Tests cover host configuration and protected route boundaries.

Blocked/undecided:

- Production/staging `AUTH_URL` and `NEXTAUTH_URL` are not configured.
- Production `AUTH_SECRET`/`NEXTAUTH_SECRET` storage is not configured.
- OAuth provider configuration is placeholder-only.
- Admin/staging credential creation and secure handoff procedure need an approved plan.

## SEO/Canonical/Sitemap/Robots Readiness

Status: policy foundation ready; public indexing must wait for hosting.

Ready:

- Canonical helper falls back to `https://boilabin.com` and avoids localhost canonical URLs.
- Search/faceted/private utility routes have noindex or sitemap exclusions covered by tests.
- `/robots.txt` and `/sitemap.xml` passed recent smoke/browser checks.
- Track-order and auth pages remain noindex where appropriate.

Blocked/undecided:

- Domain must point to hosting before indexing.
- Staging should be noindex or protected.
- Final production smoke/SEO checks must run after deployment.

## Media And Upload Readiness

Status: storefront critical category/iPhone/Galaxy media stabilized; remaining media/CDN/upload policy needs launch decisions.

Ready:

- Step 116 canonicalized category assets and iPhone/Galaxy hero assets.
- Step 117 added storefront media source guardrails.
- Admin image validation/hardening exists with MIME/size/dimension/corrupt-image checks before Sharp processing.
- `/assets/**` and `/uploads/**` are excluded from middleware matching.

Blocked/undecided:

- Sony hero remains remote.
- Product seed/ProductImage remotes remain.
- Brand placeholders remain remote.
- Upload storage is local filesystem-style and not yet mapped to a hosted persistent storage/CDN decision.
- Future mobile apps need stable absolute media URLs after hosting/CDN decisions.

Must not do yet:

- Do not replace/download/generate media until approved assets/licensing exist.

## Payment And Tracking Readiness

Status: intentionally disabled; not ready for production online payment or public tracking.

Ready:

- Cash on Delivery is available.
- bKash/Nagad are gated by `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS`.
- Stripe/international cards are unavailable.
- Tests guard disabled payment boundaries.
- Guest/public tracking API remains disabled and guarded by tests.

Blocked/undecided:

- Payment gateway provider is not selected/configured.
- Gateway initiation, webhook verification, reconciliation, refunds, and settlement procedures are not implemented/approved.
- Tracking API/guest lookup is not approved.

Must not do yet:

- Do not enable payment or tracking provider logic before a dedicated security/payment/tracking step.

## Security/CSP/Rate Limiting Readiness

Status: good local security foundation; production hardening decisions remain.

Ready:

- Security headers are configured in `next.config.js`.
- HSTS is added only in production builds.
- Mutation origin/request guard and rate-limit response contracts are tested.
- CSP report-only helper exists and is disabled by default.
- CSP report collection is disabled by default and sanitized if enabled.
- Security logging sanitizers exist.
- Client/server error hygiene tests pass.

Blocked/undecided:

- CSP is not enforced and should stay report-only until staging report-only testing is reviewed.
- Rate limiter remains in-memory/per-process and is not production-distributed.
- Monitoring/log aggregation/storage policy is not selected.
- WAF/platform edge protections are not selected.

Must not do yet:

- Do not enable enforced CSP, payment/tracking CSP domains, or Redis/KV/distributed limiter without a dedicated implementation step.

## Email/Notification Readiness

Status: app-side form/data capture exists; outbound delivery/provider is not launch-ready.

Ready:

- Contact and newsletter APIs have validation, request guards, and rate limiting.
- Admin notifications exist in app data/UI.
- Tests cover validation-first API behavior.

Blocked/undecided:

- SMTP/email provider is not configured.
- Transactional email, order email, contact forwarding, newsletter sending, unsubscribe/compliance flows, and bounce handling are not configured.
- Production notification/alerting channel is not selected.

## Admin/Operations Readiness

Status: admin surfaces exist; production operations require credential, monitoring, backup, and process decisions.

Ready:

- Admin routes are protected by middleware and route-level auth patterns.
- Admin CRUD/validation tests cover many non-DB helpers.
- Local admin password helper exists with safety guardrails.
- Audit/security logging hygiene exists.

Blocked/undecided:

- Secure staging/production admin credential creation/handoff is not complete.
- Authenticated admin browser QA was previously blocked by secure credential/session setup.
- Operational runbooks for incidents, backups, refunds, returns, content moderation, and seller/admin access are not launch-final.

## Future Mobile App Compatibility Notes

Preserve these decisions for future iPhone/Android apps:

- Keep API response shapes stable and backward-compatible.
- Keep buyer order/payment/return status contracts explicit.
- Avoid web-only assumptions in backend API design.
- Define stable absolute media URLs after hosting/CDN selection.
- Keep auth/session strategy compatible with mobile clients before adding mobile auth flows.
- Do not rely on browser-only storage or redirects for future API-only flows.
- Keep rate limiting/security behavior predictable across web and mobile clients.
- Do not enable payment/tracking APIs until mobile-safe contracts and webhook/reconciliation behavior are defined.

## Blocker Matrix

| Area | Current status | Classification | Risk | Recommended next action |
| --- | --- | --- | --- | --- |
| Hosting platform | Not selected | Needs decision before staging | High | Choose provider and staging URL before deployment work. |
| Domain/DNS | Domain bought, not hosted | Needs decision before production | High | Connect DNS only after hosting/staging validation. |
| Production DB | Not selected | Needs decision before staging/production | High | Choose managed PostgreSQL and backup policy before remote migration planning. |
| Local DB | Current URL/build checks pass locally | Ready for local only | Low | Keep using local guardrails; do not infer production readiness. |
| Migrations | Guarded local scripts exist | Needs dedicated DB step | High | Create migration/deploy runbook after DB provider decision. |
| Env vars/secrets | Examples ready, real secrets absent | Needs decision before staging | High | Use hosting secret manager; never commit real values. |
| Auth host/callbacks | Local guardrails ready | Needs staging/prod env config | Medium | Set hosted `AUTH_URL`/`NEXTAUTH_URL` and trusted host policy in staging. |
| Canonical SEO | Code foundation ready | Needs hosted verification before indexing | Medium | Keep canonical domain, verify after hosting, avoid indexing staging. |
| Media/CDN/uploads | Local assets/uploads work locally | Needs decision before production | Medium | Decide persistent storage/CDN and absolute URL policy. |
| Remaining media remotes | Known and planned | Needs assets before production polish | Medium | Wait for approved Sony/product/brand assets. |
| Payment | COD only; online disabled | Must not do yet | High | Keep disabled until gateway/webhook/reconciliation design is approved. |
| Tracking | Disabled/no public lookup API | Must not do yet | High | Keep disabled until PII-safe design is approved. |
| Seller marketplace | Foundation only | Must not do yet | Medium/high | Do not launch marketplace until ownership/approval/payout flows exist. |
| CSP | Report-only foundation disabled by default | Needs staged report-only rollout | Medium | Test report-only in staging before enforcement. |
| Rate limiting | In-memory only | Needs production implementation | High | Plan Redis/KV/distributed limiter before public launch. |
| Email/SMTP | Not configured | Needs decision before staging/production | Medium | Choose SMTP/transactional provider and compliance flow. |
| Admin credentials | Local helper exists | Needs secure staging/prod process | High | Create admin credential handoff and rotation procedure. |
| Monitoring/logging | Sanitized helpers exist | Needs provider/storage policy | Medium | Choose logs/error monitoring and retention policy. |
| Backups/restore | Not defined | Needs production decision | High | Define DB backups, restore drills, and media backup policy. |
| Legal/trust pages | Basic pages exist | Needs business/legal review | Medium | Review terms/privacy/returns/shipping/contact/business identity with qualified guidance; not legal advice. |
| Mobile app compatibility | Considered in reports | Needs future API/media/auth planning | Medium | Preserve contracts and absolute media strategy for future apps. |

## Recommended Safe Launch Sequence

1. Choose hosting and staging platform.
2. Choose managed production/staging PostgreSQL provider and backup/restore policy.
3. Create staging environment only; do not point public DNS yet.
4. Configure staging env vars in provider secret manager:
   - app/auth URLs,
   - auth secrets,
   - DB URLs,
   - CSRF origins,
   - canonical URL strategy,
   - CSP flags disabled/report-only as intended,
   - payment/tracking disabled.
5. Create a dedicated remote DB migration runbook; run no migrations until reviewed.
6. Deploy staging and run full validation:
   - typecheck/lint/tests/build,
   - route smoke,
   - browser/mobile checks,
   - auth boundary checks,
   - media checks,
   - SEO robots/sitemap checks.
7. Configure monitoring/logging and backup/restore.
8. Create secure staging admin credentials and run authenticated admin QA.
9. Review legal/trust/business pages for Bangladesh launch readiness with appropriate qualified advice.
10. Only after staging passes, connect production domain/DNS and run production smoke/browser/SEO checks.
11. Keep online payment, tracking, seller marketplace, enforced CSP, and distributed rate limiting implementation as dedicated steps, not incidental launch toggles.

## Validation Results

- `npm run db:url:safety`: passed; no DB connection attempted by the checker.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next.js lint deprecation notice.
- `npm test`: passed, 273 tests across 51 suites.
- `npm run build`: passed.

Dev/prod/browser smoke checks were intentionally skipped in Step 119 because this was a docs-only planning step and Step 117 had already run fresh dev smoke, production smoke, and production browser runtime checks successfully.

## Prohibited Actions Not Performed

Did not:

- Touch `.env`, `.env.local`, or private env files.
- Print secrets, full DB URLs, tokens, cookies, credentials, auth headers, session payloads, payment secrets, private connection strings, OAuth secrets, SMTP secrets, or PII.
- Run deployment commands.
- Connect to production/staging/remote databases.
- Run migrations, create migrations, edit Prisma schema, run `db push`, seed/reset, or destructive SQL.
- Update packages.
- Change Docker config.
- Use GitHub/fetch/pull/remote checkout/remote restore.
- Touch footer, newsletter, payment-logo, PromoSection visual work.
- Touch image assets or media localization.
- Restore Baby & Kids.
- Undo Toys & Collectibles.
- Restore Flash Deals or Flash Sales.
- Touch payment provider/backend integration, tracking provider/API integration, seller marketplace implementation, CSP enforcement/default collection, distributed rate limiting implementation, mobile app implementation, or authenticated admin credential/session QA.

## Remaining Risks

- No hosting/staging/production platform is selected.
- No production database or backup/restore plan is selected.
- Real staging/production env vars and secrets are not configured.
- Admin credential/session QA remains unresolved for staged authenticated flows.
- Online payment/tracking/seller marketplace remain intentionally disabled.
- Rate limiting is not production-distributed.
- CSP is not enforced.
- Email/SMTP/newsletter delivery is not production-ready.
- Remaining media localization is paused until approved assets exist.
- Legal/trust/business readiness needs qualified review; this report is not legal advice.

## Recommended Next Step

Recommended next safest step: choose whether to continue with a provider-neutral staging runbook update/review, or select a hosting/staging provider outside the codebase before any deployment implementation.

Do not deploy or configure production services until staging provider, database provider, secret management, backup/restore, monitoring, and admin credential procedures are explicitly approved.
