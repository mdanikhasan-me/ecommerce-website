# Step 38: Security Observability Policy Log

Date: 2026-06-02

## Scope

Created a sanitized security-event logging policy and reusable dependency-free helpers. This stayed entirely outside database, schema, migration, seed/reset, footer, payment-logo, visual/UI, seller marketplace, payment backend, tracking, and product lifecycle work.

CSP remains report-only and unenforced. CSP report collection remains disabled by default.

## Files Changed

Changed in this Step 38 task:

- `README.md`
- `src/backend/security/security-log.ts`
- `src/backend/security/csp-report.ts`
- `src/app/api/security/csp-report/route.ts`
- `src/backend/security/request-guard.ts`
- `src/backend/security/rate-limit.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/auth/config.ts`
- `tests/security-log.test.ts`
- `tests/csp-report.test.ts`
- `audit-reports/38_SECURITY_OBSERVABILITY_POLICY_LOG.md`

Notes:

- Several of these files already had earlier roadmap edits. Step 38 only added or updated sanitized security observability behavior.
- The broader worktree still contains earlier uncommitted footer/payment-logo changes, but Step 38 did not edit those files.

## Current Logging Risks Found

Reviewed CSP reports, mutation guard failures, rate-limit behavior, admin audit-log failure handling, image upload validation, auth host warnings, and API/page error patterns.

Findings:

- CSP report endpoint already sanitized report payloads, but used direct `console.warn` instead of a shared security-event policy.
- Mutation guard failures returned a safe client error but did not log a safe observable event.
- Rate limiter returned a safe 429 response but did not log a safe observable event.
- Admin audit-log failures were observable, but the direct log included user/entity identifiers. Step 38 narrowed this to event type, action/entity, and sanitized error metadata.
- Auth host warnings were fixed strings and safe, but used direct `console.warn`.
- Image upload validation returns safe errors and does not log raw upload payloads.
- Some broader API/page catches still log raw `Error` objects, for example order creation, return requests, dynamic sitemap, product/category/banner cleanup, deals, and new arrivals. Those were not broadly rewritten in this step because doing so would touch unrelated route behavior and needs a separate focused pass.
- Client responses generally avoid stack traces and raw database error objects, though some admin/report endpoints still return sanitized fallback messages derived from helper logic and should remain on the audit watchlist.

## Security Logging Policy

Allowed fields:

- Event type.
- Timestamp.
- Route pathname only.
- HTTP method.
- Sanitized origin.
- Sanitized known user role if already available.
- Short error code.
- Safe status code.
- Bounded/capped strings.
- Masked email only when explicitly needed.

Forbidden fields:

- Cookies.
- Authorization headers.
- Bearer tokens.
- Raw tokens or secrets.
- Full URLs with query strings or fragments.
- Raw request bodies.
- Raw payloads.
- Phone numbers.
- Delivery addresses.
- Payment data.
- OAuth secrets.
- Database URLs or connection strings.
- Stack traces in client responses.
- Unmasked emails.

Operational policy:

- Use `logSecurityEvent(...)` for security-relevant server events.
- Keep logs structured and bounded.
- Do not paste production logs publicly.
- Do not add persistent log storage or external observability until storage, retention, and access policy are approved.

## Sanitizer Helpers Added / Updated

Added `src/backend/security/security-log.ts`.

Exports:

- `MAX_SECURITY_LOG_STRING_LENGTH`
- `sanitizeStringForLog(...)`
- `sanitizeUrlForLog(...)`
- `sanitizePathnameForLog(...)`
- `sanitizeOriginForLog(...)`
- `maskEmailForLog(...)`
- `sanitizeSecurityEvent(...)`
- `logSecurityEvent(...)`

Behavior:

- Strips query strings and fragments from URLs.
- Keeps route fields as pathname only.
- Keeps origins as origin only.
- Handles unsupported URL protocols safely.
- Converts invalid URLs to safe markers.
- Caps strings at 240 characters.
- Masks emails.
- Redacts obvious token/password/authorization/cookie/session patterns in generic strings.
- Drops forbidden metadata keys such as cookies, authorization, raw bodies, tokens, phone, address, payment, database, stack, and secrets.
- Ignores nested objects and unknown huge payloads.
- Uses console logging only, matching current project style.

