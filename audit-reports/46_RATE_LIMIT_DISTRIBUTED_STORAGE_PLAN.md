# Step 46: Rate Limit Distributed Storage Plan

Date: 2026-06-02

## 1. Scope of Step 46

Created a production rate-limit storage readiness plan for the current in-memory rate limiter.

This was a planning and audit step only. No Redis, KV, database-backed, or distributed rate limiting was implemented. No runtime behavior, API response shape, status code, header, frontend/admin caller, environment file, package dependency, database file, footer file, payment-logo asset, payment backend, tracking API, seller marketplace, or product lifecycle behavior was changed.

## 2. Files Changed

Changed in this Step 46 task:

- `audit-reports/46_RATE_LIMIT_DISTRIBUTED_STORAGE_PLAN.md`

No production code or environment template was changed.

## 3. Current Rate-Limit Implementation Summary

Current implementation file:

- `src/backend/security/rate-limit.ts`

Current behavior:

- Uses a module-local in-memory `Map<string, RateLimitEntry>` named `buckets`.
- Accepts `RateLimitOptions` with `key`, `limit`, and `windowMs`.
- Builds bucket keys as `<route-key>:<client-id>`.
- Derives client ID from the first `x-forwarded-for` value, then `x-real-ip`, then `unknown`.
- Sanitizes forwarded identifiers by trimming, capping at 128 characters, and rejecting whitespace, quotes, backticks, and backslashes.
- Prunes expired buckets after the bucket map reaches 1,000 entries.
- Caps retained buckets at 10,000 entries by deleting oldest entries.
- Returns `null` when a request is allowed.
- Returns a `NextResponse` with `429` when a request is limited.
- Logs a sanitized `rate_limit_exceeded` security event with route, method, status, key, limit, and window only.

No persistent storage, cross-process coordination, Redis/KV adapter, database write, or external service exists today.

## 4. Current Rate-Limit Usage Map

| Route/helper | Method | Key | Limit/window | Position in handler |
| --- | --- | --- | --- | --- |
| `src/app/api/auth/register/route.ts` | `POST` | `auth:register` | `5 / 60s` | After mutation guard, before JSON parse validation and DB lookup. |
| `src/app/api/contact/route.ts` | `POST` | `contact:create` | `5 / 60s` | After mutation guard, before JSON parse validation and DB write. |
| `src/app/api/newsletter/route.ts` | `POST` | `newsletter:create` | `8 / 60s` | After mutation guard, before JSON parse validation and DB upsert. |
| `src/app/api/reviews/route.ts` | `POST` | `reviews:create` | `6 / 60s` | After mutation guard, before auth and DB lookup/write. |
| `src/app/api/orders/route.ts` | `POST` | `orders:create` | `10 / 60s` | After mutation guard, before auth, request parsing, and DB work. |
| `src/app/api/search/suggestions/route.ts` | `GET` | `search:suggestions` | `60 / 60s` | First branch before query validation and DB lookup. |

Middleware does not currently apply rate limiting.

## 5. Current Response/Header Contract

The current 429 contract must remain backward-compatible later:

```json
{ "error": "Too many requests. Please try again shortly." }
```

Status:

- `429`

Headers:

- `Retry-After`: seconds until the current window resets.
- `X-RateLimit-Limit`: configured numeric limit.
- `X-RateLimit-Remaining`: currently `0` when limited.
- `X-RateLimit-Reset`: epoch seconds for reset time.

Allowed requests currently return `null` from the helper and do not add rate-limit headers.

Security logging contract:

- Continue logging only sanitized security events.
- Do not log IP addresses, full headers, cookies, authorization headers, tokens, request bodies, emails, phone numbers, delivery data, payment data, or database URLs.

## 6. Existing Test Coverage

Current no-DB tests in `tests/api-error-contract.test.ts` cover:

- Rate limiter returns stable `429` JSON body.
- `Retry-After` is present and numeric.
- `X-RateLimit-Limit` is present.
- `X-RateLimit-Remaining` is `0` when limited.
- Unsafe forwarded identifiers fall back to the safe `unknown` bucket while preserving the same 429 contract.
- Limited requests emit one sanitized warning through the security log sink.

Related reports:

- Step 41 documented the current rate-limit error shape as `{ error: 'Too many requests. Please try again shortly.' }`.
- Step 43 extended no-DB validation-first tests and kept the rate-limit response contract protected.

