# Step 78: Future Mobile App Readiness Audit

## 1. Scope of Step 78

This step audited whether the current pre-launch Boilabin web backend, API routes, authentication model, cart/checkout flow, catalog/search surface, and security guardrails are ready to support a future mobile app.

This was an audit-only step. No mobile app was implemented, no runtime behavior was changed, no API contracts were changed, and no database/schema/migration work was performed.

## 2. Files changed by Step 78

- `audit-reports/78_FUTURE_MOBILE_APP_READINESS_AUDIT.md`

No source files, tests, env files, Prisma files, visual files, or assets were edited.

## 3. Current git status summary

Before creating this report, the working tree still contained only the paused visual/assets changes already identified in earlier steps:

- Modified/deleted category image assets under `public/assets/categories/**`
- Modified payment-logo assets under `public/assets/payments/**`
- Modified paused visual components:
  - `src/frontend/components/home/PromoSection.tsx`
  - `src/frontend/components/layout/Footer.tsx`
  - `src/frontend/components/layout/NewsletterForm.tsx`

No files were staged at the start of this step.

After this step, the only new file expected from Step 78 is this audit report.

## 4. Current backend/API reuse verdict for future mobile apps

Verdict: partially reusable foundation, not production-ready for a mobile app yet.

The current backend has useful reusable pieces:

- Public product listing JSON API with pagination and buyer-visible filtering.
- Search suggestion JSON API.
- Authenticated order/account/review/return routes with server-side ownership checks.
- Server-side checkout validation that ignores client-supplied prices.
- Centralized buyer-visible product filtering.
- Sanitized security logging, client-error filtering, mutation origin checks, and rate limiting.

However, the API surface is still primarily designed for the Next.js web app. A future mobile app would need additional planning before implementation:

- A mobile-compatible authentication/session model.
- A documented and stable API response contract.
- DB-backed contract and flow tests.
- A product detail/category/catalog API surface that does not depend on server-rendered pages.
- Retry/idempotency support for checkout/order creation.
- Production distributed rate limiting.
- Hosting/payment/provider decisions before payment or tracking flows.

## 5. API route readiness map for mobile

### Mostly reusable foundations

- `GET /api/products`
  - JSON response with `items`, `total`, `page`, `limit`, and `totalPages`.
  - Supports query, category, featured/new, min/max price, rating, stock, IDs, and sorting.
  - Uses centralized buyer-visible product logic.
  - Mobile gap: does not replace a complete product-detail API.

- `GET /api/search/suggestions`
  - JSON suggestion API with product/category suggestions.
  - Rate-limited.
  - Mobile gap: only suggestions, not a full mobile search contract.

- `GET /api/reviews?productId=...`
  - Returns approved reviews for a product.
  - Mobile gap: DB-backed behavior still unverified locally.

- `GET /api/coupons/validate`
  - Can support cart coupon validation.
  - Mobile gap: mixed error shape, including both `{ error }` and `{ success: false, error }`.

- `POST /api/auth/register`
  - Has validation-first behavior, mutation guard, and rate limiting.
  - Mobile gap: designed for web-origin protected requests and DB-backed user creation.

### Web-session/browser-oriented routes that need mobile-specific planning

- `/api/auth/[...nextauth]`
  - Current Auth.js flow is web-cookie oriented.
  - Mobile needs a native OAuth/deep-link/session strategy before implementation.

- `GET /api/orders`
  - Authenticated order listing with buyer/admin scoping.
  - Mobile gap: depends on `auth()` web session state.

- `POST /api/orders`
  - Strong server-side validation and stock/price checks.
  - Mobile gaps: web-origin mutation guard, no mobile token strategy, no documented idempotency key, and no mobile payment handoff.

- `POST /api/returns`
  - Authenticated and owner-scoped.
  - Mobile gap: depends on web session and mutation-origin model.

- `POST /api/reviews`
  - Authenticated, rate-limited, delivered-order checked.
  - Mobile gap: depends on web session and mutation-origin model.

- `PUT /api/account/profile`
  - Authenticated profile update.
  - Mobile gap: web session and CSRF/origin model must be adapted.

- `POST /api/account/addresses`, `PUT /api/account/addresses/[id]`, `DELETE /api/account/addresses/[id]`
  - Authenticated and scoped to current user.
  - Mobile gap: web session and mutation-origin model must be adapted.

- `POST /api/products/[id]/view`
  - Tracks product views using session or guest cookie.
  - Mobile gap: tracking/privacy policy and mobile analytics approach are not approved.

### Not primary mobile-buyer APIs

- Admin APIs under `/api/admin/**`
  - Should remain web-admin focused unless a separate admin mobile app is explicitly planned.

- `POST /api/security/csp-report`
  - Web security observability endpoint, not a mobile app API.

