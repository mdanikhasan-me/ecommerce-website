# Step 121 - Provider Decision Workbook Package

## Scope

Created a provider-neutral decision workbook package for hosting, staging, managed PostgreSQL, backups, persistent media/upload storage, monitoring/logging, email/SMTP, secrets, and rollback requirements.

This step is docs/script/test only. It did not deploy, configure providers, connect remote services, run provider CLIs, read real env values, run migrations, or change runtime behavior.

## Latest Commit Verified

- Latest commit verified before edits: `9160a8c docs: add provider-neutral staging readiness package`

## Initial Git Status

- Initial `git status --short`: clean.
- Initial staged files: none.

## Files Created

- `docs/deployment/PROVIDER_DECISION_WORKBOOK.md`
- `docs/deployment/DATABASE_AND_BACKUP_DECISION_WORKBOOK.md`
- `docs/deployment/STORAGE_MONITORING_EMAIL_DECISION_WORKBOOK.md`
- `scripts/audit-provider-decision-docs.mjs`
- `tests/provider-decision-docs.test.ts`
- `audit-reports/121_PROVIDER_DECISION_WORKBOOK_PACKAGE.md`

## Files Inspected

Read-only inspection covered:

- Step 120 context from the current repo state.
- Existing deployment docs directory.
- Git baseline and staged-file state.

No private env files were read.

## Provider Decision Workbook Summary

`docs/deployment/PROVIDER_DECISION_WORKBOOK.md` provides a provider-neutral comparison workbook for hosting/staging provider selection.

It covers:

- current Boilabin constraints,
- provider shortlist template,
- scoring criteria,
- must-have and nice-to-have requirements,
- red flags,
- staging and production requirements,
- secret manager requirements,
- build/runtime requirements,
- Next.js compatibility questions,
- Bangladesh user experience questions,
- future mobile compatibility questions,
- payment/tracking/seller marketplace cautions,
- decision table template,
- final human decision checklist.

It avoids current provider pricing/features claims and tells the user to verify provider facts manually.

## Database/Backup Workbook Summary

`docs/deployment/DATABASE_AND_BACKUP_DECISION_WORKBOOK.md` defines required decisions before hosted staging/production database setup.

It covers:

- current local DB state,
- what is not ready,
- managed PostgreSQL requirements,
- staging/production database separation,
- shadow DB safety,
- migration approval rules,
- backup requirements,
- restore drills,
- data retention questions,
- seed data rules,
- admin credentials,
- order/customer PII safety,
- rollback rules,
- Prisma-specific questions,
- provider questions,
- go/no-go checklist.

It emphasizes that local DB readiness does not prove production readiness.

## Storage/Monitoring/Email Workbook Summary

`docs/deployment/STORAGE_MONITORING_EMAIL_DECISION_WORKBOOK.md` plans non-DB production services.

It covers:

- persistent upload/media storage,
- CDN/static assets,
- remaining media localization dependencies,
- monitoring/error tracking,
- security logs,
- alerting,
- email/SMTP,
- newsletter/contact handling,
- order notifications,
- bounce/unsubscribe/compliance questions,
- payment/tracking incident placeholders,
- future mobile app operational needs,
- provider questions,
- go/no-go checklist.

It states that local filesystem uploads are not enough for hosted production unless provider persistence is understood and approved.

## Audit Script Summary

`scripts/audit-provider-decision-docs.mjs` is a dependency-free Node guardrail that:

- makes no network calls,
- opens no database connections,
- mutates no files,
- does not read `.env` or `.env.local`,
- does not read or print runtime env values,
- verifies required sections in the three new docs,
- checks provider-neutral topic coverage,
- flags obvious secret-looking strings,
- flags direct deployment/database command wording,
- flags hardcoded provider-choice wording,
- flags pricing-claim wording.

## Test Guardrail Summary

`tests/provider-decision-docs.test.ts` verifies:

- the three decision docs exist,
- the audit script exists,
- required sections are present,
- docs do not contain obvious real-secret patterns or direct deployment commands,
- docs do not declare a specific hosting provider as chosen,
- staging/production DB separation is documented,
- shadow DB safety is documented,
- backup/restore drills are documented,
- staging noindex caution is documented,
- payment/tracking disabled caution is documented,
- future mobile app compatibility is documented,
- Flash Deals is not reintroduced as an active feature,
- the audit script passes cleanly.

## Important Decisions Preserved

- No provider is chosen.
- No provider-specific current facts or pricing are claimed.
- Staging must precede production.
- Staging must not be indexed.
- Production DNS must wait until staging passes.
- Staging and production databases must be separate.
- Shadow DB must not be production.
- Remote migrations require a dedicated approved DB step.
- Backups require tested restore drills.
- Payment and tracking remain disabled.
- Seller marketplace remains unlaunched.
- Flash Deals and Flash Sales remain removed.
- Future mobile app compatibility remains part of provider, media, API, and auth decisions.

## What This Step Did Not Do

Did not:

- deploy;
- configure hosting;
- connect remote services;
- open provider dashboards;
- run provider CLIs;
- update packages;
- edit `.env`, `.env.local`, or private env files;
- read real env values;
- print secrets or private connection strings;
- run migrations, create migrations, edit Prisma schema, run `db push`, seed/reset, or SQL;
- change Docker config;
- use GitHub/fetch/pull/remote checkout/remote restore;
- touch footer/newsletter/payment-logo/PromoSection visual work;
- touch image assets or media localization;
- restore Baby & Kids or undo Toys & Collectibles;
- restore Flash Deals or Flash Sales;
- touch payment, tracking, seller marketplace, CSP enforcement/default collection, distributed rate limiting, or mobile app implementation;
- retry authenticated admin credential/session QA.

## Validation Results

Validation commands run:

- `node scripts/audit-provider-decision-docs.mjs`: passed; checked 3 decision docs; 0 missing sections; 0 unsafe wording or secret-looking findings; 0 missing required topic coverage.
- `node scripts/audit-prelaunch-env-readiness.mjs`: passed; no network, database, env-value, or file-mutation checks were performed; no suspicious secret-looking strings found in deployment docs.
- `npm run db:url:safety`: passed; no database connection attempted by the checker; app DB and shadow DB classified local and separate.
- `npm run db:prisma:local:validate`: passed; guarded Prisma validate completed.
- `npm run db:prisma:local:generate`: passed; guarded Prisma generate completed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no ESLint warnings or errors and the existing Next.js lint deprecation notice.
- `npm test`: passed, 288 tests across 53 suites.
- `npm run build`: passed.

## Prohibited Actions Not Performed

- No private env files were read or edited.
- No secrets, full DB URLs, tokens, cookies, credentials, auth headers, session payloads, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, or raw user data were printed.
- No deployment, provider setup, remote service, remote database, migration, `db push`, seed/reset, SQL, Docker, package update, source/runtime, visual, media, payment, tracking, seller, CSP enforcement, distributed rate limiting, mobile app, or authenticated admin QA action was performed.

## Remaining Risks

- Hosting provider is still undecided.
- Managed PostgreSQL provider and backup/restore plan are still undecided.
- Persistent media/upload storage is still undecided.
- Monitoring/logging and email/SMTP providers are still undecided.
- Staging URL, production DNS, real secret manager entries, and admin handoff still need dedicated future steps.
- Payment/tracking/seller marketplace remain disabled and need separate approved implementation work.
- Remaining media localization still depends on approved source assets/licensing.

## Recommended Next Step

Recommended next safest step: have the user fill the provider/database/storage monitoring workbooks manually, then choose a provider-specific staging plan only after those decisions are documented.
