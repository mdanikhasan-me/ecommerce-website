# Provider Decision Workbook

## Purpose

This workbook helps compare hosting and staging providers for Boilabin before any deployment implementation.

It is provider-neutral. It does not claim current pricing, current provider features, or that one provider is best. Verify every provider fact manually before choosing.

## What This Workbook Does Not Do

- It does not deploy the application.
- It does not configure a hosting provider.
- It does not connect DNS.
- It does not run provider commands or provider CLIs.
- It does not choose a provider.
- It does not configure databases, storage, monitoring, email, payment, tracking, seller marketplace, or mobile apps.
- It does not approve production launch.

## Current Boilabin Constraints

- Boilabin is prelaunch and local-development focused.
- The future production domain is bought, but hosting is not configured.
- Staging must exist before production DNS is connected.
- Staging must not be indexed.
- Payment and tracking remain disabled.
- Seller marketplace is not launch-ready.
- Flash Deals remain removed; `/deals` and `/api/admin/flash-sales` should stay removed.
- Migration work requires a separate approved database step.
- Future iPhone and Android apps need stable API contracts, auth planning, and media URLs.

## Provider Shortlist Template

Use this template for each candidate after manually verifying current facts:

| Field | Candidate A | Candidate B | Candidate C |
| --- | --- | --- | --- |
| Provider name |  |  |  |
| Staging URL support |  |  |  |
| Production domain support |  |  |  |
| Next.js support verified by date |  |  |  |
| Secret manager support |  |  |  |
| Managed PostgreSQL compatibility |  |  |  |
| Persistent media/upload path |  |  |  |
| CDN/static asset behavior |  |  |  |
| Logs/error monitoring integration |  |  |  |
| Rollback/deployment history |  |  |  |
| Backup/export clarity |  |  |  |
| Bangladesh latency/region notes |  |  |  |
| Pricing predictability verified manually |  |  |  |
| Support/export/offboarding clarity |  |  |  |

## Scoring Criteria

Score manually after provider research:

| Criterion | Weight | Score Notes |
| --- | --- | --- |
| Next.js runtime/build compatibility | High | Confirm current framework support and any limits. |
| Secret manager quality | High | Must keep server-only secrets out of client bundles and logs. |
| Managed PostgreSQL compatibility | High | Must support safe staging/prod DB separation. |
| Persistent media/upload strategy | High | Must not depend on disposable local filesystem assumptions. |
| Rollback/deployment history | High | Must support reverting a bad deploy. |
| Logs/error monitoring access | Medium | Must be useful without leaking secrets or PII. |
| CDN/static asset behavior | Medium | Must suit image-heavy storefront pages. |
| Domain/DNS support | Medium | Must support the future production domain safely. |
| Preview/staging environment support | Medium | Must enable staging before production launch. |
| Pricing predictability | Medium | Verify manually; do not rely on old notes. |
| Bangladesh user latency | Medium | Verify region/CDN behavior manually. |
| Future mobile API/media support | Medium | Must support stable API and media origins. |
| Export/offboarding clarity | Medium | Must allow data, logs, and assets to be moved later. |

## Must-Have Requirements

- Current Next.js app support.
- Build and runtime environment variable support.
- Server-only secret manager.
- Separate staging and production environment configuration.
- Safe staging URL before production DNS.
- Managed PostgreSQL compatibility.
- Persistent upload/media path or approved external storage integration.
- Rollback to previous deploy.
- Access to deploy logs.
- Ability to keep staging noindex or access-protected.
- Domain/DNS support for production later.
- Clear backup/export path for database and media.

## Nice-To-Have Requirements

- Preview deploys for pull requests or branches.
- Nearby regions or strong CDN behavior for Bangladesh users.
- Built-in error monitoring hooks.
- Log drains or export.
- Role-based team access.
- Easy environment cloning from staging to production without copying secrets into files.
- Simple custom domain verification flow.
- Clear bandwidth/build/runtime usage reporting.

## Red Flags

- No clear Next.js support.
- No server-only secret manager.
- Staging and production cannot be separated cleanly.
- Database connection strings would need to be stored in source files.
- Persistent uploads would be lost on redeploy.
- No rollback path.
- No backup/export clarity.
- Staging cannot be blocked from indexing.
- Provider requires enabling payment, tracking, or unrelated integrations incidentally.
- Logs expose request bodies, cookies, auth headers, tokens, DB URLs, or delivery PII.
- Pricing or limits cannot be understood before launch.