- `POST /api/contact` and `POST /api/newsletter`
  - Useful public form APIs, but not central to mobile commerce readiness.

## 6. Auth/session mobile readiness notes

The current auth stack uses Auth.js/NextAuth with JWT sessions, Prisma adapter, Google OAuth, and credentials login. The web app consumes that through browser cookies and server-side `auth()` calls.

This is appropriate for the current web app but not enough for a future native mobile app:

- Native apps do not naturally behave as same-origin browsers.
- The current mutation guard relies on Origin/Referer/Fetch Metadata signals that may block native mobile requests unless a mobile-safe API strategy is designed.
- Google auth needs native OAuth client/deep-link/App Link or Universal Link handling.
- There is no documented bearer-token, refresh-token, device-session, or mobile session exchange API.
- Secure token storage, logout/revocation, session refresh, and compromised-device handling are not designed yet.

Recommendation: do not start a mobile app until the mobile auth contract is chosen and tested.

## 7. Cart/checkout/order mobile readiness notes

The web cart, wishlist, and compare state are stored client-side using persisted Zustand stores. Checkout is a browser client component that posts to `/api/orders`.

Positive findings:

- The order API ignores client-supplied prices and validates products, variants, stock, coupons, payment method, and address server-side.
- Order confirmation PII remains protected by authenticated owner/admin access.
- Checkout is currently signed-in only, which avoids guest-order PII exposure.
- Online payment gateways remain disabled by default.

Mobile gaps:

- A mobile app would need its own native cart store or a server-synced cart API.
- Order creation should add idempotency/retry protection before mobile launch because mobile networks can be unstable.
- Checkout uses web session cookies and web-origin mutation protection.
- The order API is DB-backed and cannot be fully tested until local PostgreSQL is running.
- Payment handoff is not designed for native bKash/Nagad/card flows.
- Address/profile/order history APIs need DB-backed authenticated contract tests.

## 8. Product/category/search mobile readiness notes

The public catalog has a useful foundation but remains web-page oriented:

- `GET /api/products` can back product grids and search results.
- Category and search pages use server-rendered Prisma queries rather than dedicated mobile JSON route contracts.
- Product detail data is loaded by the Next.js product page, not by a standalone product-detail API.
- Category pages include children, filters, product count, pagination, and SEO data server-side.
- Search result pages include product grids and filters server-side; the suggestions API is separate.

Mobile gaps:

- Add a stable product detail API by slug or ID before mobile development.
- Add a category tree/list API and category-detail/product listing contract if mobile should avoid duplicating page logic.
- Document image fields, thumbnail expectations, price fields, stock fields, variant fields, and pagination semantics.
- DB-backed catalog tests remain blocked until local PostgreSQL is reachable.

## 9. Payment/tracking/seller paused-state notes

- Online payment remains intentionally disabled.
- Tracking API/integrations remain intentionally disabled.
- Seller marketplace implementation remains intentionally paused.

Future mobile app work must not enable these implicitly. Mobile checkout should wait for payment gateway provider decisions, webhook verification, reconciliation, native payment handoff design, and production privacy/security review.

## 10. API response contract risks for mobile

The current response shapes are usable for the web app but not stable enough for external/mobile clients:

- Most errors use `{ error: string }`.
- Coupon validation also uses `{ success: false, error }`.
- Success payloads are route-specific.
- Admin and buyer routes do not use a single app-wide API response envelope.
- Some routes rely on browser status handling rather than mobile-client-friendly error codes.

For mobile readiness, future work should define a compatibility-aware API contract:

- Keep `{ error: string }` as the minimum failure shape for existing routes.
- Add optional machine-readable error codes only after compatibility tests.
- Preserve route-specific success payloads until callers are migrated.
- Preserve 204/file/CSV responses where applicable.
- Keep unknown server errors generic and sanitized.
- Consider versioned APIs such as `/api/v1/**` or a focused mobile facade after DB-backed testing is available.

## 11. Image/media/mobile performance notes

The web app uses Next/Image and server-rendered image sizing. A mobile app will need explicit image contracts:

- Stable image URLs for product cards and product detail galleries.
- Thumbnail/preview/full-size media distinctions.
- CDN or hosting image delivery decisions.
- Low-bandwidth Bangladesh mobile assumptions.
- Image placeholder/fallback policy.
- Upload media rules if mobile seller/admin upload is ever planned.

Paused category image and payment-logo asset changes remain outside this step and were not touched.

## 12. Security/privacy/mobile app risks

Main risks before mobile work:

- Mobile authentication model is undefined.
- Native requests may not satisfy current browser-origin mutation protection.
- API response contracts are not stable enough for external/mobile clients.
- Production rate limiting is still in-memory/per-process.
- DB-backed authenticated tests are blocked by missing local PostgreSQL service.
- Checkout/order creation needs retry-safe idempotency before mobile use.
- Order/address APIs handle PII and need strict mobile logging/privacy rules.
- Product view tracking needs explicit privacy policy and consent decisions before mobile analytics.
- Payment flows must not be added before provider, webhook, reconciliation, and native handoff decisions.

## 13. Recommended future mobile app approach, without choosing too early

Do not choose a mobile implementation stack yet.

Recommended staged approach:

1. Stabilize backend contracts and DB-backed tests first.
2. Decide auth/session strategy for native mobile.
3. Add versioned or mobile-specific API contracts where necessary.
4. Decide payment/provider/hosting/CDN/push notification policies.
5. Then choose implementation:
   - React Native/Expo may be attractive because the project already uses TypeScript.
   - Flutter may be reasonable if the team prefers Dart/native UI patterns.
   - PWA/WebView can be useful for a limited prototype but should not be treated as a full native commerce solution without a separate review.

## 14. Work that must wait for local DB readiness

These should remain blocked until local PostgreSQL is installed/running and DB-backed tests can run safely:

- Authenticated order API tests.
- Account/profile/address API tests.
- Product detail/category/search DB-backed contract tests.
- Review/return/coupon DB-backed flow tests.
- Product lifecycle migration.
- Seed/test fixture planning.
- Full production build verification without the local PostgreSQL blocker.

Current state:

- DB URL-shape guard reports local/separate URLs.
- Local PostgreSQL service is still unreachable during build.
- Docker, Docker Compose, and `psql` were unavailable in the latest local DB activation reports.

## 15. Work that must wait for payment/hosting/provider decisions

These should remain paused:

- bKash/Nagad/card online payment implementation.
- Payment webhook verification and reconciliation.
- Native payment redirect/deep-link/app-link handling.
- Tracking API/analytics integration.
- Push notification provider selection.
- CDN/image hosting decisions.
- Production distributed rate-limit storage.
- App store privacy/data-safety disclosures.
- Public API base URL and environment/provider configuration.

## 16. Confirmation no mobile app implementation was added

Confirmed. No mobile app files, native app scaffolds, React Native/Expo/Flutter/Capacitor/PWA/WebView implementation, mobile-specific routes, or mobile runtime code were added.

## 17. Confirmation no runtime behavior was changed

Confirmed. This step created an audit report only. No application code, API route, auth behavior, checkout behavior, security helper, payment config, tracking config, or frontend runtime behavior was changed.

## 18. Confirmation no prohibited files were touched

Confirmed. Step 78 did not touch:

- `public/assets/categories/**`
- `public/assets/payments/**`
- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- Prisma schema or migrations
- Env files
- Source/API/test files
- Payment, tracking, seller, or product lifecycle implementation files

No staging or commit commands were run.

## 19. Validation/build results

Commands run:

- `npm run db:url:safety`
  - Passed.
  - Reported `DATABASE_URL` local, `SHADOW_DATABASE_URL` local, shadow database separate yes, local migration ready yes.
  - No database connection attempted.

- `npm run db:prisma:local:validate`
  - Passed.
  - Prisma schema validation succeeded through the local env guardrail.
  - No database connection attempted.

- `npm run db:prisma:local:generate`
  - Passed.
  - Prisma Client generation succeeded through the local env guardrail.
  - No database connection attempted.

- `npm run typecheck`
  - Passed.

- `npm run lint`
  - Passed with no ESLint warnings or errors.
  - Noted existing Next.js deprecation warning for `next lint`.

- `npm test`
  - Passed.
  - 173 tests passed.

- `npm run build`
  - Failed during static page generation only because Prisma could not reach local PostgreSQL at `localhost:5432`.
  - The build compiled successfully before the known local database service blocker.
  - No non-DB build regression was identified.

## 20. Remaining risks

- Future mobile app work is blocked by missing local PostgreSQL service for DB-backed verification.
- Current APIs are not yet versioned or documented as mobile contracts.
- Auth.js/browser-cookie sessions need a native mobile strategy before mobile implementation.
- Mutation origin checks are web-safe but not mobile-ready without a separate design.
- In-memory rate limiting remains insufficient for production/distributed deployments.
- Checkout/order creation needs idempotency before mobile clients rely on it.
- Payment/tracking/seller work remains paused and must not be pulled into mobile planning prematurely.
- Paused visual/assets files remain dirty and excluded from this step.

## 21. Recommended next step

Continue with safe non-DB planning or resolve the local PostgreSQL service blocker.

Best next technical step: install/enable local PostgreSQL or Docker, start the local app and shadow databases, then rerun the DB-backed readiness/build checks before adding authenticated DB-backed API contract tests. Only after that should the project plan mobile-specific API contracts or native auth/session support.
