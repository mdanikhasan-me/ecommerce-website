# Step 95B - Authenticated Admin Browser Smoke

## Scope

Step 95B ran the local-only admin password update workflow for the user through a private terminal prompt and attempted authenticated local admin smoke testing.

This was not a frontend redesign step, fake fallback step, DB reset step, production auth change, visual step, payment/tracking/seller step, deployment step, or remote database step.

## Files changed

- `audit-reports/95B_AUTHENTICATED_ADMIN_BROWSER_SMOKE.md`

## Context confirmed

Reports read:

- `audit-reports/93_GUARDED_LOCAL_SEED_AND_STOREFRONT_ADMIN_SMOKE.md`
- `audit-reports/94_LOCAL_ADMIN_ACCESS_RECOVERY_AND_AUTH_SMOKE.md`
- `audit-reports/95_AUTHENTICATED_ADMIN_SMOKE.md`

Confirmed:

- The guarded local seed flow exists and seeded the `.env.local` local runtime database.
- The guarded local admin password recovery command exists.
- One active `SUPER_ADMIN` account exists locally.
- Step 95 was blocked only because the private password environment variable was absent.

## Local DB safety result

Docker/Postgres:

- `boilabin-local-postgres` was running and healthy.

`npm run db:url:safety`:

- `DATABASE_URL`: local.
- `SHADOW_DATABASE_URL`: local.
- app/shadow DB separate: yes.
- local migration ready by URL shape: yes.

No full DB URLs were printed.

## Admin metadata

Before password update, safe read-only inspection showed:

- admin/super-admin users: 1
- `SUPER_ADMIN`: 1
- `ADMIN`: 0
- account active: yes
- email verified: yes
- password hash exists: yes
- password hash length: 60
- email displayed only in masked form

After password update, safe read-only inspection showed:

- admin/super-admin users: unchanged
- role: unchanged
- account active: unchanged
- email verified: unchanged
- password hash exists: yes
- password hash changed compared with the pre-update snapshot: yes
- record update timestamp changed: yes

No full email, password, password hash, token, cookie, auth header, or session data is printed in this report.

## Password update command flow

Codex opened a private PowerShell prompt using `Read-Host -AsSecureString`.

The user typed the new local admin password into that terminal prompt, not into chat.

The prompt process temporarily set `BOILABIN_LOCAL_ADMIN_PASSWORD`, ran:

```powershell
npm run admin:password:local
```

Then it cleared the environment variable and zeroed the secure-string buffer.

Result:

- password update command exit code: 0
- password update succeeded: yes
- `BOILABIN_LOCAL_ADMIN_PASSWORD` absent afterward: yes

No password was printed, written to a file, committed, or included in this report.

## Validation results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: initially hit the known Windows Prisma DLL rename lock from stale repo-local Node processes; after stopping only repo-local Node processes, passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 189 tests.
- `npm run build`: passed.

## Dev server and unauthenticated smoke

Temporary dev server:

- started with `npm run dev`
- stopped after the smoke attempt

Unauthenticated route checks:

| Route | Result |
| --- | --- |
| `/` | 200 |
| `/auth/login` | 200 |
| `/admin` | 307 redirect to `/auth/login` |
| `/admin/dashboard` | 307 redirect to `/auth/login` |
| `/api/auth/session` | 200 |

Unauthenticated admin protection remains intact.

## Authenticated admin smoke result

Blocked.

The in-app browser/Playwright tooling was not available in this session, so Codex prepared a local authenticated HTTP smoke helper that kept cookies and tokens private and wrote only sanitized route status results.

The helper required the user to type the password into a second private terminal prompt. That prompt process was interrupted or closed before route results were produced, which is a Step 95B stop condition.

Authenticated admin route checks were therefore not completed.

Routes not completed:

- `/admin`
- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/users`
- `/admin/settings`
- `/api/auth/session` after authenticated login

No cookie, token, auth header, session payload, password, or password hash was printed.

## Storefront sanity smoke after admin login

Not run.

Reason:

- Authenticated admin smoke was blocked before a verified authenticated session existed.

Routes not completed after login:

- `/`
- `/category`
- `/category/electronics`
- `/products/xiaomi-redmi-note-13-pro-256gb`
- `/deals`
- `/new-arrivals`
- `/cart`

## Temporary helper cleanup

Temporary smoke helper files were created only under the OS temp directory and removed after the blocked smoke attempt.

No helper file was created in the repository.

## Safety confirmations

- No password was printed.
- No password hash was printed.
- No full email was printed.
- No full DB URL was printed.
- No cookie was printed.
- No token was printed.
- No auth header was printed.
- No session payload was printed.
- No credential was committed or written to a repository file.
- No remote or production DB was used.
- No DB reset was run.
- No destructive SQL was run.
- No reseed was run.
- No raw `npm run db:seed` was run.
- No Prisma migration was run.
- No `prisma db push` was run.
- No fake fallback data was added.
- No UI/visual files were changed.
- No category image, payment logo, footer, newsletter, or PromoSection file was changed.
- No payment, tracking, seller marketplace, distributed rate limiting, CSP enforcement, product lifecycle migration, or mobile app implementation was enabled.
- No deployment command was run.

## Remaining risks

- Authenticated admin dashboard/pages still need browser or authenticated HTTP smoke verification.
- Browser console/runtime errors could not be checked because no callable browser automation tool or Playwright dependency was available.
- The local admin password has been changed successfully, so the next smoke attempt should not need to rerun the password update unless the user wants a different password.
- The temporary authenticated smoke helper should be rerun only with a reliable private prompt/browser path.

## Recommended next step

Run a focused Step 95C authenticated admin smoke using either:

1. the in-app browser if available in the next session, with the user typing credentials directly into the local login page; or
2. a refined private terminal HTTP smoke helper that prompts once and records only sanitized route status results.

Do not rerun the password update unless the user explicitly wants to change the local admin password again.
