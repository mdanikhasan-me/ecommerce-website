# Step 94 - Local Admin Access Recovery And Auth Smoke

## Scope

Step 94 added a guarded local-only admin password recovery command and verified unauthenticated admin route protection.

This was not a frontend redesign step, fake fallback step, production auth change, remote database step, visual step, destructive DB reset step, or deployment step.

## Why admin access recovery was needed

Step 93 seeded the actual `.env.local` database used by Next.js and restored real local storefront content. The local DB contains one `SUPER_ADMIN`, but the user may not know or may not be able to use the local seeded password. A safe local-only recovery path was needed so admin access can be restored without printing or committing credentials.

## Local DB safety result

`npm run db:url:safety` passed:

- `DATABASE_URL`: local
- `SHADOW_DATABASE_URL`: local
- shadow database separate: yes
- local migration ready by URL shape: yes

No full DB URLs were printed.

Docker/Postgres status:

- `boilabin-local-postgres` was running and healthy.

## Auth/admin code findings

- Credentials auth uses `bcryptjs`.
- Login route: `/auth/login`.
- Credentials login rejects users without a password hash.
- Credentials login rejects inactive users.
- Admin access accepts `ADMIN` or `SUPER_ADMIN`.
- Admin layout redirects unauthenticated/non-admin sessions to `/auth/login?callbackUrl=/admin`.
- `User` model includes `email`, optional `password`, `role`, `isActive`, and `emailVerified`.

## Local admin metadata

Safe local read-only inspection showed:

- admin/super-admin users: 1
- `SUPER_ADMIN`: 1
- `ADMIN`: 0
- account active: yes
- email verified: yes
- password hash exists: yes
- password hash length: 60
- email shown only in masked form in command output/report

No password hash, password, token, cookie, or full email value is printed in this report.

## Recovery method added

Added:

- `scripts/set-local-admin-password.mjs`
- `npm run admin:password:local`
- `tests/local-admin-password-guardrail.test.ts`

The command:

- loads `.env` first
- loads `.env.local` second as the local runtime override
- reuses DB URL safety classification
- refuses remote-looking DB URLs
- refuses missing/unsafe shadow DB config
- refuses same app/shadow DB
- requires `BOILABIN_LOCAL_ADMIN_PASSWORD`
- optionally accepts `BOILABIN_LOCAL_ADMIN_EMAIL` when multiple admin users exist
- refuses ambiguous multiple-admin state without a selector
- updates only an existing `ADMIN` or `SUPER_ADMIN` user
- refuses inactive admin accounts
- hashes the new password with `bcryptjs`
- never logs the password
- never logs the password hash
- never logs full DB URLs
- masks admin email in success output

No password is hardcoded in the script.

## Password update result

Password update was not performed in this step.

Reason:

- No private password was supplied through a safe local-only channel.
- Chat/tool output must not contain passwords.
- The command was run once without `BOILABIN_LOCAL_ADMIN_PASSWORD` and correctly refused before touching the database.

Safe refusal result:

- `npm run admin:password:local` refused with a missing-password message.
- Admin count remained unchanged after the refusal.
- No password hash was changed.

Recommended private local use:

```powershell
$env:BOILABIN_LOCAL_ADMIN_PASSWORD = Read-Host "Enter new local admin password"
npm run admin:password:local
Remove-Item Env:\BOILABIN_LOCAL_ADMIN_PASSWORD
```

If multiple admin accounts exist later, set `BOILABIN_LOCAL_ADMIN_EMAIL` in the current shell only before running the command. Do not commit or print either value.

## Admin route smoke

Temporary dev server:

- `npm run dev`
- local URL: `http://localhost:3000`
- stopped after verification

Unauthenticated smoke results:

| Route | Result |
| --- | --- |
| `/auth/login` | 200 |
| `/admin` | 307 to login |
| `/admin/dashboard` | 307 to login |
| `/admin/products` | 307 to login |
| `/admin/categories` | 307 to login |
| `/admin/orders` | 307 to login |
| `/api/auth/session` | 200 |

Storefront sanity routes also rendered:

| Route | Result |
| --- | --- |
| `/` | 200 |
| `/category/electronics` | 200 |

Authenticated admin smoke was not completed because the local admin password was not updated in this step.

Runtime warning observed:

- Next.js image-quality warnings remain for values not listed in `images.qualities`. This is a future no-visual compatibility task, not an admin-access blocker.

## Validation results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: initially hit the known Windows Prisma DLL lock from a stale repo-local Next process; after stopping only repo-local Node/CMD processes, passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 189 tests.
- `npm run build`: passed.

## Files changed

- `scripts/set-local-admin-password.mjs`
- `package.json`
- `tests/local-admin-password-guardrail.test.ts`
- `audit-reports/94_LOCAL_ADMIN_ACCESS_RECOVERY_AND_AUTH_SMOKE.md`

## Safety confirmations

- No password was printed.
- No password hash was printed.
- No full email was printed in this report.
- No full DB URL was printed.
- No token, cookie, auth header, payment secret, or private connection string was printed.
- No remote or production DB was used.
- No DB reset was run.
- No destructive SQL was run.
- No reseed was run.
- No raw `npm run db:seed` was run.
- No `prisma migrate reset` was run.
- No `prisma db push` was run.
- No UI/visual files were changed.
- No footer, newsletter, PromoSection, category image, or payment-logo files were changed.
- `public/assets/categories/baby-kids.jpg` was not restored.
- No fake fallback data was added.
- No GitHub, fetch, pull, remote checkout, or deployment command was used.

## Remaining risks

- Local admin password is not yet updated; user must run the guarded command with a private session-only password.
- Authenticated admin dashboard/pages still need smoke verification after the password is updated.
- The seed source still contains demo credential literals, although this step did not print them in the report/final response.
- Next.js image-quality warnings remain for a later no-visual compatibility step.

## Recommended next step

Step 95 should be one of:

1. User runs the private local password command, then Codex performs authenticated admin smoke using the user's browser/session without printing credentials.
2. If the user prefers not to do authenticated smoke yet, run a report-only planning step for admin QA coverage and continue with non-authenticated technical work.

Do not resume visual/footer/category-image/payment-logo work in the next technical step.
