# Step 33: Local PostgreSQL Setup Action Guide

Date: 2026-06-02

## Purpose

Step 32 confirmed the app baseline is healthy, but product lifecycle migration and full authenticated-flow testing remain blocked because a safe local PostgreSQL app database and separate local shadow database are not ready.

This guide explains exactly how to unblock local-only Prisma migration readiness later without touching any remote database.

No migration was created. No Prisma schema file was edited. No database was connected to or modified.

## Current Setup Detection

Commands run:

| Check | Result |
| --- | --- |
| `npm run db:url:safety` | `DATABASE_URL` is `remote-looking`; `SHADOW_DATABASE_URL` is `missing`; local migration ready `no`. |
| `.env.local` presence check | Missing. |
| `psql --version` | Not detected on PATH. |
| `docker --version` | Not detected on PATH. |
| `node --version` | `v24.14.1`. |
| `npm --version` | `11.12.1`. |

Because both database URLs are not classified as local, no database connection check was attempted.

## Setup Option Detected

Current practical option: **Option C, pause DB work**, until local PostgreSQL is installed directly or Docker is installed/enabled.

Option A remains the simplest recommended path once PostgreSQL is installed locally and `psql` is available on PATH.

Docker was not detected, so this report does not provide Docker run commands. If Docker becomes available later, create a local-only PostgreSQL container and use the same database names and `.env.local` values described below.

## Option A: Local PostgreSQL Installed Directly

Use this option after PostgreSQL is installed on your machine and `psql --version` works in the terminal.

### 1. Create the local app database

Run this only against local PostgreSQL:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_local;"
```

If the database already exists, that is fine. Do not drop or reset anything unless you explicitly decide to rebuild the local environment.

### 2. Create the local shadow database

Run this only against local PostgreSQL:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_shadow;"
```

The shadow database must be separate from the app database. Prisma uses it while generating migrations with `prisma migrate dev`.

### 3. Create `.env.local`

Create `.env.local` at the repository root with local-only development values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_local"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boilabin_shadow"

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="replace-with-local-dev-secret"
NEXTAUTH_SECRET="replace-with-local-dev-secret"
AUTH_TRUST_HOST="true"

NEXT_PUBLIC_SITE_URL="https://boilabin.com"
APP_URL="http://localhost:3000"
CSRF_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3100"

NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS="false"
```

Use only fake/local development secrets in this file. Do not paste production, staging, hosted database, payment, OAuth, email, or SMS secrets into `.env.local`.

If your local PostgreSQL password is not `postgres`, change only the password portion of the two local database URLs.

### 4. Run the safety check

Run:

```bash
npm run db:url:safety
```

Success should look like this:

```text
Database URL safety check: no database connection attempted.
DATABASE_URL: local
SHADOW_DATABASE_URL: local
Local migration ready: yes
```

Only after that output appears should lifecycle migration work resume.

## Option B: Docker Local PostgreSQL

Docker was not detected on PATH in this environment, so Docker is not currently an available setup option.

If Docker is installed later, the safe concept is:

- Run PostgreSQL in a local-only container.
- Create `boilabin_local` for the app database.
- Create `boilabin_shadow` for Prisma migration shadow work.
- Point `.env.local` to `localhost`, not to a remote host.
- Rerun `npm run db:url:safety`.

Do not run Docker or database commands automatically until you intentionally choose that path.

## Option C: Pause DB Work

This is the current active state.

Continue with non-database roadmap tasks if:

- PostgreSQL is not installed.
- Docker is not installed.
- `.env.local` is missing.
- `DATABASE_URL` does not classify as `local`.
- `SHADOW_DATABASE_URL` does not classify as `local`.
- `npm run db:url:safety` does not report local migration ready `yes`.

Product lifecycle migration, Prisma migration generation, seeding, reset, and authenticated DB-backed flow testing should remain paused.

## What Not To Do

Do not:

- Use a remote database URL for migration work.
- Run `prisma db push` against a remote database.
- Run `prisma migrate dev`, `prisma migrate deploy`, or `npm run db:migrate` until both DB URLs classify as local.
- Run seed or reset commands until the database target is verified local and disposable.
- Use production or staging credentials in `.env.local`.
- Paste real secrets into docs, chat, issues, reports, or committed files.
- Treat the bought domain or future hosting URL as database readiness.

The website domain, auth URL, and database URL are separate concepts.

## Readiness Checklist

Use this checklist before rerunning Step 7C:

- [ ] `.env.local` exists at the repository root.
- [ ] `DATABASE_URL` points to `localhost`, `127.0.0.1`, or another clearly local PostgreSQL host.
- [ ] `SHADOW_DATABASE_URL` points to a separate local PostgreSQL database.
- [ ] `DATABASE_URL` and `SHADOW_DATABASE_URL` are not the same database.
- [ ] `npm run db:url:safety` reports `DATABASE_URL: local`.
- [ ] `npm run db:url:safety` reports `SHADOW_DATABASE_URL: local`.
- [ ] `npm run db:url:safety` reports `Local migration ready: yes`.
- [ ] You understand that the next migration step may create migration files and should still not be run against remote data.

If every item is complete, Step 7C can be rerun safely next.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js reported only the standard `next lint` deprecation notice. |

Tests and production build were intentionally not run because this step changed only a documentation/report file and the requested validation list was `db:url:safety`, `typecheck`, and `lint`.

## Commands Intentionally Not Run

- `prisma migrate dev`
- `npm run db:migrate`
- `npm run db:migrate:local`
- `prisma db push`
- `npm run db:push`
- `prisma migrate deploy`
- `prisma migrate reset`
- `npm run db:reset`
- `npm run db:seed`
- Any seed script
- Any SQL command
- Any database connection command
- Any Docker command that creates or starts containers
- Any package install command

## Whether Any Database Was Touched

No.

No database connection or mutation was attempted.

## Exact Next Action

Install or enable a local PostgreSQL option. The simplest direct path is:

1. Install PostgreSQL locally and make sure `psql --version` works.
2. Create `boilabin_local`.
3. Create `boilabin_shadow`.
4. Create `.env.local` using the local-only template above.
5. Run `npm run db:url:safety`.

When the safety check reports local migration ready `yes`, rerun Step 7C.
