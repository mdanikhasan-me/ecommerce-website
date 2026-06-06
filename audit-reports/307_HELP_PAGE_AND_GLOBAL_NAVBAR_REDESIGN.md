# Step 307: Help Page And Global Navbar Redesign

## 1. Scope
Step 307 redesigned the public storefront global navbar and `/help` page to match the supplied black/white Boilabin support references while preserving existing routes, auth/session behavior, cart drawer behavior, local icons, accessibility labels, and responsive behavior.

## 2. Starting state
The worktree already had user-owned unstaged category icon SVG edits:
- `public/assets/icons/ui/categories/beauty-health.svg`
- `public/assets/icons/ui/categories/books-stationery.svg`
- `public/assets/icons/ui/categories/electronics.svg`
- `public/assets/icons/ui/categories/fashion.svg`
- `public/assets/icons/ui/categories/gaming.svg`
- `public/assets/icons/ui/categories/home-appliances.svg`
- `public/assets/icons/ui/categories/sports-fitness.svg`
- `public/assets/icons/ui/categories/toys-collectibles.svg`

Those files were not edited by this step and must remain unstaged.

## 3. Files changed by Step 307
- `src/frontend/components/layout/Header.tsx`
- `src/app/(store)/help/page.tsx`
- `src/shared/storefront-icons.ts`
- `public/assets/icons/ui/shield.svg`
- `tests/help-navbar-redesign.test.ts`
- `audit-reports/307_HELP_PAGE_AND_GLOBAL_NAVBAR_REDESIGN.md`
- `audit-reports/307_NEXT_PROMPT_DRAFT.md`
- `audit-reports/307-help-page-navbar-redesign/browser-screenshot-summary.json`
- `audit-reports/307-help-page-navbar-redesign/screenshots/*.png`

## 4. Navbar result
- Removed the global `Free delivery on orders over Tk 2,000` strip.
- Replaced the desktop header with a single white navigation bar: uppercase Boilabin wordmark, centered `New Arrivals`, `Categories`, `About Us`, `Help`, and right-side search/profile/cart icon controls.
- Kept category navigation route-safe and expanded the dropdown to the current eight departments.
- Kept cart drawer behavior through `useCartStore`.
- Kept auth/session behavior through `useSession`, account dropdown, admin link for admin roles, and `signOut`.
- Kept mobile header order as menu, centered wordmark, cart, profile/sign-in.
- Kept mobile menu access to account, compare, categories, shopping, support, and search.

## 5. Help page result
- Replaced the old help page with a black hero reading `We’re here to help`.
- Added the support subtitle, mobile help-search field, `Quick actions`, `Reach us`, and privacy row.
- Reused local icons for support actions and added one new local `shield` icon for the privacy row.
- Used configured contact values from `src/shared/contact.ts`; no fake support phone/email was introduced.
- Removed the retired copy:
  - `Help that feels built for your order`
  - `Delivery, returns, payments, and account help in one calm place`
  - `Support Desk`
  - `Choose the next step`
  - `Need a direct reply`
  - `Send the order number and issue from the contact page`

## 6. Route decisions
- No `/collections` or `/deals` navbar links were added because those public pages are not active routes.
- `Payments` links to `/faq` because there is no active `/payments` route and payment integration remains intentionally disabled.
- `Bangladesh addresses` links to `/contact`.
- `Account help` links to `/account`, preserving existing auth redirect behavior when needed.

## 7. Browser evidence
The in-app Browser plugin was attempted first, but no browser backends were exposed in this session. Production browser evidence was captured with local Microsoft Edge via CDP against `http://127.0.0.1:3108`.

Automated screenshot summary:
- `audit-reports/307-help-page-navbar-redesign/browser-screenshot-summary.json`
- Result: `ok: true`
- Checked no horizontal overflow, no promo strip, no retired help text, no unnamed buttons, no console errors, no server errors.

Screenshots:
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-desktop-1920x1080.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-desktop-1536x864.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-desktop-1366x768.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-tablet-1024x768.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-mobile-430x932.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-mobile-390x844.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/help-mobile-375x812.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/navbar-categories-dropdown-1366x768.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/navbar-mobile-menu-open-390x844.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/new-arrivals-desktop-1366x768.png`
- `audit-reports/307-help-page-navbar-redesign/screenshots/new-arrivals-mobile-390x844.png`

## 8. Validation
- `npm test -- tests/help-navbar-redesign.test.ts`: passed; due package script expansion, full suite ran with 521/521 passing before the final wordmark/category tune.
- `npx tsx --test tests/help-navbar-redesign.test.ts`: passed, 4/4 after final header updates.
- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: initially hit Windows EPERM on Prisma DLL rename because an existing project-local Next dev server held the file; after stopping only those project-local dev-server processes, rerun passed.
- `npm run typecheck`: passed after final updates.
- `npm run lint`: passed with Next lint deprecation notice only.
- `npm run build`: passed after final updates.
- `git diff --check -- "src/frontend/components/layout/Header.tsx" "src/app/(store)/help/page.tsx" "src/shared/storefront-icons.ts" "public/assets/icons/ui/shield.svg" "tests/help-navbar-redesign.test.ts"`: passed with LF-to-CRLF warnings only.

## 9. Guardrails observed
- No category SVG files were edited or staged by Step 307.
- No footer, payment logos, checkout, payment provider, tracking, seller, Prisma schema, migration, seed, reset, SQL, CSP, rate-limit, product lifecycle, or admin media backend work was performed.
- No packages or environment files were changed.
- No `/deals`, flash sale, or collections route was restored.

## 10. Residual risk
- `/faq` does not yet expose a dedicated payments anchor, so the Step 307 `Payments` quick action intentionally routes to the existing FAQ page instead of a fake payment route.
- Full authenticated account-dropdown browser QA was not performed because no private user session was supplied.
- The screenshots were captured in local production mode, not a hosted staging environment.

## 11. Recommended next step
Run a bounded FAQ/support-anchor polish so Help quick actions can deep-link to existing FAQ sections without adding any payment provider, tracking, seller, schema, or route-invention work.