## 7. Production Weakness of In-Memory Rate Limiting

The current limiter is acceptable for local development and single-process smoke testing, but it is not production-distributed.

Production weaknesses:

- Each server process has its own independent bucket map.
- Horizontal scaling lets the same client consume the limit separately on each instance.
- Serverless and edge runtimes may isolate memory per worker, per region, or per cold start.
- Restarts and deploys reset all counters.
- The 10,000 bucket cap can evict active buckets under abuse pressure.
- There is no shared denylist, centralized analytics, or durable audit trail.
- It can create a false sense of protection for register, contact, newsletter, review, order, and search abuse.
- It does not defend well against distributed bot traffic or clients rotating IPs.

## 8. Future Distributed Storage Options

### Managed Redis-compatible store

Suitable for most production Next.js deployments. Redis supports atomic increment/expiry patterns that fit fixed-window or sliding-window rate limiting.

Pros:

- Shared state across server instances and serverless workers.
- Atomic operations can preserve limits under concurrency.
- Mature operational model.
- Can support future denylist or abuse analytics.

Cons:

- Requires a provider, credentials, latency budgeting, timeout policy, and secret handling.
- Requires dependency and adapter work later.

### Upstash Redis / Upstash Rate Limit

Good fit if the app is deployed to serverless or edge-style hosting. Upstash documents its rate-limit tooling as designed for serverless functions, Vercel, Cloudflare Workers, and similar HTTP-preferred environments.

Pros:

- HTTP-based access works well where TCP Redis clients are awkward.
- Existing rate-limit library patterns can reduce implementation risk.
- Serverless pricing can fit pre-launch/early traffic.

Cons:

- Adds package/vendor dependency.
- Requires careful compatibility wrapping so this app keeps its current `{ error }` body and headers.
- Provider timeout/fail-open behavior must be explicitly decided.

Reference:

- https://upstash.com/docs/oss/sdks/ts/ratelimit/overview

### Vercel Marketplace Redis integration

If hosting later lands on Vercel, use a current Redis provider through Vercel Marketplace rather than planning around the old Vercel KV product. Vercel documentation says Vercel KV is no longer available for new projects and existing KV stores were moved to Upstash Redis in December 2024.

Pros:

- Natural fit if the production host is Vercel.
- Credentials can be injected through the hosting environment.
- Redis is explicitly listed by Vercel as a fit for rate limiting.

Cons:

- Depends on final hosting choice.
- "Vercel KV" should not be treated as a new-project target name.

References:

- https://vercel.com/docs/redis
- https://vercel.com/docs/storage

### Self-hosted Redis

Possible if the project later runs on a VPS or managed server.

Pros:

- Full control.
- Can be inexpensive at small scale.

Cons:

- Requires operational ownership: firewalling, backups, monitoring, upgrades, network access, and incident response.
- Not ideal before hosting architecture is chosen.

### PostgreSQL/database-backed rate limiting

Not recommended as the first production choice for this project.

Pros:

- Could avoid a separate service if a production PostgreSQL database already exists.

Cons:

- Adds write load to the primary app database.
- Requires schema/index/migration work, which is currently blocked by local DB readiness.
- Can become a bottleneck or outage coupling point for public abuse traffic.
- Not appropriate for this planning step.

### CDN/WAF/platform rate limiting

Useful as a complementary outer layer.

Pros:

- Can block obvious abusive traffic before the app runs.
- Helpful for broad IP/path limits and bot protection.

Cons:

- Does not replace app-specific limits such as per route key, auth/register, checkout/order, or review behavior.
- May not preserve this app's JSON response contract.

## 9. Recommended Future Approach

Recommended later approach: **adapter-first Redis-compatible distributed storage, with local memory retained only for local development and tests**.

Implementation should wait until a hosting target is selected and dependency changes are approved.

Preferred shape:

1. Extract rate-limit decision logic behind a store adapter.
2. Keep the current public response contract in one response builder.
3. Keep current route keys, limits, and windows unless a separate behavior review changes them.
4. Default local development to the current memory store.
5. Require a distributed store in production unless explicitly disabled by a reviewed emergency flag.
6. Use a Redis-compatible managed provider later. If hosting is Vercel/serverless, prefer Upstash Redis or another Vercel Marketplace Redis provider over the old Vercel KV name.

Proposed adapter shape for later:

