# Step 58: Group 7 Frontend Auth Flow and Browser Smoke Review

## 1. Scope of Step 58

This was a review-only pre-commit audit for Commit Group 7 plus a browser/mobile smoke checkpoint for safe Group 7, Group 8, and selected Group 4 routes.

Reviewed Group 7:

- frontend performance/auth-flow technical changes
- login and checkout server/client split
- cart drawer lazy loading
- account/auth/cart noindex layout wrappers
- storefront/root layout changes related to cart loading and metadata URL handling

Browser/mobile smoke context:

- homepage category cards with product counts
- login page
- cart
- checkout/account/admin unauthenticated redirects
- category index
- robots and sitemap

No staging, commit, revert, delete, rename, source edit, test edit, README edit, env edit, migration, database command, Docker command, dependency change, deployment, payment enablement, tracking enablement, seller implementation, CSP enforcement, or runtime behavior change was performed in this step.

## 2. Files changed by Step 58

Created only:

- `audit-reports/58_GROUP7_FRONTEND_AUTH_FLOW_AND_BROWSER_SMOKE_REVIEW.md`

## 3. Group 7 file review

| File | Status | Review verdict | Notes |
| --- | --- | --- | --- |
| `src/app/(store)/account/layout.tsx` | Untracked | Safe | Adds private account noindex metadata wrapper and returns children unchanged. |
| `src/app/(store)/auth/layout.tsx` | Untracked | Safe | Adds noindex metadata for auth pages and returns children unchanged. |
| `src/app/(store)/auth/login/page.tsx` | Modified | Safe with warning | Converts login page to an async server component that resolves `searchParams`, sanitizes `callbackUrl` with `getSafeCallbackUrl`, and passes props to `LoginForm`. Removes client `useSearchParams`/empty Suspense shell. |
| `src/app/(store)/cart/layout.tsx` | Untracked | Safe | Adds private cart noindex metadata wrapper and returns children unchanged. |
| `src/app/(store)/checkout/page.tsx` | Modified | Safe with warning | Moves checkout auth gate server-side with `auth()` and `redirect('/auth/login?callbackUrl=/checkout&reason=checkout')`; renders `CheckoutClient` only for authenticated users. |
| `src/app/(store)/layout.tsx` | Modified | Safe with warning | Replaces eager `CartDrawer` with `LazyCartDrawer`. Does not edit `Footer` or `Header`. |
| `src/app/layout.tsx` | Modified | Safe | Uses `getSiteUrl()` for `metadataBase` and Open Graph URL. This aligns with Group 4 canonical URL policy. |
| `src/frontend/components/auth/LoginForm.tsx` | Untracked | Safe with warning | Extracted client login UI and preserves credential/Google sign-in behavior. Uses sanitized `callbackUrl` prop supplied by the server page. |
| `src/frontend/components/cart/LazyCartDrawer.tsx` | Untracked | Safe with warning | Dynamically imports `CartDrawer` with `ssr: false`; loads after drawer opens or persisted cart items exist. |
| `src/frontend/components/checkout/CheckoutClient.tsx` | Untracked | Safe with warning | Extracted existing checkout client UI/order-placement flow. Empty cart still redirects to `/cart`. Online payment options remain disabled unless existing payment flag is explicitly enabled elsewhere. |

## 4. Login/auth-flow verdict

Verdict: safe to manually stage later, with normal browser-review caution.

Findings:

- Login page no longer depends on client `useSearchParams` for initial callback handling.
- `callbackUrl` is resolved server-side and passed through `getSafeCallbackUrl(...)`.
- Safe callback tests already cover internal paths, external URL rejection, protocol-relative rejection, backslash rejection, and fallback behavior.
- Credential sign-in still uses `signIn('credentials', { redirect: false })`.
- Google sign-in still uses `signIn('google', { callbackUrl })`.
- Register link encodes the callback value.
- Browser smoke confirmed login form fields render on desktop and mobile.

Remaining caution:

- Google OAuth was not exercised because live external auth was out of scope.
- Authenticated post-login redirects were not tested because local DB/test user readiness is still blocked.

## 5. Checkout/cart/account protected-route verdict

Verdict: safe to manually stage later.

Findings:

- `/checkout` now redirects unauthenticated users server-side before loading checkout UI.
- Browser smoke confirmed `/checkout` lands on `/auth/login?callbackUrl=/checkout&reason=checkout` on desktop and mobile.
- The checkout login reason banner rendered on mobile smoke output.
- `/account/profile` redirected to `/auth/login?callbackUrl=%2Faccount%2Fprofile`.
- `/admin/dashboard` redirected to `/auth/login?callbackUrl=%2Fadmin%2Fdashboard`.
- `/cart` rendered at desktop and mobile widths.
- Empty cart visual state rendered without runtime exceptions.

Remaining caution:

- Authenticated checkout form submission and account/admin pages behind login were not tested because local DB/test accounts are not ready.
- `CheckoutClient` still posts to `/api/orders` only after authenticated checkout is available; no order creation was attempted.

## 6. Layout/lazy-loading/client-component verdict

Verdict: safe with warning.

Findings:

- `LazyCartDrawer` defers the cart drawer bundle until the drawer is opened or the cart has persisted items.
- This reduces initial storefront client work without changing the `CartDrawer` source in this group.
- Store layout still renders `Header`, `main`, `Footer`, and cart drawer location in the same shell order.
- No footer file was edited.
- Root layout metadata now relies on the shared canonical site URL helper.

Warning:

- There may be a small first-open delay for users with an empty cart because the drawer component is loaded on demand.
- This is a performance tradeoff, not a behavior blocker, and should be accepted only after manual UX review.

## 7. Browser/mobile smoke setup

Smoke setup used:

- Fresh `npm run build`
- Temporary local production server:
  - `node node_modules/next/dist/bin/next start -p 3101`
  - port `3101` was used because `3100` was not available at startup check time
- Local-only runtime overrides for smoke:
  - `AUTH_TRUST_HOST=true`
  - `NEXTAUTH_URL=http://127.0.0.1:3101`
- Installed Google Chrome controlled through Chrome DevTools Protocol
- Desktop viewport: `1366 x 900`
- Mobile viewport: `390 x 844`, mobile/touch emulation enabled
- No DB mutation, SQL, Docker, migration, seed, reset, payment, tracking, or order action was performed
- Temporary server and Chrome processes were stopped after the smoke run

Important DB safety note:

- `/search`, `/category/[slug]`, and `/products/[slug]` are dynamic DB-backed routes.
- Product detail and search browser requests were intentionally skipped because the current `DATABASE_URL` is remote-looking and local DB readiness is still no.
- `/` and `/category` were tested from the fresh production build's static/pre-rendered output.

## 8. Browser/mobile route results

| Route | Desktop result | Mobile result | Redirect/auth behavior | Console/runtime | Layout notes |
| --- | --- | --- | --- | --- | --- |
| `/` | Final status 200 | Final status 200 | Public | 0 console errors, 0 runtime exceptions | No horizontal overflow. Category count text visible. |
| `/auth/login` | Final status 200 | Final status 200 | Public | 0 console errors, 0 runtime exceptions | Login form fields visible; no horizontal overflow. |
| `/cart` | Final status 200 | Final status 200 | Public/guest cart | 0 console errors, 0 runtime exceptions | Empty cart state rendered; no horizontal overflow. |
| `/checkout` | Final status 200 after login redirect | Final status 200 after login redirect | Redirected to `/auth/login?callbackUrl=/checkout&reason=checkout` | 0 console errors, 0 runtime exceptions | Login form visible; checkout reason text visible on mobile. |
| `/account/profile` | Final status 200 after login redirect | Final status 200 after login redirect | Redirected to login with encoded callback | 0 console errors, 0 runtime exceptions | Login form visible; no horizontal overflow. |
| `/admin/dashboard` | Final status 200 after login redirect | Final status 200 after login redirect | Redirected to login with encoded callback | 0 console errors, 0 runtime exceptions | Login form visible; no horizontal overflow. |
| `/category` | Final status 200 | Final status 200 | Public | 0 console errors, 0 runtime exceptions | All categories page rendered; no horizontal overflow. |
| `/robots.txt` | Final status 200 | Final status 200 | Public metadata | Desktop CDP counted 1 console error, mobile counted 0; 0 runtime exceptions | Text route rendered. Server stderr was empty; treat the desktop console count as a warning to recheck, not an app exception. |
| `/sitemap.xml` | Final status 200 | Final status 200 | Public metadata | 0 console errors, 0 runtime exceptions | XML route rendered safely. |

