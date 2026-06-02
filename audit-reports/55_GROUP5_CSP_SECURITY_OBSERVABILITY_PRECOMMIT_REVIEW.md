# Step 55: Group 5 CSP / Security Observability Pre-Commit Review

Date: 2026-06-02

## 1. Scope of Step 55

This was a targeted pre-commit readiness review for Commit Group 5 only: CSP report-only, CSP report collection, security logging, security headers, and related tests.

Reviewed files:

- `next.config.js`
- `src/middleware.ts`
- `src/app/api/security/csp-report/route.ts`
- `src/backend/security/csp.ts`
- `src/backend/security/csp-report.ts`
- `src/backend/security/security-log.ts`
- `tests/auth-host.test.ts`
- `tests/client-error.test.ts`
- `tests/csp-report.test.ts`
- `tests/csp.test.ts`
- `tests/request-guard.test.ts`
- `tests/security-headers.test.ts`
- `tests/security-log.test.ts`

No staging, commit, revert, delete, rename, deployment, database, migration, Prisma, Docker, dependency, runtime behavior, API behavior, auth behavior, frontend, visual, footer, payment-logo, payment backend, tracking, seller marketplace, distributed rate limiting, CSP enforcement, CSP default enablement, or product lifecycle change was performed.

## 2. Files Changed by Step 55

- `audit-reports/55_GROUP5_CSP_SECURITY_OBSERVABILITY_PRECOMMIT_REVIEW.md`

No existing project file was modified in Step 55.

## 3. Commit Group 5 File / Area Review

| File / area | Status | Review verdict | Notes |
| --- | --- | --- | --- |
| `next.config.js` | Modified tracked | Safe with warning | Adds conservative global security headers and hardened SVG handling. HSTS is conditional on production only. |
| `src/middleware.ts` | Modified tracked | Safe with warning | Preserves protected-route cookie-presence redirects and adds optional report-only CSP header only when enabled. Does not set enforced CSP. |
| `src/app/api/security/csp-report/route.ts` | Untracked | Safe with warning | Collection endpoint is disabled by default, DB-free, bounded, content-type checked, and logs only sanitized reports when enabled. |
| `src/backend/security/csp.ts` | Untracked | Safe with warning | Route-aware CSP report-only helper; disabled by default; report URI included only when report-only and collection flags are both enabled. |
| `src/backend/security/csp-report.ts` | Untracked | Safe | Sanitizes report payload fields, strips URL query/fragment data, caps strings, bounds numbers, ignores unknown objects. |
| `src/backend/security/security-log.ts` | Untracked | Safe with warning | Shared sanitizer/logging helper strips query/fragment data, masks emails, redacts obvious sensitive strings, drops forbidden metadata keys, and bounds event shape. Uses console logging only. |
| `tests/auth-host.test.ts` | Untracked | Safe | Protects auth host guardrail behavior relevant to local/pre-launch and future hosted environments. |
| `tests/client-error.test.ts` | Untracked | Safe | Protects client error sanitization behavior used by related security work. |
| `tests/csp-report.test.ts` | Untracked | Safe | Covers CSP report endpoint disabled/default behavior, invalid payloads, body limit, and sanitized logging. |
| `tests/csp.test.ts` | Untracked | Safe | Covers route classification, report-only default-disabled behavior, report URI gating, no enforced CSP, and payment/tracking domain absence. |
| `tests/request-guard.test.ts` | Untracked | Safe | Protects request source checks used by adjacent security work. |
| `tests/security-headers.test.ts` | Untracked | Safe | Covers hardening headers, production-only HSTS, and defensive SVG config. |
| `tests/security-log.test.ts` | Untracked | Safe | Covers URL sanitization, string caps, redaction, email masking, forbidden metadata dropping, and sanitized log emission. |

Group 5 inventory from `git status --short -- <group-files>`:

- Modified tracked files: 2
- Untracked Group 5 files: 11
- Missing expected Group 5 files: 0
- Staged files in repository: 0

Git reported LF-to-CRLF warnings while diffing `next.config.js` and `src/middleware.ts`. This is a line-ending warning, not a validation failure.

