# Step 44: Local PostgreSQL and Shadow DB Setup Path Log

Date: 2026-06-02

## 1. Scope of Step 44

Created a safer local PostgreSQL plus local Prisma shadow database setup path for future DB-backed authenticated API contract testing and future local-only migration work.

This was a setup, documentation, and guardrail step only.

No migration was created or run. No Prisma schema change was made. No database connection was attempted.

## 2. Files Changed

Changed in this Step 44 task:

- `.env.example`
- `.env.local.example`
- `README.md`
- `package.json`
- `scripts/check-db-url-safety.mjs`
- `docker-compose.local.yml`
- `docker/local-postgres/init/01-create-local-databases.sql`
- `audit-reports/44_LOCAL_POSTGRES_SHADOW_DB_SETUP_PATH_LOG.md`

## 3. What Setup Path Was Added or Improved

### Added `.env.local.example`

Added a local-only environment template with:

- `DATABASE_URL` for local app database: `boilabin_local`
- `SHADOW_DATABASE_URL` for separate local Prisma shadow database: `boilabin_shadow`
- local auth URLs: `http://localhost:3000`
- future SEO canonical domain: `https://boilabin.com`
- local CSRF allowed origins
- payment disabled flag
- CSP flags disabled by default
- fake local OAuth placeholders only

No real secrets were added.

### Added local-only Docker Compose path

Added `docker-compose.local.yml` with one local PostgreSQL service:

- service name: `boilabin-local-postgres`
- image: `postgres:16-alpine`
- local port: `5432`
- local volume: `boilabin-local-postgres-data`
- no app startup
- no Prisma migration
- no seed
- no `db push`
- no payment/tracking/seller setup

Added `docker/local-postgres/init/01-create-local-databases.sql` to create two separate local databases on first container initialization:

- `boilabin_local`
- `boilabin_shadow`

This file is local development setup only and was not executed in this step.

### Improved README setup guidance

Updated `README.md` with:

- direct local PostgreSQL setup path
- Docker Compose local PostgreSQL setup path
- pause-DB-work path when neither PostgreSQL nor Docker is installed
- clear explanation that `DATABASE_URL` is the local app DB
- clear explanation that `SHADOW_DATABASE_URL` is a separate local shadow DB for Prisma migration tooling
- warning that both DB URLs must be local and separate
- reminder that `https://boilabin.com` is future canonical website identity, not database readiness
- reminder that localhost/127.0.0.1 are correct for local app/auth testing
- reminder that payment, tracking, seller marketplace, and product lifecycle migration remain paused

### Improved DB URL safety checker

Updated `scripts/check-db-url-safety.mjs` to classify whether the app database and shadow database are separate, without printing secrets and without connecting to any database.

New safety output includes:

```text
Shadow database separate: yes/no
```

`Local migration ready` now requires:

- `DATABASE_URL: local`
- `SHADOW_DATABASE_URL: local`
- `Shadow database separate: yes`

### Added safe npm alias

Added:

```bash
npm run db:require-local
```

This runs the URL safety checker with `--require-local`. It is non-mutating and does not connect to a database. It fails unless both DB URLs are local and separate.

## 4. Whether Docker/psql Were Detected

| Tool | Detection command | Result |
| --- | --- | --- |
| PostgreSQL CLI | `psql --version` | Not detected on PATH. |
| Docker | `docker --version` | Not detected on PATH. |
| Node.js | `node --version` | `v24.14.1` |
| npm | `npm --version` | `11.12.1` |

Because neither `psql` nor Docker was detected, this step did not attempt to create databases or start containers.

## 5. Exact Commands a Developer Should Run Manually Next

### Option A: PostgreSQL installed directly

After installing PostgreSQL locally and confirming `psql --version` works:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_local;"
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_shadow;"
cp .env.local.example .env.local
npm run db:url:safety
```

Expected safety success:

```text
Database URL safety check: no database connection attempted.
DATABASE_URL: local
SHADOW_DATABASE_URL: local
Shadow database separate: yes
Local migration ready: yes
```

### Option B: Docker local PostgreSQL

After installing/enabling Docker and confirming `docker --version` works:

```bash
docker compose -f docker-compose.local.yml up -d
cp .env.local.example .env.local
npm run db:url:safety
```

If port `5432` is already in use, stop and adjust the local compose port mapping intentionally. Do not use a hosted/remote DB URL as a workaround.

### Option C: Pause DB work

If PostgreSQL and Docker are unavailable, keep DB-backed tests, Prisma migrations, seed/reset commands, product lifecycle schema work, payment setup, tracking setup, and seller marketplace work paused.

## 6. Confirmation No Prohibited Files Were Changed

Confirmed Step 44 did not change:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- production API behavior
- API response shapes
- API status codes
- frontend/admin callers
- tests
- footer files
- newsletter visual layout
- payment-logo assets
- visual/UI styling files
- homepage/category visuals
- payment backend
- tracking API
- seller marketplace
- product lifecycle schema/status behavior

The Docker init SQL file added in this step is not a Prisma migration and was not executed.

## 7. Confirmation No Remote DB Connection Was Attempted

Confirmed.

No remote or local database connection was attempted.

Commands intentionally not run:

- `prisma migrate dev`
- `npm run db:migrate`
- `npm run db:migrate:local`
- `prisma migrate deploy`
- `prisma db push`
- `npm run db:push`
- `prisma db seed`
- `npm run db:seed`
- `prisma migrate reset`
- `npm run db:reset`
- any SQL command against a running database
- any Docker command that starts or creates containers

`npm run db:url:safety` does not connect to a database and does not print secrets.

Current safety result:

```text
Database URL safety check: no database connection attempted.
DATABASE_URL: remote-looking
SHADOW_DATABASE_URL: missing
Shadow database separate: no
Local migration ready: no
```

## 8. Validation Results

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, shadow separate `no`, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## 9. Remaining Risks

- Local PostgreSQL is still not installed/detected in this environment.
- Docker is still not installed/detected in this environment.
- `.env.local` is still missing.
- Active `DATABASE_URL` still classifies as remote-looking.
- Active `SHADOW_DATABASE_URL` is still missing.
- Local DB-backed authenticated API contract testing remains blocked.
- Product lifecycle migration remains paused.
- `docker-compose.local.yml` was not executed because Docker is unavailable.
- The safety checker can classify URLs, but it cannot prove a local database is disposable, empty, migrated, or seeded.

## 10. Recommended Next Step

Install or enable either local PostgreSQL or Docker, create the local app database and separate local shadow database, create `.env.local` from `.env.local.example`, then run:

```bash
npm run db:url:safety
```

Proceed to DB-backed authenticated API contract tests only after the safety check reports:

```text
DATABASE_URL: local
SHADOW_DATABASE_URL: local
Shadow database separate: yes
Local migration ready: yes
```
