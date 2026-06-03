# Step 93 - Guarded Local Seed And Storefront/Admin Smoke

## Scope

Step 93 fixed the local website content/admin inspection blocker by adding a guarded local-only seed command, seeding the actual `.env.local` database used by Next.js, and verifying DB-backed storefront/admin behavior.

This was not a frontend redesign step, GitHub restore step, fake fallback step, destructive DB reset step, payment/tracking/seller enablement step, or visual asset step.

## Why Step 92 showed an empty local DB

Step 92 proved that Next.js runtime loads `.env.local` and that the `.env.local` local app database had zero categories and zero products.

The existing `db:seed` script was unsafe for this repo state because it ran `tsx prisma/seed.ts` directly instead of using the repo's `.env` then `.env.local` local guardrail. With `.env` still remote-looking and `.env.local` intended as the local runtime override, raw seed execution could target the wrong database.

## Seed guardrail implemented

Added:

- `scripts/run-prisma-seed-local.mjs`
- `npm run db:seed:local`
- no-DB tests in `tests/prisma-local-guardrail.test.ts`

The new guarded seed command:

- loads `.env` first
- loads `.env.local` second as the local runtime override
- reuses the existing DB URL safety classifier
- refuses to run unless app DB and shadow DB classify local
- refuses to run unless app DB and shadow DB are separate
- passes the merged env to the seed child process
- redacts database URLs, emails, and credential-like seed output before echoing child output
- does not print full DB URLs

The original `db:seed` command was left unchanged for compatibility, but it should not be used for this workflow.

## Files changed

- `scripts/run-prisma-seed-local.mjs`
- `package.json`
- `tests/prisma-local-guardrail.test.ts`
- `audit-reports/93_GUARDED_LOCAL_SEED_AND_STOREFRONT_ADMIN_SMOKE.md`

No UI, visual, image, payment-logo, footer, newsletter, PromoSection, Prisma schema, migration, or Docker files were changed.

## Env/script loading findings

1. Existing guarded Prisma scripts use `scripts/run-prisma-local.mjs`, which loads `.env` first and `.env.local` second.
2. `npm run db:url:safety` also uses the shared loader that lets `.env.local` override `.env`.
3. Before this step, `npm run db:seed` used raw `tsx prisma/seed.ts` and was not protected by the local guardrail.
4. Step 91C appeared to seed successfully, but Step 92 later proved the actual `.env.local` runtime DB was empty. The safest explanation is an env-loading mismatch: the raw seed path was not guaranteed to target the same DB that Next.js used at runtime.
5. The safest seed path is now `npm run db:seed:local`.

## Docker/Postgres status

Docker was reachable through the installed Docker binary path. The local container status was:

- container: `boilabin-local-postgres`
- image: `postgres:16-alpine`
- status: running and healthy
- local port: `5432`

Docker logs showed older missing-table errors from before local migration/seed, but the current container was healthy and accepting connections.

## DB URL safety

`npm run db:url:safety` passed:

- `DATABASE_URL`: local
- `SHADOW_DATABASE_URL`: local
- shadow database separate: yes
- local migration ready by URL shape: yes

No full DB URLs were printed.

## Before-seed count summary

Counts from the `.env.local` local runtime DB before guarded seed:

- users: 0
- super-admin roles: 0
- admin roles: 0
- sellers: 0
- categories: 0
- products: 0
- banners: 0
- flash sales: 0
- coupons: 0
- orders: 0

## Guarded seed result

Command run:

```powershell
npm run db:seed:local
```

Result: succeeded.

Credential redaction note:

- The seed script emits demo credential material.
- The report and final response intentionally do not repeat those values.
- The first guarded seed execution exposed role-labeled credential-like lines before the redactor was tightened.
- The wrapper was immediately patched to redact role-labeled credential lines, and tests now cover that case.
- The seed command was not rerun just to test output, avoiding duplicate local data.

No raw `npm run db:seed`, raw `npx prisma db seed`, reset, destructive SQL, or remote DB command was run.

## After-seed count summary

Counts from the `.env.local` local runtime DB after guarded seed:

- users: 2
- super-admin roles: 1
- admin roles: 0
- sellers: 1
- categories: 20
- products: 21
- banners: 4
- flash sales: 1
- coupons: 3
- orders: 1

Storefront visibility counts:

- buyer-visible products: 21
- buyer-visible featured products: 10
- buyer-visible new products: 9
- buyer-visible best-seller products: 11
- buyer-visible sale products: 18
- active hero banners: 3
- currently active flash sales: 1
- approved sellers: 1

