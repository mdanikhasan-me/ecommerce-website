# Step 34: Non-DB Security and Config Hardening Log

Date: 2026-06-02

## Scope

Local PostgreSQL is still not ready, so this step stayed entirely outside database, schema, migration, seed/reset, seller marketplace, payment integration, tracking integration, and visual/UI work.

## Files Changed

Changed in this Step 34 task:

- `next.config.js`
- `.env.example`
- `README.md`
- `tests/security-headers.test.ts`
- `audit-reports/34_NON_DB_SECURITY_CONFIG_HARDENING_LOG.md`

Worktree note: some files were already modified/untracked from earlier roadmap steps, including footer and payment-logo files. Step 34 did not edit those prohibited files.

## Security and Config Issues Found

1. App-wide security headers existed but were missing a few low-risk browser hardening headers:
   - `Strict-Transport-Security` for production HTTPS responses.
   - `X-DNS-Prefetch-Control`.
   - `X-Permitted-Cross-Domain-Policies`.

2. `dangerouslyAllowSVG` was enabled for Next Image with a restrictive SVG CSP, but `contentDispositionType` was not explicitly set to `attachment`.

3. `.env.example` had safe placeholder values, but did not explain that `AUTH_TRUST_HOST=true` is a local/trusted-host setting and that `CSRF_ALLOWED_ORIGINS` must be raw origins rather than markdown links or wildcard-style values.

4. README already had local migration guardrails, but the package-script section did not clearly list all mutation-capable database scripts and did not explicitly warn against `npm audit fix` / dependency-update commands during scoped recovery tasks.

5. Mutation API guard consistency was reviewed. A source sweep found no custom API route with `POST`, `PUT`, `PATCH`, or `DELETE` exports that lacked `protectMutationRequest`.

## Safe Fixes Made

### Security Headers

Updated `next.config.js` to keep the existing global headers and add:

- `X-DNS-Prefetch-Control: off`
- `X-Permitted-Cross-Domain-Policies: none`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` only when `NODE_ENV === 'production'`

Existing headers preserved:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

### SVG Image Handling

Updated `next.config.js` image config to explicitly set:

- `contentDispositionType: 'attachment'`

The existing SVG image CSP was preserved:

```text
default-src 'self'; script-src 'none'; sandbox;
```

### Env Documentation

Updated `.env.example` comments to clarify:

- `AUTH_TRUST_HOST=true` is suitable for local development and trusted hosted proxy setups only.
- `CSRF_ALLOWED_ORIGINS` should be raw comma-separated origins, not markdown links or wildcard origins.

No real secrets were added or printed.

### Package Script Documentation

Updated README guardrails to make mutation-capable scripts more explicit:

- `npm run db:migrate`
- `npm run db:migrate:local`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:reset`
- `npm run db:reset-signals`

The README now also warns not to run `npm audit fix`, dependency update commands, or package install commands during scoped recovery-roadmap tasks unless explicitly approved.

### Tests

Added `tests/security-headers.test.ts` covering:

- Global browser hardening headers.
- HSTS only appearing for production config.
- Defensive SVG handling with `dangerouslyAllowSVG`, `contentDispositionType: 'attachment'`, and SVG CSP.

## Unsafe or Risky Fixes Skipped

- Did not add a global application Content Security Policy because Next.js runtime scripts, inline hydration, third-party OAuth, and future payment handoff flows need a careful route-aware CSP plan.
- Did not add COEP/COOP/CORP globally because those can break OAuth popups, external embeds, Open Graph/social fetching, or future gateway redirects if applied without browser QA.
- Did not remove existing database scripts because that could break established local workflows. Documentation warnings and the safer `db:migrate:local` path were preferred.
- Did not run `npm audit fix`, package update commands, or install new security packages.
- Did not change rate limiter architecture to Redis/KV because that requires infrastructure/package decisions.
- Did not change checkout, payment backend, tracking, seller marketplace, product/category/search behavior, Prisma schema, migrations, seed/reset, or database configuration.

## Package Script Review

Reviewed `package.json`.

Non-mutating scripts:

- `typecheck`
- `lint`
- `test`
- `build`
- `db:validate`
- `db:generate`
- `db:url:safety`

Mutation-capable or database-touching scripts that require caution:

- `db:migrate`
- `db:migrate:local`
- `db:push`
- `db:seed`
- `db:reset`
- `db:reset-signals`
- `db:studio`

No scripts were removed. README warnings were improved instead.

## Env Readiness Review

`.env.example` now documents:

- Local PostgreSQL app DB placeholder.
- Local PostgreSQL shadow DB placeholder.
- Local `AUTH_URL` / `NEXTAUTH_URL`.
- Fake local auth secret placeholders.
- `AUTH_TRUST_HOST` local/trusted-host caution.
- Future canonical `NEXT_PUBLIC_SITE_URL`.
- Raw comma-separated `CSRF_ALLOWED_ORIGINS`.
- `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS="false"`.
- Warning not to commit or paste real secrets.

Current active environment remains not migration-ready:

- `.env.local`: missing.
- `DATABASE_URL`: remote-looking.
- `SHADOW_DATABASE_URL`: missing.

## Tests Added or Updated

Added:

- `tests/security-headers.test.ts`

Focused test command:

```bash
npx tsx --test tests/security-headers.test.ts
```

Result: passed, 3 tests.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/security-headers.test.ts` | Passed, 3 tests. |
| `npm run db:url:safety` | Passed; no DB connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js reported only the standard `next lint` deprecation notice. |
| `npm test` | Passed; 122 tests, 28 suites, 0 failures. |
| `npm run build` | Passed. |
| `git diff --check -- next.config.js .env.example README.md tests/security-headers.test.ts` | Passed; Git printed CRLF normalization warnings only. |

## Production Build Result

Passed with `npm run build`.

Next.js compiled successfully, generated 75 static pages, and produced the route manifest without errors.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, payment backend integration, tracking API integration, seller marketplace implementation, product lifecycle schema, or visual/UI styling file was edited during this Step 34 task.

Specifically not edited in Step 34:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: footer and payment-logo files still appear modified in the worktree from earlier steps, but this step did not change them.

## Remaining Risks

- Local DB readiness is still blocked. `.env.local` is missing, `DATABASE_URL` is remote-looking, and `SHADOW_DATABASE_URL` is missing.
- HSTS will only be observable in production-mode header output when `NODE_ENV === 'production'` and the site is served over HTTPS.
- A full route-aware CSP still needs a careful plan and browser QA before launch.
- The rate limiter remains in-memory and per-process; production-grade shared rate limiting still requires Redis/KV or equivalent infrastructure.
- Middleware remains a convenience redirect layer based on cookie presence; server-side auth/role checks remain the real security boundary.
- Authenticated DB-backed browser testing remains paused until safe local PostgreSQL and test users exist.

## Recommended Next Technical Step

Keep database and lifecycle migration paused until local PostgreSQL is ready. The next safe technical step can be either:

1. Set up local PostgreSQL and rerun `npm run db:url:safety` until local migration ready is `yes`, then resume Step 7C lifecycle migration work.
2. If DB setup is still not available, continue with another non-database pre-launch readiness task such as route-aware CSP planning, dependency risk review without upgrades, or authenticated-flow test planning with mocked fixtures.
