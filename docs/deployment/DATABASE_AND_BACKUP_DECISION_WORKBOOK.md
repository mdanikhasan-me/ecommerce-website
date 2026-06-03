# Database And Backup Decision Workbook

## Purpose

This workbook defines what must be decided before Boilabin uses a hosted staging or production database.

It is not a migration runbook. It does not run migrations, seed data, reset data, run SQL, or choose a database provider.

## Current Local DB State

- Local URL-shape guardrails exist.
- Local Prisma validate/generate commands are guarded.
- Local build and tests currently pass in this environment.
- Local readiness does not prove staging or production readiness.
- Local database setup is only for safe development and testing.

## What Is Not Ready Yet

- Staging database provider is not selected.
- Production database provider is not selected.
- Remote migration deployment process is not approved.
- Backup and restore policy is not approved.
- Restore drills are not complete.
- Production data retention rules are not approved.
- Admin credential process for staging/production is not finalized.

## Managed PostgreSQL Requirements

- Separate staging and production databases.
- Server-only connection strings.
- Reliable backups.
- Restore support.
- Clear export/offboarding path.
- Access controls for database credentials.
- Monitoring for connection errors and storage capacity.
- Support for Prisma client usage.
- Compatible SSL/TLS requirements documented by the provider.
- Safe connection limits for the selected hosting runtime.

## Separate Staging And Production DB Rules

- Staging and production must never share the same database.
- Staging data must not be treated as public.
- Production data must not be copied into staging unless a privacy-safe approved process exists.
- Staging migrations should be tested before production migrations.
- Each environment needs its own secrets and access controls.
- Do not point local `.env.local` at staging or production for migration work.

## Shadow Database Rules

- A shadow database is for Prisma migration tooling.
- The shadow database must be separate from the app database.
- The shadow database must not be production.
- Local migration generation should use a local app DB and local shadow DB.
- Any hosted shadow database policy requires a dedicated approved database step.
- Never print or commit a shadow database URL.

## Migration Approval Rules

- No remote migration without a dedicated approved DB step.
- Review migration files before applying them remotely.
- Confirm target environment before running migration commands.
- Confirm backup exists before staging or production migration.
- Do not use `prisma db push` for controlled launch migration history.
- Do not run reset or seed against staging/production unless explicitly approved.
- Document owner, target, expected changes, rollback option, and validation plan.

## Backup Requirements

- Automated backups before staging realistic QA.
- Automated backups before production traffic.
- Backup retention documented.
- Backup access restricted.
- Backup encryption and storage policy reviewed.
- Backup status monitored.
- Backup restoration owner assigned.

## Restore Drill Requirements

- Backups are not useful unless restore is tested.
- Run at least one restore drill before production launch.
- Verify restored schema and critical data integrity.
- Verify restore steps do not expose DB URLs or PII.
- Record restore duration and failure points.
- Confirm the team knows who can initiate restore.

## Data Retention Questions

- How long should orders be retained?
- How long should user accounts and addresses be retained?
- How long should admin audit logs be retained?
- How should deleted or anonymized user data be handled later?
- What data is required for customer support, returns, refunds, and tax/accounting needs?
- Which decisions require qualified business/legal review?

## Seed Data Rules

- Seed data is local/development only unless a dedicated staging seed plan is approved.
- Do not seed production with demo customers, demo orders, or demo credentials.
- Do not publish seeded credentials.
- Do not use real customer data for local testing.
- Keep seed image/media references aligned with approved media policy.

## Admin Credential Rules

- Create staging and production admin accounts through a secure approved process.
- Do not commit admin emails/passwords.
- Rotate credentials before production launch.
- Separate admin roles by need.
- Remove unused admin accounts.
- Log admin actions safely without PII leakage.

## Order/Customer PII Safety

- Delivery addresses, phone numbers, emails, order history, and customer support data are sensitive.
- Do not expose order PII through public confirmation or tracking links.
- Do not print PII in logs or reports.
- Use authenticated owner/admin checks before accessing sensitive order data.
- Keep future tracking APIs disabled until a PII-safe design is approved.

## Rollback Rules

- Prefer reviewed forward-fix migrations when safe.
- Do not casually run destructive SQL.
- Do not reset production as a rollback.
- Use backups only with an approved restore plan.
- Rollback must consider code version, schema version, media state, and environment variables together.
- Document the rollback owner before launch.

## Prisma-Specific Questions

- Where are migrations generated?
- Which database is used as the local shadow database?
- Who reviews migration SQL before remote apply?
- Which command is approved for staging migration deployment?
- Which command is approved for production migration deployment?
- How are Prisma client generation and deploy timing handled?
- How are connection limits handled in the selected runtime?
- How will future product lifecycle schema changes be tested safely?

## Provider Questions To Ask

- How are database credentials stored and rotated?
- How are backups configured?
- How is restore performed?
- Is point-in-time recovery available?
- How are logs and slow queries exposed?
- How are connection limits enforced?
- How is SSL/TLS configured?
- How can data be exported if leaving the provider?
- What support options exist during launch incidents?
- What current pricing and limits apply? Verify manually.

## Go/No-Go Checklist

Go requires:

- Staging and production DB separation approved.
- Shadow DB policy approved.
- Migration runbook approved.
- Backup policy approved.
- Restore drill completed.
- Admin credential process approved.
- PII handling reviewed.
- Rollback owner assigned.
- Future mobile API stability considered.

No-go if any DB target, backup, restore, migration, PII, or credential decision is unclear.
