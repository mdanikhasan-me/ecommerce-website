# Step 97: Human Browser Visual QA

## Scope

Dedicated browser visual QA and console/network inspection after the local storefront/admin recovery steps.

This step was report-only for application code. It did not fix visuals, edit source files, mutate database data, run migrations, reseed, reset, deploy, or touch paused footer/newsletter/payment-logo/category-image/PromoSection work.

## Environment

- Project: Boilabin pre-launch local-development storefront.
- Local database service: available from previous setup and used for local rendering.
- Browser tooling:
  - In-app browser automation was not callable in this session.
  - Google Chrome was available and used through a local headless Chrome DevTools Protocol script.
  - Edge was detected but not needed.
  - Playwright/Puppeteer packages were not installed and were not added.
- Screenshot folder: `audit-reports/97-visual-qa-screenshots/`

## Commands Run

- `git status --short`
- `git diff --cached --name-only`
- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run dev`
- Headless Chrome/CDP public route screenshot and inspection helper

No Docker, SQL, Prisma migration, seed, reset, `db push`, deployment, dependency install, or destructive command was run.

## Validation Results

- `npm run db:url:safety`: passed; local app and shadow DB URL shapes classified as safe and separate.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed; 189 tests.
- `npm run build`: passed.

## Browser Coverage

The CDP pass checked 55 route/viewport combinations across these public routes:

- `/`
- `/category`
- `/category/electronics`
- `/products/xiaomi-redmi-note-13-pro-256gb`
- `/products/samsung-galaxy-tab-s9-128gb`
- `/deals`
- `/new-arrivals`
- `/cart`
- `/checkout`
- `/auth/login`
- `/contact`

Viewport coverage:

- Mobile: 390 x 844
- Mobile wide: 430 x 932
- Tablet: 768 x 1024
- Laptop: 1366 x 768
- Desktop: 1440 x 900

CDP summary:

- Route/viewport checks: 55
- Horizontal overflow count: 0
- Broken DOM image route/viewport count: 0
- Console issue route/viewport count: 40
- Network failure route/viewport count: 27
- Screenshots captured: 11

Note: CDP DOM text-marker extraction reported empty text in some checks despite screenshots clearly showing rendered pages. The screenshot evidence is treated as the visual source of truth for this pass.

## Screenshots Captured

Safe public screenshots only:

- `audit-reports/97-visual-qa-screenshots/home__mobile-390x844.png`
- `audit-reports/97-visual-qa-screenshots/home__mobile-wide-430x932.png`
- `audit-reports/97-visual-qa-screenshots/home__tablet-768x1024.png`
- `audit-reports/97-visual-qa-screenshots/home__laptop-1366x768.png`
- `audit-reports/97-visual-qa-screenshots/home__desktop-1440x900.png`
- `audit-reports/97-visual-qa-screenshots/category-electronics__mobile-390x844.png`
- `audit-reports/97-visual-qa-screenshots/category-electronics__desktop-1440x900.png`
- `audit-reports/97-visual-qa-screenshots/product-xiaomi__mobile-390x844.png`
- `audit-reports/97-visual-qa-screenshots/product-xiaomi__desktop-1440x900.png`
- `audit-reports/97-visual-qa-screenshots/cart__mobile-390x844.png`
- `audit-reports/97-visual-qa-screenshots/cart__desktop-1440x900.png`

Admin screenshots were intentionally not captured or committed because admin pages may contain private user/order/business data. Admin technical auth smoke had already passed in Step 95C and Step 96, but true admin visual QA still needs a private manual browser pass.

## Storefront Visual QA Results

### Homepage

- Desktop and mobile homepage rendered with header, search, hero, category cards, product sections, and footer content.
- Category product counts are visible under category names on the category cards.
- Mobile category cards keep the arrow button within the card overlay area.
- No horizontal overflow was detected by CDP across tested homepage viewports.
- Issue found: the desktop homepage screenshot shows visible collision/wrapping around the `Shop by category` heading near the fold. This should be handled in a dedicated visual fix step, not in this QA-only step.
- Issue found: local development screenshots show a bottom-left dev issue indicator. This appears to be a local Next/dev overlay indicator, but it should be checked during a production-mode visual pass before launch.

### Category And Catalog Pages

- `/category/electronics` rendered product grid, filters, category title, and product count.
- Desktop layout shows filter sidebar plus product cards.
- No horizontal overflow was detected by CDP.
- Product image/card layout is mostly stable, but at least one product card area showed a blank/placeholder image region caused by external image optimizer 404s. This is a real launch-readiness risk for image-heavy catalog pages.

### Product Detail

- Product detail page rendered on mobile and desktop.
- Mobile screenshot shows product image, breadcrumb, product title, rating row, and price area.
- No horizontal overflow was detected by CDP.
- Some page areas are dense on mobile and should be reviewed manually for above-the-fold readability, but no destructive or blocking visual failure was confirmed.

### Cart

- Empty cart page rendered on mobile and desktop.
- Desktop cart page includes footer content and the empty-cart CTA.
- No horizontal overflow or broken image count was detected.

### Checkout And Login

- `/checkout` and `/auth/login` were included in CDP checks.
- No network failures were recorded for these routes.
- Each had console issue counts in CDP, so a manual browser/devtools review should verify whether these are harmless development warnings or actionable runtime issues.

### Admin

- No admin screenshots were captured in this step to avoid storing private dashboard/order/user data in the repository.
- Authenticated admin HTTP smoke was completed in Step 95C and remained the latest technical admin verification source.
- A future private manual QA pass should inspect admin dashboard, product/category management, and responsive admin layouts without committing screenshots that expose operational data.

## Console And Network Findings

Network failures were concentrated in image-heavy storefront pages. Unique failures were repeated Next image optimizer 404s for external Unsplash-backed URLs:

- `/_next/image -> https://images.unsplash.com/photo-1609428614116-c91f3c1eac77`
- `/_next/image -> https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4`
- `/_next/image -> https://images.unsplash.com/photo-1673841464843-af1c5c8b8c54`