Skipped routes:

| Route | Reason skipped |
| --- | --- |
| `/search` | Dynamic DB-backed route; skipped to avoid intentional access with remote-looking `DATABASE_URL`. |
| `/products/[slug]` | Dynamic DB-backed route; skipped to avoid intentional access with remote-looking `DATABASE_URL`. |
| `/category/[slug]` | Dynamic DB-backed route; `/category` index was tested instead. |

## 9. Homepage category count visual checkpoint verdict

Verdict: visually safe enough for pre-commit, with final human visual review still recommended.

Browser/CDP findings:

- Desktop and mobile homepage both returned 200.
- No horizontal overflow was detected.
- No console errors or runtime exceptions were detected.
- Visible category product-count text was detected on both desktop and mobile.
- Sample visible count text:
  - `Electronics 18 products`
  - `Fashion 0 products`
  - `Home & Appliances 1 product`
  - `Beauty & Health 0 products`
- Count text is rendered as normal DOM text.
- No automated evidence of category-card layout breakage was found.

Remaining caution:

- This was an automated smoke check, not a full visual design review with screenshots approved by a human.
- Final manual browser review is still recommended before committing Group 8.

## 10. Category/search/product route checkpoint verdict

Verdict: partial.

Checked:

- `/category` rendered successfully on desktop and mobile with no horizontal overflow or runtime exceptions.

Skipped for DB safety:

- `/search`
- `/category/[slug]`
- `/products/[slug]`

Reason:

- These routes execute live Prisma queries on request.
- Local DB readiness remains no.
- The current active database URL is remote-looking, so dynamic DB-backed browser testing remains unsafe.

## 11. Robots/sitemap checkpoint verdict

Verdict: safe with one warning.

Findings:

- `/robots.txt` returned 200 on desktop and mobile.
- `/robots.txt` text includes private route disallows such as admin, API, account, checkout, auth, cart, order, and track-order.
- `/sitemap.xml` returned 200 on desktop and mobile.
- `/sitemap.xml` rendered as XML in Chrome.
- No runtime exceptions were detected on either metadata route.

Warning:

- Desktop CDP counted one console error for `/robots.txt`; mobile did not reproduce it, server stderr was empty, and no runtime exception or failed request was detected. Recheck in a future browser pass if desired.

## 12. Group 7 pre-commit verdict

Verdict: safe to manually stage later as a standalone Group 7 commit after final human review.

Risk level: warning, not critical.

Why safe:

- Validation passed.
- Browser smoke passed for login, cart, protected redirects, homepage, category index, robots, and sitemap.
- Checkout unauthenticated redirect is now server-side and behaved correctly in browser smoke.
- Login callback handling uses existing safe callback sanitizer.
- No payment backend, tracking, seller, database, migration, API response, auth API, middleware, footer, newsletter, or payment-logo behavior was changed in Step 58.

Why warning:

- Group 7 affects visible auth/cart/checkout UI surfaces.
- Authenticated checkout and account/admin flows remain blocked until local DB/test users exist.
- Dynamic search/product detail browser checks remain blocked by DB safety.
- Lazy cart drawer should receive a small manual UX click test after staging or in a later local DB-safe/browser pass.

## 13. Group 8 visual staging verdict

Verdict: Group 8 is closer to safe, but still should get a final manual visual review before staging.

This Step 58 smoke check satisfied the main Step 57 automated checkpoint:

- homepage category counts appear under category names
- counts are real DOM text
- desktop/mobile homepage had no horizontal overflow
- no console/runtime errors were found on the homepage

Remaining Group 8 visual risk:

- The smoke check did not cover `/search`, `/category/[slug]`, or product detail due DB safety.
- A human should still glance at the homepage category cards on desktop and mobile before staging Group 8.

## 14. Suggested manual `git add` command for Group 7

No `git add` command was run in Step 58.

Suggested Group 7 manual staging command:

```powershell
git add -- `
  "src/app/(store)/account/layout.tsx" `
  "src/app/(store)/auth/layout.tsx" `
  "src/app/(store)/auth/login/page.tsx" `
  "src/app/(store)/cart/layout.tsx" `
  "src/app/(store)/checkout/page.tsx" `
  "src/app/(store)/layout.tsx" `
  "src/app/layout.tsx" `
  "src/frontend/components/auth/LoginForm.tsx" `
  "src/frontend/components/cart/LazyCartDrawer.tsx" `
  "src/frontend/components/checkout/CheckoutClient.tsx"
```

