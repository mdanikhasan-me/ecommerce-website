# Step 308: Navbar Banner Footer Polish

## Scope
Step 308 polished the global mobile navbar, verified the homepage hero banner source/behavior in local production, and compacted the footer support/payment area. The work stayed inside the storefront header, hero banner, footer, and focused guardrail tests.

## Starting State
The worktree already had user-owned unstaged category icon SVG edits:
- `public/assets/icons/ui/categories/beauty-health.svg`
- `public/assets/icons/ui/categories/books-stationery.svg`
- `public/assets/icons/ui/categories/electronics.svg`
- `public/assets/icons/ui/categories/fashion.svg`
- `public/assets/icons/ui/categories/gaming.svg`
- `public/assets/icons/ui/categories/home-appliances.svg`
- `public/assets/icons/ui/categories/sports-fitness.svg`
- `public/assets/icons/ui/categories/toys-collectibles.svg`

Those files were not edited, staged, or reverted by this step.

## Files Changed
- `src/frontend/components/layout/Header.tsx`
- `src/frontend/components/home/HeroBanner.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `tests/navbar-banner-footer-polish.test.ts`
- `tests/content-quality-policy.test.ts`
- `audit-reports/308_NAVBAR_BANNER_FOOTER_POLISH.md`
- `audit-reports/308_NEXT_PROMPT_DRAFT.md`
- `audit-reports/308-navbar-banner-footer-polish/browser-polish-evidence.json`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/*.png`

## Navbar Result
- Kept the Step 307 black/white navbar direction and removed the mobile layout pressure that could make the wordmark collide with right-side controls.
- Switched header branding to the existing bundled `BoilabinLogo` component so the local branding asset policy stays enforced.
- Added an explicit mobile search icon trigger between brand and cart/account controls.
- Preserved mobile menu, search, cart drawer, session/account, account redirect, and desktop nav behavior.
- Measured mobile header at 360, 375, 390, and 430 widths; all passed centered-brand and no-overlap checks.

## Icon And Asset Verification
- Header controls continue to use `LocalIcon`.
- The brand now uses local bundled branding assets through `BoilabinLogo`.
- No remote icon URLs, icon libraries, or category SVG edits were introduced.

## Banner Source Findings
- `src/app/(store)/page.tsx` remains the homepage banner source of truth through `db.banner.findMany({ where: { isActive: true, position: 'hero' }, orderBy: { sortOrder: 'asc' } })`.
- The local/dev env used by this workspace's served local production page has one active hero banner: `Galaxy S24 Ultra` at `/assets/banners/home-hero-galaxy-s24-ultra.jpg`.
- Because the served page has one active hero banner, no carousel arrows/dots are expected in the current local production screenshot state.
- The hero component was still improved for future multi-banner states: desktop arrows are visible when `banners.length > 1`, autoplay remains gated to multi-banner state, and horizontal touch swipe now advances/rewinds banners.
- A separate read-only production-style env check showed six active hero rows with duplicate/remote entries. No database mutation, seed/reset, DB push, SQL, or banner data cleanup was performed in this step.

## Footer Result
- Removed `FAQ` and `About Boilabin` from footer support links.
- Removed the payment helper sentence `Availability is shown at checkout.`
- Kept factual support links, newsletter, contact/social links, and display-only payment logos.
- Kept payment logos local/bundled through `PAYMENT_ASSETS`.

## Browser Evidence
The in-app Browser tool was not exposed in this session, so screenshot QA used local Microsoft Edge through CDP against `http://127.0.0.1:3108`.

Evidence JSON:
- `audit-reports/308-navbar-banner-footer-polish/browser-polish-evidence.json`

Screenshots:
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-desktop-1920x1080.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-desktop-1536x864.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-desktop-1366x768.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-mobile-430x932.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-mobile-390x844.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/home-mobile-375x812.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/help-mobile-navbar-390x844.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/footer-desktop-1366x768.png`
- `audit-reports/308-navbar-banner-footer-polish/screenshots/footer-mobile-390x844.png`

Browser evidence summary:
- `screenshotCount`: 9
- `activeHeroBannerCount`: 1
- `sourceAssetHeroBannerCount`: 1
- `allHeaderMeasurementsPass`: true
- `allFooterRemovalsPass`: true
- `allPaymentLogosVisible`: true
- `allBrowserEventsClean`: true
- `failureCount`: 0

## Validation Results
- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next lint deprecation notice only.
- `npm run build`: passed. A stale `.next/server/app/index.html` artifact was found after an incremental build; only the resolved `.next` build output inside the workspace was removed, then a clean rebuild passed and served current chunks.
- `npx tsx --test tests/local-asset-dependency-policy.test.ts tests/navbar-banner-footer-polish.test.ts tests/help-navbar-redesign.test.ts`: passed.
- `npx tsx --test tests/content-quality-policy.test.ts tests/navbar-banner-footer-polish.test.ts`: passed.
- `npm test`: passed, 525/525 tests across 79 suites.
- Edge/CDP screenshot QA: passed with 0 evidence failures.

## Guardrails Observed
- No category SVGs were edited, staged, or reverted.
- No Help page redesign was performed.
- No product image lifecycle, local catalog product image replacement, admin product image cleanup, seed/reset/db push/destructive SQL, Prisma schema/migration, checkout/payment provider, tracking, seller, package/env, or fake route work was performed.
- No `/deals`, flash sale, collection, or payment route was added.
- No remote icon URLs or new icon libraries were added.

## Residual Risk
- The local/dev served page and production-style env banner queries currently disagree. Local/dev serves one local hero banner; production-style env sees six active rows with duplicates and remote URLs. This step documented the mismatch but did not mutate banner data.
- Full authenticated account-menu browser QA was not performed because no private user session was supplied.
- Screenshot QA was local production, not hosted staging.

## Recommended Next Step
Run a bounded desktop category dropdown polish that verifies hover/focus behavior, keyboard escape behavior, and visual fit on 1366/1536/1920 widths without editing category SVGs, adding fake routes, touching banner data, or changing payment/tracking/seller/database work.
