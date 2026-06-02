# Step 72 Prisma Local Env Guardrail Log

## 1. Scope of Step 72

Step 72 added a small local Prisma env-loading guardrail so future local Prisma commands can use the same intended local-only `.env` plus `.env.local` source model as `npm run db:url:safety`.

This step did not run migrations, db push, seed, reset, SQL, Docker, deployment, or any intentional database connection.

## 2. Files Changed

Changed by Step 72:

- `scripts/check-db-url-safety.mjs`
- `scripts/run-prisma-local.mjs`
- `package.json`
- `README.md`
- `tests/prisma-local-guardrail.test.ts`
- `audit-reports/72_PRISMA_LOCAL_ENV_GUARDRAIL_LOG.md`

No `.env`, `.env.local`, Prisma schema, migration, footer, newsletter, payment-logo, category-image, visual, payment, tracking, seller, or product lifecycle file was changed.

## 3. Prisma Env-Loading Problem Summary

Step 71 found a mismatch:

- `npm run db:url:safety` classified DB URLs using `.env` first and `.env.local` as the local override.
- Direct Prisma CLI commands reported loading `.env`.
- That meant `db:migrate:local` could pass the checker and then invoke Prisma in a process that might not use the same local-only env source.

This was a migration safety risk because `.env` can contain remote-looking DB values while `.env.local` contains the intended local app and shadow DB URLs.

## 4. Guardrail Design Added

Added `scripts/run-prisma-local.mjs`.

The wrapper:

- loads `.env` first
- loads `.env.local` as the local override
- reuses the safety logic from `scripts/check-db-url-safety.mjs`
- refuses to execute unless:
  - `DATABASE_URL` classifies as local
  - `SHADOW_DATABASE_URL` classifies as local
  - app DB and shadow DB classify as separate
- does not print full DB URLs or secrets
- warns that URL-shape readiness does not prove PostgreSQL is running
- invokes Prisma with the merged local env injected into the child process

The wrapper supports:

- `validate`
- `generate`
- `migrate dev` as a guarded future path

No migration command was run in Step 72.

Implementation note:

- On Windows, spawning the `npx` shim from Node failed in this environment.
- The wrapper now prefers the local Prisma CLI entrypoint through Node when available, avoiding shell shim issues while preserving the guarded env.

## 5. Scripts Added or Changed

Added package scripts:

- `db:prisma:local:validate`
- `db:prisma:local:generate`

Changed package script:

- `db:migrate:local` now uses `scripts/run-prisma-local.mjs migrate dev`

Preserved existing scripts:

- `db:validate`
- `db:generate`
- `db:migrate`
- `db:push`
- `db:seed`
- `db:reset`
- `db:reset-signals`

The older mutation-capable scripts remain documented as dangerous unless local URL safety and an approved step explicitly allow them.

## 6. Whether `.env.local` Values Are Loaded Without Printing Secrets

Yes.

The guardrail reads `.env` and `.env.local`, but prints only classifications:

- local
- remote-looking
- unknown
- missing
- app/shadow separate yes/no

It does not print full connection strings, secrets, tokens, passwords, cookies, auth headers, payment secrets, or private connection strings.

## 7. Whether Prisma Local Validate/Generate Now Use the Local Guardrail

Yes.

Commands added and verified:

```powershell
npm run db:prisma:local:validate
npm run db:prisma:local:generate
```

Both commands:

- ran the local env guardrail first
- confirmed local/separate DB URL shape
- injected the merged local env into Prisma
- completed successfully without a database connection

Prisma still prints its normal `.env` load message, but the wrapper has already provided the merged local env to the child process before Prisma starts.

## 8. Whether Migration Commands Are Still Blocked Until Local DB Service Exists

Yes.

`db:migrate:local` is now guarded by the same wrapper, but migration work remains blocked because:

- Docker is not available
- Docker Compose is not available
- `psql` is not available
- no local PostgreSQL service is reachable
- `npm run build` still fails when DB-backed static generation tries to read from the local database

No migration command was executed.

## 9. Validation Results

Commands run:

```powershell
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `npm run db:url:safety`: passed; no DB connection attempted; app and shadow URLs classify local and separate.
- `npm run db:prisma:local:validate`: passed; guarded local env wrapper executed Prisma validate.
- `npm run db:prisma:local:generate`: passed; guarded local env wrapper executed Prisma generate.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next.js lint deprecation notice.
- `npm test`: passed after fixing a test harness issue; final result was 173 passing tests.
- `npm run build`: failed because local PostgreSQL is not running.

## 10. Build Result and Whether Failure Is Only Due To Missing Local PostgreSQL

Build result: failed.

Failure cause:

- Next.js compiled successfully.
- During static generation, DB-backed pages attempted Prisma reads against the configured local PostgreSQL host.
- No local PostgreSQL service was reachable at the local host/port.
- `/category` prerendering failed after Prisma could not reach the local database.

This is the same local-service blocker identified in Steps 70 and 71. The build failure is not a new runtime behavior change from the Prisma guardrail.

## 11. Staged/Commit Result

No commit was made.

Reason:

- The requested validation included `npm run build`.
- Build still fails because local PostgreSQL is unavailable.
- Step 72 changes were left unstaged to avoid committing while the required build command is not fully green.

No files were staged.

## 12. Confirmation No Migrations/DB Push/Seed/Reset/SQL/Docker/Deployment Commands Were Run

Confirmed.

Not run:

- `prisma migrate dev`
- `prisma migrate deploy`
- `prisma db push`
- `prisma db seed`
- `prisma migrate reset`
- reset scripts
- SQL commands
- Docker commands
- deployment commands

The guardrail validate/generate commands do not intentionally connect to a database.

## 13. Confirmation No Visual/Assets Files Were Touched

Confirmed.

Step 72 did not edit, stage, commit, revert, delete, or rename paused visual/assets files, including:

- footer files
- newsletter visual files
- payment-logo assets
- category image assets
- `src/frontend/components/home/PromoSection.tsx`

## 14. Remaining Risks

- Actual local DB service readiness remains blocked until Docker or local PostgreSQL is installed/enabled.
- `npm run build` will continue to fail while `.env.local` points to local DB URLs and no local PostgreSQL service is running.
- `db:migrate:local` is safer now, but it must not be run until a dedicated migration step approves it and the local DB service is reachable.
- Plain `db:validate` and `db:generate` still exist for compatibility and do not provide the `.env.local` wrapper guardrail.
- Paused visual/assets files remain dirty and must not be broadly staged.

## 15. Recommended Next Step

Install or enable Docker or local PostgreSQL, start/create the local app and shadow databases, then rerun:

```powershell
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run build
```

After the local DB service is reachable and build passes, proceed to a dedicated pre-migration readiness step before running any migration command.