If audit reports are being committed as Group 1, do not include this Step 58 report in the Group 7 commit. If each implementation commit should include its matching review report, add this report intentionally in a separate reviewed command.

## 15. Files that must be excluded from Group 7

Exclude all non-Group-7 files, especially:

```text
.env
.env.local
.env.example
.env.local.example
README.md
package.json
docker-compose.local.yml
docker/local-postgres/**
scripts/**
audit-reports/**
next.config.js
src/middleware.ts
src/app/api/**
src/backend/admin/**
src/backend/auth/**
src/backend/catalog/**
src/backend/security/**
src/backend/seo/**
src/app/robots.ts
src/app/sitemap.ts
src/app/(store)/category/**
src/app/(store)/deals/page.tsx
src/app/(store)/new-arrivals/page.tsx
src/app/(store)/page.tsx
src/app/(store)/products/**
src/app/(store)/search/page.tsx
src/frontend/components/home/**
src/frontend/components/layout/Footer.tsx
src/frontend/components/layout/NewsletterForm.tsx
public/assets/categories/**
public/assets/payments/**
tests/**
prisma/schema.prisma
prisma/migrations/**
```

The suggested Group 7 staging command avoids these files.

## 16. Confirmation no files were staged/committed/reverted/deleted

Confirmed.

- `git diff --cached --name-only` reported no staged files during this review.
- No `git add`, `git commit`, `git reset`, `git checkout`, `git restore`, `git clean`, delete, rename, move, or destructive command was run.
- Temporary local production server and Chrome processes were stopped after the smoke check.

## 17. Confirmation no runtime behavior was changed

Confirmed for Step 58.

Only this audit report was created. No source, test, README, env, package, middleware, API, auth, security, logging, SEO, catalog, footer, payment, tracking, seller, product lifecycle, database, Prisma schema, migration, Docker, or visual source file was edited by Step 58.

## 18. Confirmation no prohibited files were touched

Confirmed.

Step 58 did not touch:

- database files
- Prisma schema
- `prisma/migrations/**`
- seed/reset/db-push scripts
- Docker/container files or commands
- `.env`, `.env.local`, `.env.example`, `.env.local.example`
- `.gitignore`
- README
- footer files
- newsletter visual layout
- payment-logo assets
- unrelated visual/UI styling files
- payment backend
- tracking API
- seller marketplace
- product lifecycle schema/status behavior
- dependencies

No migration, seed, reset, db push, SQL, Docker, deployment, payment call, tracking call, seller enablement, distributed rate limiting, CSP enforcement, or production-only integration was attempted.

## 19. Full validation results

Commands run:

```powershell
npm run db:url:safety
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no database connection attempted by the safety checker. `DATABASE_URL` remains remote-looking, `SHADOW_DATABASE_URL` is missing, local migration ready is no. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js emitted the known `next lint` deprecation notice. |
| `npm test` | Passed: 168 tests, 0 failures. |
| `npm run build` | Passed. Production build completed successfully and generated 76 static pages. |

## 20. Remaining risks

- Local DB readiness remains no, so authenticated buyer/admin DB-backed flows are still not fully testable.
- Search, category slug, and product detail browser checks were skipped because they are DB-backed and the active DB URL is remote-looking.
- Group 7 changes visible auth/cart/checkout surfaces, so one final human visual review is still recommended before staging.
- Lazy cart drawer first-open behavior should be manually click-tested later.
- Desktop CDP counted one console error on `/robots.txt`; no runtime exception, failed request, or server stderr accompanied it, but it should be rechecked if metadata-route console cleanliness matters.
- Online payment remains disabled by config unless the existing public payment flag is explicitly changed; this task did not test payment flows.

## 21. Recommended next step

Manually review the Group 7 UI surfaces once more, then stage Group 7 with the suggested `git add` command if approved.

After Group 7, either:

- manually stage Group 4 SEO and Group 8 catalog/product-count changes as separate commits using the Step 57 commands, or
- finish one more DB-safe static/browser review pass once local DB readiness is fixed so `/search`, `/category/[slug]`, and product detail can be tested safely.
