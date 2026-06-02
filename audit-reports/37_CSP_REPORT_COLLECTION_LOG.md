# Step 37: CSP Report Collection Log

Date: 2026-06-02

## Scope

Added sanitized CSP report collection behind a server-only flag. CSP remains report-only, disabled by default, and unenforced.

Local PostgreSQL is still not ready, so database/product lifecycle migration and authenticated DB-backed testing remain paused.

## Files Changed

Changed in this Step 37 task:

- `.env.example`
- `README.md`
- `src/backend/security/csp.ts`
- `src/backend/security/csp-report.ts`
- `src/app/api/security/csp-report/route.ts`
- `tests/csp.test.ts`
- `tests/csp-report.test.ts`
- `audit-reports/37_CSP_REPORT_COLLECTION_LOG.md`

Notes:

- `.env.example`, `README.md`, and `src/backend/security/csp.ts` already had earlier roadmap edits. Step 37 only added CSP report collection behavior/docs/tests.
- The broader worktree still contains earlier uncommitted changes, including footer and payment-logo files, but Step 37 did not edit them.

## Env Flag Added

Added server-only flag:

```env
ENABLE_CSP_REPORT_COLLECTION="false"
```

Default behavior:

- Missing or `false`: collection endpoint returns a safe disabled response and CSP policies do not include `report-uri`.
- `true`, `1`, or `yes`: collection can be enabled, but `report-uri` is added only when `ENABLE_CSP_REPORT_ONLY` is also enabled.

No `NEXT_PUBLIC_` prefix was used.

## Endpoint Path

Added:

```text
/api/security/csp-report
```

Endpoint behavior:

- Accepts `POST` only through the exported Next.js App Router handler.
- Accepts JSON CSP report bodies with `application/csp-report` or `application/json`.
- Does not require or use the database.
- Does not call external services.
- Does not log raw request headers, cookies, authorization headers, or full raw URLs.
- Returns safe statuses:
  - `404` when collection is disabled.
  - `415` for unsupported content type.
  - `413` for bodies over 16 KB.
  - `400` for invalid JSON or invalid report shape.
  - `204` for accepted sanitized reports.

## Sanitization Rules

Added `src/backend/security/csp-report.ts`.

Rules:

- Maximum accepted request body size: 16 KB.
- Maximum retained string length: 240 characters.
- URL fields are reduced to origin + pathname only.
- Query strings are removed.
- URL fragments are removed.
- `data:` and `blob:` are reduced to scheme-only markers.
- Unsupported protocols become `[unsupported-url]`.
- Invalid URLs become `[invalid-url]`.
- Unknown fields are ignored.
- Sensitive/raw fields such as cookies, authorization headers, tokens, script samples, and arbitrary large objects are not retained.

Retained known CSP fields:

- URL fields: `document-uri`, `blocked-uri`, `source-file`
- String fields: `violated-directive`, `effective-directive`, `original-policy`, `disposition`
- Number fields: `status-code`, `line-number`, `column-number`

## CSP Helper / Report URI Behavior

Updated `src/backend/security/csp.ts`.

Behavior:

- `ENABLE_CSP_REPORT_ONLY` disabled: no CSP report-only header.
- `ENABLE_CSP_REPORT_COLLECTION` disabled: no `report-uri`.
- Collection enabled without report-only: no CSP header.
- Both report-only and collection enabled: report-only policies include:

```text
report-uri /api/security/csp-report
```

No enforced `Content-Security-Policy` header was added.

## Tests Added / Updated

Updated:

- `tests/csp.test.ts`

Added:

- `tests/csp-report.test.ts`

Coverage added:

- Report collection disabled by default.
- `report-uri` absent when collection is disabled.
- `report-uri` present only when both report-only and collection are enabled.
- Endpoint sanitizes `document-uri`.
- Endpoint sanitizes `blocked-uri`.
- Endpoint removes query strings and fragments.
- Endpoint caps long values.
- Endpoint rejects unsupported content types.
- Endpoint rejects invalid JSON.
- Endpoint rejects oversized bodies.
- Endpoint logs only sanitized structured report data.
- Endpoint does not retain raw sensitive fields.
- Enforced CSP remains absent.

Focused CSP test result:

```bash
npx tsx --test tests/csp.test.ts tests/csp-report.test.ts
```

Passed: 17 tests.

## Browser / CDP Smoke Result

Local production server used:

```bash
node node_modules/next/dist/bin/next start -p 3100
```

Temporary local-only env overrides used for the smoke pass:

- `ENABLE_CSP_REPORT_ONLY=true`
- `ENABLE_CSP_REPORT_COLLECTION=true`
- `AUTH_URL=http://127.0.0.1:3100`
- `NEXTAUTH_URL=http://127.0.0.1:3100`
- `AUTH_TRUST_HOST=true`

HTTP header checks:

| Route | Result |
| --- | --- |
| `/` | 200; report-only header present; `report-uri` present; enforced CSP absent. |
| `/auth/login` | 200; report-only header present; `report-uri` present; enforced CSP absent. |
| `/cart` | 200; report-only header present; `report-uri` present; enforced CSP absent. |
| `/checkout` | 307 to login; report-only header present; `report-uri` present; enforced CSP absent. |
| `/admin/dashboard` | 307 to login; report-only header present; `report-uri` present; enforced CSP absent. |
| `/robots.txt` | 200; report-only header present; `report-uri` present; enforced CSP absent. |
| `/sitemap.xml` | 200; report-only header present; `report-uri` present; enforced CSP absent. |

Report endpoint HTTP check:

| Endpoint | Result |
| --- | --- |
| `POST /api/security/csp-report` | 204 with collection enabled. Server log contained sanitized origin/path-only report data. |

Chrome/CDP checks:

| Route | Desktop | Mobile | Result |
| --- | --- | --- | --- |
| `/` | 200 | 200 | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/auth/login` | 200 | 200 | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/cart` | 200 | 200 | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/checkout` | Redirected to login | Redirected to login | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/admin/dashboard` | Redirected to login | Redirected to login | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/robots.txt` | 200 | 200 | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |
| `/sitemap.xml` | 200 | 200 | Report-only present; `report-uri` present; enforced absent; 0 console errors; 0 runtime exceptions. |

Product detail was not smoke-tested because it is DB-backed and the current database URL remains unsafe for local DB-backed testing.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/csp.test.ts tests/csp-report.test.ts` | Passed; 17 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 139 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |
| Local HTTP CSP/report endpoint smoke | Passed. |
| Local Chrome/CDP smoke | Passed. |

## Production Build Result

Passed.

The build route table includes:

```text
/api/security/csp-report
```

No enforced CSP header was added by the build or runtime smoke checks.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated product/category/search behavior was changed by Step 37.

Specifically not touched in Step 37:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

## Remaining Risks

- CSP report collection remains disabled by default and should stay disabled in production until logging/storage policy is approved.
- The endpoint currently logs sanitized reports to server logs only; it does not persist reports or aggregate metrics.
- Report-only CSP still uses intentionally permissive Next.js-compatible allowances such as inline script/style support. It is not ready for enforcement.
- Full Google OAuth and authenticated DB-backed report-only checks remain blocked until safe local PostgreSQL/test users exist.
- Product detail and signed-in account/admin/checkout flows were not exercised because local DB readiness is still blocked.

## Recommended Next Step

Keep CSP report-only and collection disabled by default.

Next safe technical step: either continue non-DB security readiness with a logging/observability policy for sanitized security events, or set up local PostgreSQL plus a local shadow database so DB-backed authenticated CSP and product lifecycle work can resume safely.
