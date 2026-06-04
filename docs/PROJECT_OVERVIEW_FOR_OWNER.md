# Boilabin Project Overview For Owner

## Plain Summary

Boilabin is a pre-launch Bangladesh-focused ecommerce website. It has a public shopping storefront, an admin panel, product/category/order systems, content pages, local development guardrails, and technical SEO foundations.

The domain `https://boilabin.com` is the future public canonical domain. Local development still uses localhost or 127.0.0.1.

## Likely Tech Stack

- Next.js: the web app framework.
- React: the frontend user interface library.
- TypeScript: typed JavaScript for safer code.
- Prisma: the database access layer.
- PostgreSQL: the database engine.
- Auth.js / NextAuth: sign-in and session handling.
- Tailwind CSS: styling utilities.
- Sharp: server-side image processing for uploads.

## Frontend

The frontend is what buyers and admins see in the browser. Examples:

- homepage sections;
- category pages;
- product cards;
- product detail pages;
- cart and checkout screens;
- login/register screens;
- admin dashboard forms and tables.

Frontend changes affect how the site looks and feels. Visual work should not change backend business rules.

## Backend

The backend is the server-side logic that loads data, validates requests, protects private routes, writes orders, processes admin forms, and generates SEO data.

Backend changes can affect security, payments, order data, auth, and future mobile app compatibility. They must be handled more carefully than visual-only styling changes.

## Admin Panel

The admin panel supports store operations:

- product management;
- category management;
- banner/homepage content;
- orders and returns;
- users;
- coupons;
- reviews;
- inventory;
- reports.

Admin changes can affect sensitive business data and customer data.

## Buyer Storefront

The buyer storefront supports:

- browsing categories and products;
- searching/filtering/sorting;
- viewing product detail pages;
- cart and checkout;
- authenticated account pages;
- order and return flows.

The storefront should be clear, honest, mobile-friendly, and easy for search engines and AI answer systems to understand.

## Database And Prisma

The database stores durable business data such as products, categories, images, users, sellers, orders, payments, returns, coupons, reviews, banners, and content.

Prisma is the typed bridge between the app and the database. Prisma schema and migrations must not be changed casually because they can affect all app behavior.

## How Core Records Connect

- Products belong to categories and sellers.
- Products can have images, variants, specifications, attributes, reviews, and inventory values.
- Categories can have parent/child relationships.
- Users can be buyers, admins, or future sellers depending on role.
- Orders belong to users and include order items copied from product data at purchase time.
- Sellers exist in the model, but full seller marketplace behavior remains paused.
- Banners and homepage sections control marketing/content surfaces.

## Image Flow

Current image paths can come from:

- committed public assets under `public/assets`;
- local uploaded files under `public/uploads`;
- pasted remote image URLs that match the Next.js allowlist;
- seed/demo data references;
- admin product/category/banner forms.

Admin product uploads use data URLs, server validation, and Sharp processing before saving into local uploads. Category and banner forms can still accept large data URL strings or pasted URLs and should be hardened in a later media implementation batch.

## Already Improved

Previous recovery work already improved:

- local DB safety guardrails;
- no-DB API contract tests;
- request guard and rate-limit behavior;
- client/server error hygiene;
- CSP report-only planning and sanitized report collection;
- security-event logging hygiene;
- SEO canonical/noindex/robots/sitemap policy;
- authenticated route boundaries;
- product visibility rules;
- admin export CSV warnings and fail-open sanitized audit logging;
- storefront image source-of-truth repair;
- future mobile app readiness planning.

## Still Unfinished

- Production hosting is not selected or configured.
- Production database/backups are not selected.
- Payment, tracking, seller marketplace, and product lifecycle migration remain paused.
- Admin export durable audit storage is not implemented.
- Image upload storage/compression/variant policy needs a dedicated implementation step.
- Search Everywhere content and structured data can be improved.
- UI/UX redesign should be planned as visual-only unless explicitly scoped otherwise.

## Do Not Touch Carelessly

- Prisma schema and migrations.
- Auth/session behavior.
- Checkout/payment/order logic.
- Admin permissions.
- Product visibility/noindex/canonical rules.
- Footer/newsletter/payment-logo/PromoSection visual work.
- Flash Deals removal.
- Category media decisions, especially Baby & Kids and Toys & Collectibles.

## Audit Files Vs Real Code Changes

Audit `.md` files describe findings and plans. They do not change how the website runs.

Real code changes are files under `src`, `prisma`, `scripts`, `tests`, `public`, package files, and config files. Those can change behavior, validation, assets, or build output.

## Recommended Engineering Direction

The safest next direction is:

1. improve image upload/media performance guardrails;
2. add content-quality guardrails and remove fake marketing copy in a scoped batch;
3. harden Search Everywhere structured data and product/category content foundations;
4. then do a visual public storefront redesign without changing backend rules.
