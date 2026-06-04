# Step 169 - Project System Understanding For Owner

## Scope

This loop created an owner-friendly project overview and mapped the Boilabin system without changing runtime behavior.

Created:

- `docs/PROJECT_OVERVIEW_FOR_OWNER.md`

## What The Website Is

Boilabin is a pre-launch Bangladesh-focused ecommerce project with a public storefront and an admin panel.

The site is not only a homepage. It includes products, categories, cart, checkout, account pages, admin operations, SEO helpers, image handling, and database-backed content.

## Tech Stack Observed

- Next.js and React for web pages.
- TypeScript for typed application code.
- Prisma and PostgreSQL for database-backed data.
- Auth.js for session/auth behavior.
- Tailwind CSS for styling.
- Sharp for server-side image upload processing.

## Frontend Meaning

Frontend means the browser-facing screens and components: homepage, product cards, category pages, product detail page, cart, checkout, login, footer, admin forms, and tables.

## Backend Meaning

Backend means server logic: auth, validation, database reads/writes, API routes, SEO generation, image processing, order creation, and admin operations.

## Admin Panel

The admin panel handles product, category, banner, homepage content, coupon, inventory, order, return, review, user, notification, setting, and report workflows.

## Buyer Storefront

The buyer storefront handles browsing, search, category filters, product detail, reviews, cart, checkout, account orders, returns, and support pages.

## Database And Prisma

Prisma models the business data and generates typed database access. PostgreSQL is the storage layer. Prisma schema and migrations must be treated as high-risk because they affect the entire system.

## Product/Category/Order/User/Seller Connections

- Products connect to categories, sellers, images, variants, reviews, attributes, and specifications.
- Categories support parent/child trees.
- Orders connect users to copied order item data.
- Sellers exist in the schema, but full seller marketplace implementation remains paused.

## Image Flow

Images flow from committed public assets, uploaded local files, admin-upload data URLs, pasted remote URLs, and seed/demo references. Product uploads use Sharp and save into `public/uploads/products`. Banner/category image forms can still carry large image strings or remote URLs.

## Already Improved

The prior workflow improved local DB safety, API guardrails, auth boundaries, SEO canonical/noindex behavior, security logging, CSP report-only planning, admin export warnings, image source-of-truth repairs, and mobile-readiness planning.

## Remaining Work

Remaining work includes hosting/provider decisions, production database/backups, image/media scaling, content quality, Search Everywhere improvements, UI/UX redesign, and future payment/tracking/seller/product lifecycle implementation.

## Do Not Touch Carelessly

Auth, checkout, payment, Prisma schema, product visibility, noindex/canonical rules, footer/newsletter/payment-logo/PromoSection visuals, category media decisions, and removed Flash Deals routes need dedicated approved steps.

## Real Code Vs Audit Files

Audit Markdown files document findings. Source files, tests, config files, assets, package files, and Prisma files can change behavior.

## Recommended Direction

Start with media upload performance and content-quality guardrails, then improve structured data/content foundations, then run a visual-only UI/UX redesign batch.