## Category/product visibility findings

Seeded active top-level category slugs include:

- `electronics`
- `fashion`
- `home-appliances`
- `beauty-health`
- `sports-fitness`
- `books-stationery`
- `gaming`
- `toys-collectibles`

Seeded products are active, attached to active categories, and attached to an approved seller under the current buyer-visible product policy.

Actual product slugs verified in browser smoke include:

- `xiaomi-redmi-note-13-pro-256gb`
- `samsung-galaxy-tab-s9-128gb`

## Admin role finding

The local DB now contains one `SUPER_ADMIN` role.

Admin authorization code accepts `ADMIN` or `SUPER_ADMIN` in `requireAdminSession()`.

Unauthenticated admin routes still redirect to login, which is expected. This step did not brute-force login or print passwords.

The user's previous super-admin password mismatch is expected if that password belonged to a different/non-local DB state. If login still fails, handle it in a separate explicit local-only admin credential step.

## Validation results

Pre-seed validation:

- `npm run db:url:safety`: passed
- `npm run db:prisma:local:validate`: passed
- `npm run db:prisma:local:generate`: initially hit a Windows Prisma DLL lock from a stale repo-local Next process; after stopping only repo-local Node/CMD processes, passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed, 181 tests

Post-seed validation:

- `npm run db:url:safety`: passed
- `npm run db:prisma:local:validate`: passed
- `npm run db:prisma:local:generate`: passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed, 181 tests
- `npm run build`: passed

## Browser/dev smoke results

Temporary dev server:

- `npm run dev`
- local URL: `http://localhost:3000`
- stopped after verification

Smoke results:

| Route | Result |
| --- | --- |
| `/` | 200; category, product, banner, featured, flash sale, new arrivals, and best-seller markers present |
| `/contact` | 200 |
| `/category` | 200 |
| `/category/electronics` | 200 |
| `/products/xiaomi-redmi-note-13-pro-256gb` | 200 |
| `/products/samsung-galaxy-tab-s9-128gb` | 200 |
| `/deals` | 200 |
| `/new-arrivals` | 200 |
| `/cart` | 200 |
| `/checkout` | 307 to login |
| `/auth/login` | 200 |
| `/admin` | 307 to login |
| `/admin/dashboard` | 307 to login |
| `/api/auth/session` | 200 |

No Prisma initialization error, `P1001`, `P2021`, `P2025`, missing-table error, or fake fallback marker was found in the tested responses.

Runtime warnings observed:

- Next.js image quality warnings for values not listed in `images.qualities`; these are future Next.js 16 compatibility warnings and were not fixed in this step.

## Homepage visibility result

Homepage content/sections are visible again from real `.env.local` database data:

- hero/banner content
- category cards
- product cards
- featured products
- flash sale
- new arrivals
- best-seller content

No fallback data was added in code.

## Safety confirmations

- No GitHub/remote source was used.
- No `git fetch`, `git pull`, or remote checkout was run.
- No remote or production DB was used.
- No full DB URLs were printed.
- No passwords, password hashes, cookies, tokens, auth headers, payment secrets, or customer/order PII are printed in this report.
- No fake homepage fallback was added.
- No UI/visual files were changed.
- No footer, newsletter, PromoSection, category image, or payment-logo files were changed.
- `public/assets/categories/baby-kids.jpg` was not restored.
- Toys & Collectibles remains intact.
- No Prisma schema or migration files were changed.
- No database reset, destructive SQL, `prisma migrate reset`, `prisma db push`, Docker volume deletion, package update, or deployment command was run.

## Remaining risks

- The original raw `db:seed` script still exists and remains unsafe for this env layout; use `db:seed:local` for local recovery work.
- The seed script itself still contains demo credential literals in source/output behavior; values are not repeated here, but credential handling should be reviewed before public logs are shared.
- The local seeded data is sample/local data, not proof that the user's old/original database content has been recovered.
- The previous super-admin password may still differ from the seeded local credential. A separate approved local-only admin credential step is needed if the user cannot log in.
- Next.js image-quality warnings should be handled in a later no-visual-change compatibility step.

## Recommended next step

Step 94 should be one of:

1. If the user can log in with the local seeded admin account, run an authenticated admin/browser smoke audit without changing data.
2. If the user cannot log in because the password is unknown or differs from the old password, perform a separate local-only admin credential reset/update plan with explicit approval and without printing credentials.

Do not resume visual/footer/category-image/payment-logo work in the next technical step.
