# Pre-launch Environment Clarification

Date: 2026-06-02

## Website Assumption

The website is assumed to be pre-launch and local-development only right now.

The domain has been bought, but there is no hosting connected yet. That means:

- Local development can continue on localhost or 127.0.0.1.
- SEO canonical metadata can still use the future public domain.
- The public domain must point to hosting before launch/indexing.
- Website domain ownership does not make any database safe for migrations.

## Environment Roles

| Role | Example | Guidance |
|---|---|---|
| Local app URL | `http://localhost:3000` | Use for normal `npm run dev` local browsing and form/API testing. |
| Local production test URL | `http://127.0.0.1:3100` | Use for local production-mode smoke checks when needed. |
| Future public canonical URL | `https://boilabin.com` | Safe as the pre-launch SEO canonical identity; hosting must be connected before indexing. |
| Database URL | Local PostgreSQL connection string | Separate from website hosting/domain; must classify as local before migration work. |
| Shadow database URL | Separate local PostgreSQL connection string | Required for safe `prisma migrate dev` migration generation. |
| Auth URL / NextAuth URL | `http://localhost:3000` locally | Use local app origins for local auth callbacks; use the hosted public origin after deployment. |

## SEO Canonical Behavior

Inspected:

- `src/backend/seo/urls.ts`
- SEO tests covering canonical URL normalization

Findings:

- The SEO URL helper defaults to `https://boilabin.com`.
- The helper rejects localhost as a canonical site URL and falls back to `https://boilabin.com`.
- This is safe for pre-launch code because canonical metadata represents the future public identity.
- Do not replace canonical SEO URLs with localhost.
- Before public indexing, the domain must point to real hosting and the deployed site must serve the canonical pages.

## Local Auth Behavior

Inspected:

- `src/backend/auth/host.ts`
- `src/backend/auth/config.ts`
- Auth host tests

Findings:

- Local auth testing does not require live hosting.
- Local auth URLs should use localhost or 127.0.0.1.
- `shouldTrustAuthHost` trusts local origins for local production verification.
- Production custom hosts still require explicit trusted-host/managed-host configuration.

Recommended local auth variables:

```env
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="local-development-secret"
NEXTAUTH_SECRET="local-development-secret"
AUTH_TRUST_HOST="true"
```

For local production smoke testing on another port, use the matching local origin, such as `http://127.0.0.1:3100`.

## Database URL Guidance

Database URLs are separate from:

- Bought domain ownership
- Website hosting
- SEO canonical URLs
- Auth callback URLs

Product lifecycle migration work requires:

- `DATABASE_URL` pointing to a dedicated local PostgreSQL app database.
- `SHADOW_DATABASE_URL` pointing to a separate local PostgreSQL shadow database.
- `npm run db:url:safety` reporting both as `local`.
- Local migration ready reporting `yes`.

Until that happens, lifecycle migration generation must remain paused.

## Migration Readiness Result

Command run:

```bash
npm run db:url:safety
```

Result:

| Check | Classification |
|---|---|
| `DATABASE_URL` | `remote-looking` |
| `SHADOW_DATABASE_URL` | `missing` |
| Local migration ready | `no` |

No database connection was attempted and no secret values were printed.

Migration status:

- Prisma schema was not changed.
- No migration files were created.
- No migration commands were run.
- No database was touched.

## Files Changed

- `.env.example`
- `README.md`
- `audit-reports/23_PRELAUNCH_ENVIRONMENT_CLARIFICATION.md`

## Documentation Changes

Updated `.env.example`:

- Clarified that `NEXT_PUBLIC_SITE_URL` is the pre-launch public canonical identity.
- Set the example canonical domain to `https://boilabin.com`.
- Kept local app/API origins on localhost and 127.0.0.1 for local request guards.

Updated `README.md`:

- Added a pre-launch note to local setup.
- Added a `Pre-launch URL Roles` section.
- Documented local app URL, local production test URL, future canonical domain, database URL, shadow database URL, and auth URL roles.
- Clarified that a bought domain does not make a database local.
- Clarified that the domain can be used as future canonical identity before hosting, but must be hosted before indexing.

## Validation Results

| Command | Result |
|---|---|
| `npm run db:url:safety` | Passed as a non-mutating classifier; `DATABASE_URL` is `remote-looking`, `SHADOW_DATABASE_URL` is `missing`, local migration ready is `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; no ESLint warnings or errors. Next.js lint deprecation notice only. |
| `npm test` | Passed; 27 suites, 119 tests. |

## Commands Intentionally Not Run

- `prisma migrate dev`
- `npm run db:migrate`
- `npm run db:migrate:local`
- `prisma db push`
- `npm run db:push`
- `prisma migrate reset`
- `npm run db:reset`
- `npm run db:seed`
- Any seed script
- Any deployment command
- Any SQL or backfill command

## Recommended Next Step

Create a real `.env.local` for local development with:

- Local `AUTH_URL` / `NEXTAUTH_URL`.
- Future canonical `NEXT_PUBLIC_SITE_URL=https://boilabin.com`.
- Dedicated local PostgreSQL `DATABASE_URL`.
- Separate local PostgreSQL `SHADOW_DATABASE_URL`.

Then rerun `npm run db:url:safety`. Resume Step 7C product lifecycle migration only after both database URLs classify as local and local migration ready is `yes`.