## Staging Requirements

- Separate staging URL.
- Staging noindex or access protection.
- Separate staging secrets.
- Separate staging database.
- Staging admin credentials created through approved handoff.
- Payment/tracking disabled unless a dedicated future step approves otherwise.
- Migration plan reviewed before any remote migration.
- Smoke/browser/auth/media/SEO checks after deployment.
- `/deals` and `/api/admin/flash-sales` remain removed.

## Production Requirements

- Production domain/DNS connected only after staging passes.
- Production secrets created in secret manager.
- Production database separate from staging.
- Backup and restore plan verified.
- Rollback plan verified.
- Monitoring and incident response configured.
- Admin access rotation completed.
- Payment/tracking/seller marketplace still disabled unless dedicated approved steps complete.
- Final human go/no-go recorded.

## Secret Manager Requirements

- Server-only secrets.
- Distinct local, staging, and production values.
- Restricted access.
- Rotation procedure.
- No secrets printed in deploy logs.
- No `NEXT_PUBLIC_*` secret exposure.
- Support for auth secrets, OAuth secrets, DB URLs, future email secrets, future payment secrets, future tracking secrets, future storage secrets, and future rate-limit storage credentials.

## Build/Runtime Requirements

- Confirm whether environment variables are needed at build time, runtime, or both.
- Confirm build logs do not print sensitive values.
- Confirm the app can run server routes needed for API, auth, admin, uploads, and database-backed pages.
- Confirm production image optimization and static asset behavior.
- Confirm middleware support.
- Confirm route handlers and auth callbacks behave under the provider runtime.

## Next.js Compatibility Questions

- Which Next.js features are supported by the selected runtime?
- Are server routes, middleware, image optimization, and dynamic routes supported?
- Are build-time and runtime environment variables handled distinctly?
- Are Node APIs used by local scripts excluded from hosted runtime needs?
- Are deployment timeouts compatible with DB-backed static generation?
- What changes if the provider uses serverless, long-running Node, or edge runtime defaults?

## Bangladesh User Experience Questions

- What regions, CDN behavior, or cache layers are available?
- How is latency from Bangladesh measured in staging?
- Does image-heavy storefront content load acceptably on low-end mobile devices?
- Are admin routes usable over unstable networks?
- Are support/contact pages accessible and reliable?
- Are final performance checks run on mobile-like conditions before launch?

## Future Mobile App Compatibility Questions

- Will API origins remain stable for future iPhone and Android apps?
- Will media URLs remain stable and absolute?
- Can auth/session strategy evolve to mobile clients without breaking web?
- Can rate limiting distinguish web and mobile clients later?
- Are error response contracts stable enough for mobile apps?
- Will payment/tracking decisions be compatible with mobile security requirements later?

## Payment/Tracking/Seller Marketplace Caution

- Do not enable online payment from hosting configuration alone.
- Do not enable tracking or public order lookup from hosting configuration alone.
- Do not expose seller marketplace routes until ownership, approval, payout, and moderation flows are ready.
- Do not add payment/tracking domains to CSP without a dedicated approved step.
- Keep Cash on Delivery as the safe default unless a later payment step approves more.

## Decision Table Template

| Decision | Choice | Evidence Link/Source | Owner | Date Verified | Risk | Follow-Up |
| --- | --- | --- | --- | --- | --- | --- |
| Hosting provider |  |  |  |  |  |  |
| Staging URL |  |  |  |  |  |  |
| Production domain setup |  |  |  |  |  |  |
| Managed PostgreSQL provider |  |  |  |  |  |  |
| Persistent media storage |  |  |  |  |  |  |
| Monitoring/logging |  |  |  |  |  |  |
| Email/SMTP |  |  |  |  |  |  |
| Backup/restore |  |  |  |  |  |  |
| Rollback method |  |  |  |  |  |  |

## Final Human Decision Checklist

- Provider facts verified manually.
- Pricing and limits verified manually.
- Bangladesh latency/region expectations verified manually.
- Staging plan approved.
- Production DNS plan approved.
- Secrets plan approved.
- Database and backup plan approved.
- Media/upload plan approved.
- Monitoring/logging plan approved.
- Email plan approved.
- Payment/tracking/seller marketplace remain disabled unless separately approved.
- Future mobile app API/media/auth implications reviewed.
- No deployment begins until the selected plan is documented.
