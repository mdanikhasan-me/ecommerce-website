# Step 35: Route-Aware CSP Planning Audit

Date: 2026-06-02

## Scope

This was a planning and audit step only. No global Content Security Policy was implemented.

Local PostgreSQL is still not ready, so database-backed lifecycle migration and full authenticated DB-flow testing remain paused.

## Files Changed

Changed in this Step 35 task:

- `audit-reports/35_ROUTE_AWARE_CSP_PLANNING_AUDIT.md`

No code, config, schema, migration, footer, payment-logo, visual/UI, seller, payment, tracking, product lifecycle, product/category/search behavior, dependency, or database files were changed.

## Current Security Headers Summary

Current global headers are configured in `next.config.js` through `headers()`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-DNS-Prefetch-Control: off`
- `X-Permitted-Cross-Domain-Policies: none`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` only when `NODE_ENV === 'production'`

Next Image also allows SVG optimization with defensive handling:

- `dangerouslyAllowSVG: true`
- `contentDispositionType: 'attachment'`
- SVG image CSP: `default-src 'self'; script-src 'none'; sandbox;`

There is no app-wide CSP for normal pages yet.

## Route and Surface CSP Map

| Surface | Routes | CSP Needs | Rollout Notes |
| --- | --- | --- | --- |
| Public storefront | `/`, `/about`, `/category`, `/category/[slug]`, `/products/[slug]`, `/search`, `/deals`, `/new-arrivals`, `/contact`, `/faq`, `/shipping`, `/returns`, `/terms`, `/privacy`, `/help`, `/track-order` | Next runtime scripts, React hydration, inline JSON-LD on SEO pages, local API fetches, optimized local/remote images | Start report-only here after header helper exists. Product/category/FAQ/home need JSON-LD allowance. |
| Auth pages | `/auth/login`, `/auth/register`, `/api/auth/[...nextauth]` | Next/Auth.js runtime, same-origin auth API calls, Google OAuth redirects/forms, possible Google profile image domain after sign-in | Keep route-specific allowance for Google OAuth endpoints and avoid breaking credentials login. |
| Account/private buyer pages | `/account`, `/account/profile`, `/account/addresses`, `/account/orders`, `/account/orders/[id]` | Same-origin API calls, authenticated cookies, local images/user avatars | Report-only after unauthenticated redirect and signed-in local test users are available. |
| Cart and checkout | `/cart`, `/checkout`, `/api/orders`, `/api/coupons/validate` | Same-origin API calls, local storage hydration, toast styles, future payment gateway redirects/forms/scripts | Keep current payments disabled; do not add payment gateway CSP exceptions until gateway implementation exists. |
| Order confirmation | `/order/[orderNumber]/confirmation` | Same-origin page rendering only; private/noindex; no public PII without owner/admin auth | Use same private-page CSP; verify unauthorized 404 still works under CSP. |
| Admin dashboard/pages | `/admin/**`, `/api/admin/**` | Same-origin API calls, admin upload previews using `data:image/*`, local `/uploads/admin/**`, forms/tables/toasts | Admin needs careful `img-src` and possibly `connect-src` testing for uploads and previews. |
| Public APIs | `/api/products`, `/api/search/suggestions`, `/api/newsletter`, `/api/contact`, `/api/reviews`, `/api/returns`, `/api/products/[id]/view` | API responses do not need page script/style/image directives | Use minimal API CSP or skip CSP for JSON APIs; keep request guard/rate limiter behavior unchanged. |
| Metadata routes | `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | Text/XML/image responses; no scripts | Prefer no CSP or very minimal `default-src 'none'` only after checking generated responses. |
| Static assets/uploads | `/_next/static/**`, `/assets/**`, `/uploads/**`, optimized image route | Asset delivery; image/script/style loading driven by parent page CSP | Avoid applying page CSP directly to images/fonts/scripts unless tested. |

## Required Source Inventory

### Script Sources

Current needs:

- `'self'` for Next.js runtime chunks from `/_next/static/**`.
- Inline scripts for Next.js hydration and framework bootstrapping.
- Inline `application/ld+json` from `src/backend/seo/JsonLd.tsx`.

Planning note:

- A strict nonce-based CSP is preferred long term, but it requires middleware-generated nonces and wiring nonce support through Next-rendered scripts where possible.
- A first report-only policy may need temporary `'unsafe-inline'` in `script-src` to observe violations without breaking hydration or JSON-LD.
- Do not add third-party script hosts until analytics/tracking/payment is actually implemented and reviewed.

### Style Sources

Current needs:

- `'self'` for compiled CSS.
- Inline style attributes and injected styles may appear from React/Next and `react-hot-toast`.
- `next/font/google` self-hosts generated font files, but can still create framework-managed style tags/classes.

Planning note:

- Initial report-only CSP should include `style-src 'self' 'unsafe-inline'`.
- Enforced CSP can tighten later only after browser checks confirm no inline style violations.

### Image Sources

Current sources:

- `'self'` for local assets, branding, category images, payment logos, uploads, and optimized images.
- `data:` for previews/placeholders and admin/client image handling.
- `blob:` may be needed for future file preview flows.
- Remote image allowlist from `next.config.js`:
  - `https://images.unsplash.com`
  - `https://uploadthing.com`
  - `https://utfs.io`
  - `https://lh3.googleusercontent.com`
- `https://placehold.co` is referenced by a placeholder utility and should either be allowed or replaced before enforcement.

Planning note:

- Keep `img-src` explicit. Do not use `https:` as a broad wildcard unless a report-only pass proves many legitimate hosted product media origins are required.

### Font Sources

Current needs:

- `'self'` for `next/font/google` generated local font files.
- `data:` may be useful for browser/font fallback edge cases but should be validated before enforcement.

No direct runtime dependency on `fonts.googleapis.com` or `fonts.gstatic.com` was found because `next/font/google` self-hosts the fonts at build time.

### Connect Sources

Current needs:

- `'self'` for all local API fetches:
  - product view
  - reviews
  - newsletter
  - contact
  - search suggestions
  - cart coupon validation
  - checkout order creation
  - account/admin mutations
  - Auth.js routes
- Local development origins:
  - `http://localhost:3000`
  - `http://127.0.0.1:3100`

Future needs only when implemented:

- Payment gateway API/redirect origins.
- Analytics/tracking endpoints.
- Error reporting/monitoring endpoints.

### Frame/Form/Navigation Sources

Current needs:

- `frame-ancestors 'none'` should align with existing `X-Frame-Options: DENY`.
- `form-action 'self'` should support credentials login and Auth.js local form posts.
- OAuth redirect/navigation to Google happens through Auth.js flow and browser navigation, not necessarily XHR. Test before adding strict `navigate-to`.

Future needs only when implemented:

- Payment gateway redirect/form origins.
- Hosted checkout iframe/frame origins if a gateway requires them.

## Proposed Report-Only CSP

Initial report-only policy for app pages:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://images.unsplash.com https://uploadthing.com https://utfs.io https://lh3.googleusercontent.com https://placehold.co;
font-src 'self' data:;
connect-src 'self' http://localhost:3000 http://127.0.0.1:3100;
media-src 'self' blob:;
manifest-src 'self';
worker-src 'self' blob:;
upgrade-insecure-requests;
```

Report-only notes:

- Use `Content-Security-Policy-Report-Only`, not `Content-Security-Policy`.
- Do not include payment, tracking, or analytics domains until those integrations exist.
- Do not add wildcard `*` or broad `https:` unless violations prove a legitimate need and a narrower allowlist is not practical.
- `upgrade-insecure-requests` should be production-only; avoid it for local HTTP development if it causes local testing noise.

## Proposed Enforced CSP Later

Later enforced baseline after report-only data and browser QA:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' 'nonce-{requestNonce}' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://images.unsplash.com https://uploadthing.com https://utfs.io https://lh3.googleusercontent.com https://placehold.co;
font-src 'self' data:;
connect-src 'self';
media-src 'self' blob:;
manifest-src 'self';
worker-src 'self' blob:;
upgrade-insecure-requests;
```

Enforcement notes:

- Replace `'unsafe-inline'` for scripts with a nonce strategy if Next.js/App Router integration can be verified.
- JSON-LD scripts need either the same nonce or a route-specific allowance strategy.
- Keep `style-src 'unsafe-inline'` until inline style usage from framework/runtime/toast/admin widgets is audited in real browser checks.
- Add production site origin and staging origin only when hosting is known.
- Add payment/tracking hosts only after those features are implemented and reviewed.

## Route-Aware Rollout Plan

1. Build a CSP helper that produces named policies for route families:
   - public page policy
   - auth policy
   - account/private policy
   - checkout policy
   - admin policy
   - API/minimal policy
   - metadata/minimal policy

2. Implement report-only headers first.
   - Prefer middleware for route-aware response headers.
   - Keep `next.config.js` for static global hardening headers already in place.
   - Avoid enforcement in the first implementation.

3. Add a local report endpoint only if it can be done without PII/secrets.
   - Use sanitized logging.
   - Do not store raw URLs with query strings if they may contain tokens or PII.
   - Consider not adding an endpoint until hosting/logging strategy exists.

4. Browser QA report-only pass.
   - Desktop and mobile.
   - Public storefront.
   - Product/category/search.
   - Login/register and Google sign-in start flow.
   - Account/admin after safe local DB/test users exist.
   - Checkout redirect and checkout UI after safe local DB/test users exist.

5. Tighten report-only policy from observed violations.

6. Enforce only after:
   - no unexpected report-only violations remain,
   - production/staging origins are known,
   - OAuth has been tested,
   - payment/tracking domains are either absent or explicitly modeled,
   - JSON-LD still validates.

## Where CSP Should Live

Recommended shape:

- Keep existing general hardening headers in `next.config.js`.
- Add route-aware CSP later through middleware because route family decisions are easier there than in a single `next.config.js` source rule.
- Use helper functions for CSP construction so tests can verify each route-family policy.
- Avoid hardcoding production-only payment/tracking origins before integrations exist.

`next.config.js` alone is enough for one global static CSP, but that is not recommended for this app because admin uploads, auth/OAuth, JSON-LD, checkout, metadata routes, and future gateways need different risk profiles.

## Risks and Breakage Points

- Next.js hydration can break if inline runtime scripts are blocked.
- JSON-LD rich-result scripts can be blocked if inline `application/ld+json` is not accounted for.
- React Hot Toast or framework-managed inline styles can trigger `style-src` violations.
- Google OAuth can fail if form/navigation/connect behavior is restricted too early.
- Product/category images can disappear if remote image hosts are omitted from `img-src`.
- Admin image previews/uploads can fail if `data:` or `blob:` image sources are blocked.
- Future payment redirects/forms/hosted checkout pages can fail if gateway domains are not route-scoped.
- Newsletter/contact/review/return forms can fail if `connect-src` blocks same-origin APIs.
- `upgrade-insecure-requests` can make local HTTP testing noisy if applied outside production.
- A CSP report endpoint can leak sensitive URLs unless sanitized.

## Future Payment, Tracking, and OAuth Considerations

Payment:

- Keep online payments disabled until gateway initiation, webhook verification, and reconciliation exist.
- Do not add gateway domains to CSP early.
- When a gateway is selected, document exact `connect-src`, `form-action`, `frame-src`, `script-src`, and `img-src` needs for only the checkout/payment routes.

Tracking/analytics:

- Do not enable tracking API or analytics scripts yet.
- Add analytics domains only after consent/privacy requirements and implementation are approved.
- Avoid broad `script-src https:` or `connect-src https:`.

OAuth:

- Current provider is Google through Auth.js.
- Google profile images may use `https://lh3.googleusercontent.com`, already present in image config.
- OAuth browser navigation should be tested under report-only CSP before enforcement.

## Testing Plan Before Enforcement

Automated/source tests:

- Add CSP helper tests for each route-family policy.
- Assert no wildcard `*` in `default-src`, `script-src`, `connect-src`, or `img-src`.
- Assert payment/tracking domains are absent until those features are enabled.
- Assert production enforced policy does not include report-only-only concessions unless justified.

Browser/report-only tests:

- Run local production with report-only CSP.
- Visit `/`, `/category`, `/category/[slug]`, `/search`, `/products/[slug]`, `/auth/login`, `/auth/register`, `/cart`, `/checkout`, `/admin/dashboard`, `/robots.txt`, `/sitemap.xml`.
- Check console CSP violations and report endpoint/log output.
- Verify JSON-LD still appears on homepage, product, category, and FAQ pages.
- Verify images render from all allowed current hosts.
- Verify unauthorized protected-route redirects still work.
- After local DB is ready, verify signed-in account/admin/checkout flows.

Production/staging readiness tests:

- Use a staging host with the real canonical origin.
- Verify OAuth callback host configuration.
- Verify no CSP report logs contain secrets, PII, or full sensitive query strings.
- Run Lighthouse/browser smoke checks after report-only and before enforcement.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js reported only the standard `next lint` deprecation notice. |
| `npm test` | Passed; 122 tests, 28 suites, 0 failures. |
| `npm run build` | Passed. |

## Production Build Result

Passed.

Next.js compiled successfully, generated 75 static pages, and emitted the route manifest. No CSP was implemented or enforced during this build.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated product/category/search behavior was changed.

Specifically not touched in Step 35:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: some of those files still appear modified in the broader worktree from earlier steps, but Step 35 did not edit them.

## Recommended Next Step

Do not enforce CSP yet.

Next safe implementation step, if continuing non-database security work:

1. Add a route-aware CSP helper and tests only.
2. Add report-only CSP middleware behind a clear environment flag.
3. Run browser/CDP smoke checks and inspect violations.

If local PostgreSQL becomes available first, resume DB readiness/lifecycle migration work before authenticated CSP browser QA.
