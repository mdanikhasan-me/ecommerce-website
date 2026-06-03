# Step 91C Initial Local Schema Migration Seed And Dev Smoke

## Scope

Step 91C created and applied Boilabin's initial local Prisma migration, seeded local development data, and verified the real DB-backed storefront can build and render the homepage locally.

This was not a visual step, dependency-upgrade step, fake fallback step, or deployment step.

## Official Prisma Sources Consulted

Official Prisma sources consulted:

- Prisma Migrate development command docs: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production
- Prisma `migrate dev --create-only` docs: https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production#create-and-apply-migrations
- Prisma `db push` docs: https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push
- Prisma seeding docs: https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding

Findings:

- `prisma migrate dev` creates migration files under `prisma/migrations`, uses a shadow database, applies migrations to the development database, and updates migration history.
- `prisma migrate dev --create-only` creates migration files without applying them.
- `prisma db push` syncs schema to the database without creating migration history and is more suitable for prototyping/local schema syncing.
- Prisma seed scripts insert initial/test/development data.
- For this project, an initial migration is better than `db push` because future staging/production work needs migration history.

## Why The Error Changed

Before Step 91B, the app failed because PostgreSQL was unreachable at `localhost:5432`.

After Step 91B, Docker/PostgreSQL was running and reachable, so the error changed to Prisma `P2021` missing-table errors such as `public.Category does not exist`.

That meant the local database existed, but schema tables had not been applied.

## Docker / PostgreSQL Status

- Docker Desktop is already upgraded and was not installed or upgraded in this step.
- Docker engine works through the installed Docker binary path with a temporary process-only PATH prefix.
- Docker context: `desktop-linux`.
- Docker version: `29.5.2`.
- Docker Compose version: `v5.1.4`.
- Local PostgreSQL container: `boilabin-local-postgres`.
- Container status: running and healthy.
- Local port: `5432`.
- PostgreSQL logs showed the server ready to accept connections.

## DB URL Safety

`npm run db:url:safety` passed:

- `DATABASE_URL`: local
- `SHADOW_DATABASE_URL`: local
- Shadow database separate: yes
- Local migration ready by URL shape: yes

No full database URLs were printed in this report.

## Prisma Migration Strategy

Chosen strategy: create a real initial local migration with the guarded local Prisma wrapper.

Reason:

- The repo had no `prisma/migrations` directory before this step.
- README/docs prefer `npm run db:migrate:local` over plain Prisma migration or `db push`.
- Official Prisma docs support migration history for long-term controlled schema evolution.
- `db push` was not used.

## Migration Command Run

Command:

```powershell
npm run db:migrate:local -- --name init_current_schema
```

The guarded wrapper confirmed local/separate DB URL safety before running Prisma.

## Migration Files Created

Created:

- `prisma/migrations/20260603002826_init_current_schema/migration.sql`
- `prisma/migrations/migration_lock.toml`

The migration was applied successfully to the local database.

## Migration SQL Safety Review

The migration SQL was reviewed for expected initial schema statements:

- `CREATE TYPE`
- `CREATE TABLE`
- `CREATE INDEX`
- `ALTER TABLE ... ADD CONSTRAINT`

Standalone destructive statements were not found.

The `DROP`, `TRUNCATE`, and standalone `DELETE` scan only matched expected foreign-key `ON DELETE` clauses, not destructive data/schema operations.

## Schema Applied

Schema was applied successfully.

Build later confirmed the previous missing table errors were resolved.

## Seed Command Run

Command:

```powershell
npm run db:seed
```

The seed ran successfully against the verified local database.

The seed script printed demo login material in command output. Those values are intentionally not repeated in this report.

## Seed Result Summary

Count-only local seed verification:

- Users: 9
- Sellers: 1
- Categories: 20
- Products: 22
- Banners: 7
- Flash sales: 1
- Coupons: 3
- Orders: 9

Seed content includes categories, brands, first-party seller, products, banners, coupons, flash sale data, and sample order data.

Toys & Collectibles remains present in the seed with slug `toys-collectibles`.

## Validation Results

- `npm run db:url:safety` - passed.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed after stopping two repo-local Next dev processes that had locked the Prisma DLL.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed. 175 tests passed, 0 failed.
- `npm run build` - passed.

## Build Result

`npm run build` passed.

This confirms the local database is reachable, schema is applied, and seeded data is sufficient for production-mode static generation.

## Real Dev Homepage Smoke Result

`npm run dev` was started and stopped after smoke checks.

Homepage result:

- `/` returned status `200`.
- No `PrismaClientInitializationError`.
- No `P2021`.
- No `public.Category does not exist`.
- No `localhost:5432` reachability error.
- Homepage content markers were present for categories/products/hero/featured/flash/new-arrivals/price content.

This confirms the real DB-backed homepage renders locally.

## Routes Smoke-Tested

Routes tested:

- `/` - `200`, real DB-backed homepage rendered.
- `/contact` - `200`.
- `/category` - `200`.
- `/cart` - `200`.
- `/checkout` - `307` redirect to login, expected unauthenticated behavior.
- `/api/auth/session` - `200`.
- `/category/electronics` - `404`, no Prisma error.
- `/products/hp-spectre-x360-14` - `404`, no Prisma error.

The category/product detail 404s need a later focused route/seed visibility investigation. They are no longer database reachability or missing-schema failures.

## Docker Desktop UI / Resource Note

CLI confirms `boilabin-local-postgres` is running and healthy.

The user can open Docker Desktop > Containers to see the local PostgreSQL container, logs, CPU, and memory usage. Docker metrics confirm container health, not full frontend performance; browser performance testing remains a separate future task.

## Safety Confirmations

- No fake homepage fallback was added.
- No UI files were changed.
- No visual files were changed.
- No category images were changed.
- No payment logos were changed.
- Footer/newsletter/PromoSection files were not touched.
- `public/assets/categories/baby-kids.jpg` was not restored.
- Toys & Collectibles remains intact in active source and seed.
- No remote or production database was used.
- No database reset was run.
- No destructive SQL was run.
- No `prisma db push` command was run.
- No dependency install or package upgrade command was run.
- No deployment command was run.
- No secrets, full database URLs, tokens, cookies, auth headers, payment secrets, private connection strings, or real customer/order PII are printed in this report.

## Remaining Risks

- Seed command output still prints demo login material; the values were not repeated here, but the seed script should be reviewed later if public command logs are a concern.
- Plain `docker` is still not available on this PowerShell session's PATH; Docker works through the installed binary path and temporary process PATH prefix.
- Category detail and product detail smoke routes returned 404 despite no Prisma errors, and need a focused follow-up.
- Local DB now contains seeded sample data; keep it local-only.

## Recommended Next Step

Run a focused Step 91D route/seed visibility smoke audit for category/product detail 404s, without changing UI or adding fallback data.