```ts
type RateLimitDecision = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfter: number
}

type RateLimitStore = {
  check(input: {
    bucketKey: string
    limit: number
    windowMs: number
    now: number
  }): Promise<RateLimitDecision>
}
```

Expected stores:

- `MemoryRateLimitStore` for local/test compatibility.
- `RedisRateLimitStore` or `UpstashRateLimitStore` for production.

Compatibility note:

- The current helper is synchronous. A distributed store will require async calls, so implementation will need a controlled call-site update to `await` the limiter. That should be done only after compatibility tests are in place.

## 10. Proposed Env/Config Names for Later

Do not add these yet. They are proposed names only:

- `RATE_LIMIT_STORE="memory"` or `"redis"`
- `RATE_LIMIT_KEY_PREFIX="boilabin"`
- `RATE_LIMIT_FAIL_OPEN="true"` or `"false"`
- `RATE_LIMIT_TIMEOUT_MS="250"`
- `RATE_LIMIT_REDIS_URL`
- `RATE_LIMIT_REDIS_TOKEN`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Rules for later:

- All Redis tokens/URLs must be server-only.
- Do not expose Redis credentials through `NEXT_PUBLIC_*`.
- Do not log Redis URLs or tokens.
- Keep production rate limiting disabled from payment/tracking/seller rollout decisions.

## 11. Proposed Compatibility Tests for Later

Before implementation:

- Memory store preserves current fixed-window behavior.
- Response builder preserves status `429`.
- Response builder preserves `{ error: 'Too many requests. Please try again shortly.' }`.
- Response builder preserves `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.
- Allowed requests still do not unexpectedly alter route responses.
- Client identifier sanitization still rejects unsafe forwarded identifiers.
- Route keys remain unchanged for register/contact/newsletter/reviews/orders/search suggestions.
- Security logging remains sanitized and does not include raw IPs, headers, cookies, auth headers, bodies, tokens, or secrets.

During implementation with mocks:

- Redis adapter uses atomic increment/expiry semantics.
- First request creates a bucket with an expiry.
- Requests within the window increment the same bucket.
- Exceeded requests return the same app response contract.
- Window reset allows requests again.
- Provider timeout follows the approved fail-open/fail-closed policy.
- Production config without distributed storage warns or fails according to the approved deployment policy.

After local DB and authenticated test readiness:

- Register/contact/newsletter/review/order/search route-level tests confirm limits before expensive DB work.
- Authenticated order/review flows preserve current client behavior when limited.

## 12. Confirmation No Runtime Behavior Was Changed

Confirmed.

This step changed only the audit report. It did not change:

- `src/backend/security/rate-limit.ts`
- API routes
- middleware
- request guard behavior
- response bodies
- status codes
- response headers
- security logging behavior
- frontend/admin callers
- package dependencies
- environment templates

## 13. Confirmation No Prohibited Files Were Touched

Confirmed Step 46 did not touch:

- database code
- `prisma/schema.prisma`
- `prisma/migrations/**`
- seed/reset/db-push scripts
- product lifecycle behavior
- footer files
- newsletter visual layout
- payment-logo assets
- visual/UI styling files
- homepage/category visuals
- payment backend
- tracking API
- seller marketplace
- CSP enforcement
- production-only integrations

No migrations, seed, reset, `db push`, SQL, Docker, or database connection commands were run.

## 14. Validation Results

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed as a non-mutating safety check; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, shadow separate `no`, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## 15. Remaining Risks

- Current production readiness still has only per-process in-memory rate limiting.
- A future multi-instance, serverless, or horizontally scaled launch could bypass effective limits.
- Local DB readiness is still blocked, so DB-backed authenticated flow tests remain paused.
- Product lifecycle migration remains paused.
- No Redis/KV provider, credentials, retention policy, timeout policy, or hosting target has been selected.
- Abuse traffic from rotating IPs or distributed clients will still require WAF/bot protection in addition to app-level rate limiting.
- Footer/payment-logo files remain modified in the broader worktree from earlier manual/roadmap work, but Step 46 did not edit them.

## 16. Recommended Next Step

Continue non-DB roadmap work, or choose a hosting direction so the distributed rate-limit provider decision can be made safely.

When implementation is approved later:

1. Add compatibility tests first.
2. Add a rate-limit store adapter interface.
3. Keep memory store for local/test.
4. Add a Redis-compatible production store only after dependency and provider approval.
5. Preserve the current 429 response body, status code, headers, route keys, and sanitized logging behavior.