Updated `src/backend/security/csp-report.ts` to reuse the shared URL/string sanitizer while preserving the Step 37 CSP report shape.

## Integrations Made

Low-risk integrations completed:

- CSP report endpoint now uses `logSecurityEvent(...)` after sanitizing CSP reports.
- Blocked mutation requests now log a safe `mutation_request_blocked` event with pathname, method, sanitized origin/referer, status code, and reason.
- Rate-limit hits now log a safe `rate_limit_exceeded` event without IP address, cookies, headers, or request body.
- Admin audit-log write failures now log a safe `admin_audit_log_write_failed` event without user ID or entity ID.
- Auth host production warnings now use `logSecurityEvent(...)` with fixed warning strings.
- README now documents the security logging and observability policy.

## Integrations Skipped and Why

Skipped:

- Did not rewrite broad raw `console.error(..., error)` usage in unrelated API/page flows because that would be a wider behavior and routing pass.
- Did not add image upload failure logging because rejected data URLs/upload payloads are sensitive and logging them would create avoidable risk.
- Did not add logging for all request guard passes or normal public traffic because that would be noisy.
- Did not log client IPs from the rate limiter because IPs are personal data and the current policy favors route/key/status without identifiers.
- Did not add persistent logging, external observability, alerting, SIEM, or storage because no logging/storage policy or hosting target is approved yet.
- Did not enforce CSP or add payment/tracking domains.

## Tests Added / Updated

Added:

- `tests/security-log.test.ts`

Updated:

- `tests/csp-report.test.ts`

Coverage:

- URL query/fragment stripping.
- Relative path query/fragment stripping.
- Unsupported URL handling.
- Invalid URL handling.
- `data:` handling.
- String length caps.
- Obvious token/password/authorization redaction.
- Email masking.
- Forbidden metadata fields not retained.
- Route pathname-only sanitization.
- Origin-only sanitization.
- CSP report sanitizer still works with the shared helper.
- CSP endpoint logs sanitized structured security events only.
- `logSecurityEvent(...)` returns and emits the sanitized event shape.

Focused test command:

```bash
npx tsx --test tests/security-log.test.ts tests/csp-report.test.ts tests/csp.test.ts tests/request-guard.test.ts
```

Result: passed, 29 tests.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/security-log.test.ts tests/csp-report.test.ts tests/csp.test.ts tests/request-guard.test.ts` | Passed; 29 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 145 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |
| `git diff --check -- README.md src/backend/security/security-log.ts src/backend/security/csp-report.ts src/app/api/security/csp-report/route.ts src/backend/security/request-guard.ts src/backend/security/rate-limit.ts src/backend/admin/admin-utils.ts src/backend/auth/config.ts tests/security-log.test.ts tests/csp-report.test.ts` | Passed; Git printed CRLF normalization warnings only. |

## Production Build Result

Passed.

Next.js compiled successfully, generated 76 static pages, and retained `/api/security/csp-report` in the route table.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated product/category/search behavior was changed by Step 38.

Specifically not touched in Step 38:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: footer and payment-logo files still appear modified in the broader worktree from earlier steps, but this step did not edit them.

## Remaining Risks

- Persistent logging/storage/alerting is not implemented. This is intentional until hosting and retention policy are known.
- The rate limiter remains in-memory and per-process.
- Some unrelated raw `console.error(..., error)` paths remain and should be handled in a separate scoped pass.
- Authenticated DB-backed testing remains paused until local PostgreSQL and shadow DB are ready.
- CSP remains report-only and disabled by default; no enforcement was added.
- CSP report collection remains disabled by default and should not be enabled in production until logging/storage policy is approved.

## Recommended Next Step

Continue non-DB readiness with a focused raw server-error logging hygiene pass, or set up local PostgreSQL plus a local shadow database so DB-backed authenticated testing and product lifecycle work can resume safely.