## 4. Security Headers Verdict

Verdict: safe to manually stage later.

`next.config.js` currently sets these global browser hardening headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-DNS-Prefetch-Control: off`
- `X-Permitted-Cross-Domain-Policies: none`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

HSTS verdict:

- `Strict-Transport-Security` is added only when `NODE_ENV === 'production'`.
- Development/local builds do not receive HSTS from this config.

SVG handling verdict:

- `dangerouslyAllowSVG` remains enabled, but SVG responses are hardened with:
  - `contentDispositionType: 'attachment'`
  - SVG CSP: `default-src 'self'; script-src 'none'; sandbox;`

No global application CSP was added through `next.config.js`.

## 5. CSP Report-Only / Default-Disabled Verdict

Verdict: intact.

Findings:

- `ENABLE_CSP_REPORT_ONLY` must be explicitly truthy before middleware emits `Content-Security-Policy-Report-Only`.
- With the flag missing or false, `getCspReportOnlyHeader(...)` returns `null`.
- The helper exports only the report-only header constant for page/API/metadata CSP behavior.
- No enforced `Content-Security-Policy` header is emitted by the helper or middleware.
- Static assets and upload paths are skipped by middleware CSP handling.
- Route families are separated for public, auth, account/private, checkout/cart, admin, API, and metadata surfaces.

The policy remains observation-only and disabled by default.

## 6. CSP Report Collection / Default-Disabled Verdict

Verdict: intact.

Findings:

- `ENABLE_CSP_REPORT_COLLECTION` is disabled by default.
- When collection is disabled, `POST /api/security/csp-report` returns a safe `404` JSON response and does not log reports.
- `report-uri /api/security/csp-report` is included only when both report-only CSP and collection are enabled.
- Collection alone does not emit a CSP header.
- Endpoint does not use a database, external service, Docker, Redis/KV, payment service, tracking service, or storage backend.
- Endpoint accepts only `application/csp-report` and `application/json`.
- Endpoint enforces a 16 KB body limit.
- Endpoint returns controlled statuses for disabled, unsupported content type, oversized body, invalid JSON, invalid report shape, and accepted reports.

## 7. Middleware CSP Behavior Verdict

Verdict: safe with warning.

Middleware behavior reviewed:

- Existing unauthenticated `/admin/*` and `/account/*` cookie-presence redirects are preserved.
- Optional CSP report-only header is applied to normal/redirect responses only when explicitly enabled.
- Middleware does not set `Content-Security-Policy`.
- Middleware matcher excludes `/_next/static`, `/_next/image`, `/assets/`, `/uploads/`, favicon, and apple-touch icon paths.
- Local/pre-launch auth behavior is not made dependent on hosting.

Warning:

- Middleware remains a convenience redirect layer based on cookie presence; server-side auth and role checks remain the actual security boundary.

## 8. Security Logging Sanitization Verdict

Verdict: intact.

`src/backend/security/security-log.ts` provides shared sanitized logging helpers:

- `sanitizeStringForLog(...)`
- `sanitizeUrlForLog(...)`
- `sanitizePathnameForLog(...)`
- `sanitizeOriginForLog(...)`
- `maskEmailForLog(...)`
- `sanitizeSecurityEvent(...)`
- `logSecurityEvent(...)`

Sanitization behavior reviewed:

- URL query strings and fragments are stripped.
- Route fields are reduced to pathname only.
- Origin fields are reduced to origin only.
- Unsupported URLs and invalid URLs become safe markers.
- Strings are capped at 240 characters.
- Obvious token/password/authorization/cookie/session patterns are redacted.
- Emails are masked when handled as email metadata.
- Forbidden metadata fields are dropped, including raw body, payload, authorization, cookies, tokens, secrets, session, phone, address, payment/card, database/connection, and stack fields.
- Nested objects are ignored.
- Arrays are bounded.

Logging behavior:

- Uses console logging only, matching the current project style.
- Emits the sanitized event object, not raw request objects, raw headers, raw cookies, raw bodies, raw errors, or stack traces.

## 9. Secret / PII / Log Exposure Review

Verdict: no confirmed secret or PII exposure in Group 5.

Value-free review findings:

- No full DB URL literal was present in Group 5 production code.
- Secret-looking strings in tests are fixture values used to assert redaction and are not real credentials.
- CSP report tests intentionally include token/cookie/authorization-like fixture names to prove they are removed from logs.
- Payment/tracking domain names appear only in `tests/csp.test.ts` as a forbidden list that must not appear in generated CSP policies.
- `console.warn`, `console.info`, and `console.error` calls exist only in the centralized `logSecurityEvent(...)` helper and in tests that capture console output.
- CSP report endpoint does not log raw request headers, cookies, authorization headers, full URLs, query strings, fragments, raw request bodies, payment data, DB URLs, or private connection strings.

No secret values were printed in this report.

## 10. Test Coverage Verdict

Verdict: strong no-DB coverage for Group 5.

Relevant tests:

- `tests/security-headers.test.ts`
  - global hardening headers
  - HSTS production-only behavior
  - defensive SVG handling
- `tests/csp.test.ts`
  - route family classification
  - static asset/upload skip behavior
  - explicit report-only policies
  - no wildcard `*`
  - no broad `https:`
  - known image sources
  - no payment/tracking domains
  - minimal API/metadata policies
  - default-disabled report-only behavior
  - report URI only when report-only and collection are enabled
  - middleware redirect preservation
  - enforced CSP absence
- `tests/csp-report.test.ts`
  - disabled endpoint behavior
  - unsupported content type
  - invalid JSON
  - oversized body
  - sanitized accepted report logging
  - query/fragment stripping
  - sensitive field dropping
- `tests/security-log.test.ts`
  - URL sanitization
  - unsupported/invalid URL handling
  - string caps
  - secret-pattern redaction
  - email masking
  - forbidden metadata dropping
  - sanitized event emission
- `tests/auth-host.test.ts`, `tests/client-error.test.ts`, and `tests/request-guard.test.ts`
  - adjacent auth/security behavior that should remain compatible with Group 5.

## 11. API / Runtime Compatibility Verdict

Verdict: safe with warning.

Compatibility notes:

- CSP report endpoint is a new DB-free endpoint and is disabled by default.
- Report collection does not affect runtime unless explicitly enabled by server-only env.
- Report-only CSP does not affect runtime unless explicitly enabled.
- No enforced CSP was added.
- No route response shape, auth behavior, middleware redirect behavior, API status contract, frontend/admin caller, payment behavior, tracking behavior, seller behavior, or DB behavior was changed by Step 55.
- Production build includes `/api/security/csp-report` and middleware without build errors.

Warning:

- Report-only CSP still contains intentionally permissive Next.js-compatible inline script/style allowances. It is not enforcement-ready.
- Authenticated DB-backed browser checks are still blocked by local DB readiness.

## 12. Whether Group 5 Is Safe to Manually Stage Later

Verdict: yes, Commit Group 5 is safe to manually stage later as a standalone CSP/security-observability commit, after final human review.

Risk level: warning, not critical.

Why warning:

- CSP is subtle and can affect many route families when explicitly enabled.
- Report collection should remain disabled in production until logging/storage/retention policy is approved.
- The current implementation logs to server console only; there is no persistent reporting pipeline.
- Full OAuth and authenticated DB-backed browser checks remain incomplete because local PostgreSQL is not ready.

No footer, payment-logo, visual, product lifecycle, payment backend, tracking, seller marketplace, DB, Prisma, migration, Redis/KV, or distributed rate-limit files are required for this group.

## 13. Suggested Manual `git add` Command

This command is suggested only. It was not run.

```powershell
git add -- `
  "next.config.js" `
  "src/middleware.ts" `
  "src/app/api/security/csp-report/route.ts" `
  "src/backend/security/csp.ts" `
  "src/backend/security/csp-report.ts" `
  "src/backend/security/security-log.ts" `
  "tests/auth-host.test.ts" `
  "tests/client-error.test.ts" `
  "tests/csp-report.test.ts" `
  "tests/csp.test.ts" `
  "tests/request-guard.test.ts" `
  "tests/security-headers.test.ts" `
  "tests/security-log.test.ts"
```

If audit reports are being committed as Group 1, do not include this Step 55 report in the Group 5 commit. If each implementation commit should include its matching pre-commit review, add this report intentionally in a separate reviewed command.

## 14. Files That Must Be Excluded From Group 5

Exclude all non-Group-5 files, especially:

```text
.env
.env.local
.env.example
.env.local.example
README.md
package.json
docker-compose.local.yml
docker/local-postgres/**
scripts/check-db-url-safety.mjs
audit-reports/**
public/assets/categories/**
public/assets/payments/**
src/frontend/components/layout/Footer.tsx
src/frontend/components/layout/NewsletterForm.tsx
src/frontend/components/home/**
src/app/api/account/**
src/app/api/admin/**
src/app/api/auth/register/route.ts
src/app/api/contact/route.ts
src/app/api/newsletter/route.ts
src/app/api/orders/route.ts
src/app/api/products/**
src/app/api/returns/route.ts
src/app/api/reviews/route.ts
src/app/api/search/**
src/backend/admin/**
src/backend/auth/**
src/backend/security/client-error.ts
src/backend/security/request-guard.ts
src/backend/security/rate-limit.ts
src/backend/seo/**
tests/api-error-contract.test.ts
tests/image-processing.test.ts
tests/seo-policy.test.ts
prisma/schema.prisma
prisma/migrations/**
```

The exact Group 5 manual add command above avoids these files.

## 15. Confirmation No Files Were Staged / Committed / Reverted / Deleted

Confirmed.

- `git diff --cached --name-only` reported zero staged files.
- No `git add`, `git commit`, `git reset`, `git checkout`, `git restore`, `git clean`, delete, rename, move, or destructive command was run.

## 16. Confirmation No Runtime Behavior Was Changed

Confirmed.

Step 55 created this audit report only. It did not change API behavior, response shapes, status codes, headers, auth behavior, frontend/admin callers, security helpers, logging helpers, middleware, CSP behavior, package behavior, payment behavior, tracking behavior, seller behavior, product lifecycle behavior, or visual behavior.

## 17. Confirmation No Prohibited Files Were Touched

Confirmed.

Step 55 did not touch:

- database files
- Prisma schema
- migrations
- seed/reset/db-push scripts
- Docker/container files
- `.env`, `.env.local`, `.env.example`, `.env.local.example`
- `.gitignore`
- README
- package/dependency files
- footer files
- newsletter visual layout
- payment-logo assets
- visual/UI styling files
- homepage/category visuals
- payment backend
- tracking API
- seller marketplace
- product lifecycle behavior
- Redis/KV/distributed rate-limit implementation

No database connection, migration, SQL command, Docker command, seed, reset, db push, dependency install, deployment, CSP enforcement, default CSP enablement, CSP report collection default enablement, payment enablement, tracking enablement, seller enablement, or production-only integration was attempted.

## 18. Validation Results

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` classified remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; no ESLint warnings or errors. Next.js emitted the existing `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 0 failures. |
| `npm run build` | Passed; production build compiled successfully, generated 76 static pages, and included `/api/security/csp-report` plus middleware in the route/build output. |

## 19. Remaining Risks

- CSP is report-only capable but disabled by default and not enforced.
- CSP report collection is disabled by default and should remain disabled in production until logging/storage/retention policy is approved.
- The current CSP policy still allows inline scripts/styles for Next.js compatibility and is not enforcement-ready.
- No persistent CSP report storage, aggregation, alerting, or external observability pipeline exists.
- Full Google OAuth and authenticated DB-backed CSP checks remain blocked until local PostgreSQL and test accounts are ready.
- Local DB readiness is still `no`.
- The wider worktree still contains unrelated visual/footer/payment-logo and other roadmap changes that must not be staged with Group 5.

## 20. Recommended Next Step

Proceed to the next planned commit-group pre-commit review from Step 52, or manually stage Group 5 using the exact command above only after final human review.
