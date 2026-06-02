# Step 7B Local Migration Environment Guardrails

Date: 2026-06-02

## Summary

Step 7B added local-only migration safety documentation, a safe `.env.example`, non-mutating database URL classification, and safer Prisma script aliases. No Prisma migration was created, no lifecycle schema was implemented, and no database was connected to or modified.

## Files Changed

- `.env.example`
- `README.md`
- `package.json`
- `scripts/check-db-url-safety.mjs`
- `audit-reports/21_STEP_7B_LOCAL_MIGRATION_ENV_GUARDRAILS.md`

## Env Example Additions

Added `.env.example` with fake local placeholder values only:

- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `AUTH_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_SITE_URL`
- `APP_URL`
- `CSRF_ALLOWED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS`

The example uses local PostgreSQL placeholders:

- `boilabin_local` for the application database.
- `boilabin_shadow` for the Prisma shadow database.

No real secrets were added.

## README and Docs Changes

Updated `README.md` to add:

- Instructions to copy `.env.example` to `.env.local`.
- A warning not to paste production, staging, payment, OAuth, email, or database secrets into docs or committed files.
- A `Local Database and Prisma Migration Safety` section.
- Guidance to keep migration work local-only unless explicitly approved by a deployment plan.
- Guidance to use a dedicated local app database and a separate local shadow database.
- A warning not to use `prisma db push` for controlled migration history.
- A recommended future local-only migration generation flow.
- A list of mutation-capable Prisma commands that require verified local URLs.
- NPM script documentation for the new non-mutating and guarded database commands.

## Package Script Changes

Added these scripts:

| Script | Purpose |
|---|---|
| `db:validate` | Runs `prisma validate`; non-mutating schema validation. |
| `db:generate` | Runs `prisma generate`. |
| `db:url:safety` | Classifies database URLs without connecting or printing secrets. |
| `db:migrate:local` | Runs the URL safety check with `--require-local`, then `prisma migrate dev` only if both DB URLs classify as local. |

Existing mutation-capable scripts were left in place to avoid breaking current workflows, but README now warns that they must only be used with verified local URLs.

## Safety Helper

Added `scripts/check-db-url-safety.mjs`.

Behavior:

- Reads `.env` and `.env.local` plus current process environment.
- Does not read `.env.example` as a readiness source, so fake example values cannot make an unsafe environment look ready.
- Does not connect to any database.
- Does not print any database URL or secret.
- Classifies `DATABASE_URL` and `SHADOW_DATABASE_URL` as `local`, `remote-looking`, `unknown`, or `missing`.
- Supports `--require-local` to fail closed unless both database URLs classify as local.

Current environment classification from `npm run db:url:safety`:

| Variable | Classification |
|---|---|
| `DATABASE_URL` | `remote-looking` |
| `SHADOW_DATABASE_URL` | `missing` |
| Local migration ready | `no` |

## Database Commands Intentionally Not Run

The following commands were intentionally not run:

- `prisma migrate dev`
- `npm run db:migrate`
- `npm run db:migrate:local`
- `prisma migrate deploy`
- `prisma db push`
- `npm run db:push`
- `prisma migrate reset`
- `npm run db:reset`
- `npm run db:seed`
- Any seed script
- Any SQL or backfill command

## Validation Commands Run

| Command | Result |
|---|---|
| `npm run db:url:safety` | Passed; no database connection attempted; classified current DB as `remote-looking`, shadow DB as `missing`, local migration ready as `no`. |
| `npx prisma validate` | Passed; Prisma schema is valid. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; no ESLint warnings or errors. Next.js lint deprecation notice only. |
| `npm test` | Passed; 27 suites, 119 tests. |

## Whether Any Database Was Touched

No.

No database mutation command was run, no migration command was run, no seed command was run, and the new URL safety helper does not attempt a database connection.

## Risks

- The current `DATABASE_URL` still classifies as remote-looking, so migration generation remains unsafe in this environment.
- `SHADOW_DATABASE_URL` is still missing from the active environment.
- `prisma/migrations` is still absent, so the first migration should be generated only in a verified local environment and reviewed carefully.
- Existing mutating scripts such as `db:migrate`, `db:push`, `db:seed`, and `db:reset` still exist for compatibility and require developer discipline.
- `db:migrate:local` checks local URL classification before running, but it cannot prove the database is disposable or freshly prepared.

## Exact Recommended Next Step

Configure a verified local PostgreSQL application database and a separate local shadow database using `.env.local`, run `npm run db:url:safety` until both classify as local, then proceed to the additive product lifecycle schema migration planning/generation step in that local-only environment. Review the generated migration SQL before any non-local use.