Route-level CDP issue summary:

- `/`: 14 network failures, 229 console issue count
- `/category/electronics`: 7 network failures, 97 console issue count
- `/products/xiaomi-redmi-note-13-pro-256gb`: 2 network failures, 17 console issue count
- `/products/samsung-galaxy-tab-s9-128gb`: 7 network failures, 32 console issue count
- `/deals`: 16 network failures, 104 console issue count
- `/new-arrivals`: 10 network failures, 55 console issue count
- `/cart`: 0 network failures, 0 console issue count
- `/category`: 0 network failures, 0 console issue count
- `/contact`: 0 network failures, 0 console issue count
- `/checkout`: 0 network failures, 5 console issue count
- `/auth/login`: 0 network failures, 5 console issue count

These console counts should be rechecked in an interactive browser because the CDP helper counted browser/runtime issue events but did not persist every message payload. The repeated 404 image failures are confirmed enough to prioritize.

## Priority Issue List

1. P1: External image optimizer 404s on product/category/home/deals/new-arrivals pages can create blank image regions and reduce buyer trust.
2. P1: Homepage desktop `Shop by category` heading visually collides/wraps poorly near the fold.
3. P2: CDP reported console issue counts on multiple routes; interactive browser devtools review should classify exact messages.
4. P2: Product detail mobile above-the-fold area is dense and should be manually reviewed before launch.
5. P2: Admin visual QA remains incomplete because screenshots were intentionally skipped to avoid committing private dashboard data.
6. P3: Production-mode visual pass should confirm the local dev issue indicator is absent outside development.

## Files Changed

- Added `audit-reports/97_HUMAN_BROWSER_VISUAL_QA.md`
- Added safe public screenshot artifacts under `audit-reports/97-visual-qa-screenshots/`

No source, UI component, visual asset, footer, newsletter, payment-logo, category-image, `PromoSection.tsx`, Prisma schema, migration, env, payment, tracking, seller marketplace, or product lifecycle file was changed.

## Remaining Risks

- True manual interactive browser QA is still needed for hover menus, keyboard flows, admin visual screens, authenticated buyer flows, and exact devtools console messages.
- External product/category images still need a dedicated asset reliability decision.
- Paused visual/assets files remain outside this step.
- Screenshots are local evidence only and should not be treated as final production browser certification.

## Recommended Next Step

Run a dedicated Step 98 visual issue triage plan before editing anything. It should classify the confirmed visual/network issues, decide whether to fix external image URLs/assets first or the homepage category heading first, and keep paused footer/newsletter/payment-logo/category-image work separated unless explicitly approved.
