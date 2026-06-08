# Boilabin

<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=24&pause=1100&color=5B2C83&center=true&vCenter=true&width=980&lines=Bangladesh-first+full-stack+ecommerce+marketplace;Storefront%2C+admin+panel%2C+and+seller+foundation;Built+with+Next.js%2C+TypeScript%2C+Prisma%2C+and+PostgreSQL" alt="Boilabin animated intro" />
</div>

<div align="center">
  <strong>Boilabin</strong><br />
  Bangladesh-first ecommerce project with storefront, admin, and seller-foundation architecture.
</div>

<br />

![Next.js](https://img.shields.io/badge/Next.js-15-111111?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=0B1120)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![NextAuth](https://img.shields.io/badge/Auth-NextAuth-7C3AED?style=for-the-badge)
![Zustand](https://img.shields.io/badge/State-Zustand-4B2E2E?style=for-the-badge)
![Private Repo](https://img.shields.io/badge/Repo-Private-5B2C83?style=for-the-badge)

![Storefront](https://img.shields.io/badge/Storefront-Catalog%20Flow-111827?style=flat-square&logo=vercel&logoColor=white)
![Admin](https://img.shields.io/badge/Admin-Operations%20Panel-2B2D42?style=flat-square&logo=buffer&logoColor=white)
![Compare](https://img.shields.io/badge/Compare-UI%20Flow-3F3D56?style=flat-square&logo=semanticuireact&logoColor=white)
![Reviews](https://img.shields.io/badge/Reviews-Delivered%20Order%20Flow-4C1D95?style=flat-square&logo=trustpilot&logoColor=white)
![SEO](https://img.shields.io/badge/SEO-Dynamic%20Product%20Meta-1D4ED8?style=flat-square&logo=googlechrome&logoColor=white)
![Bangladesh First](https://img.shields.io/badge/Market-Bangladesh%20First-0F766E?style=flat-square&logo=shopify&logoColor=white)
![Single Store](https://img.shields.io/badge/Mode-Single%20Store%20Flow-7C2D12?style=flat-square&logo=homeassistant&logoColor=white)

![Boilabin Storefront Preview](./public/assets/readme/storefront-preview.png)

---

## Overview

Boilabin is a Bangladesh-focused ecommerce marketplace project. The codebase combines a storefront, an admin panel, and seller-foundation structures that can be reviewed before broader marketplace work is approved later.

### What it includes

- Customer storefront with category discovery, search, cart, checkout, wishlist, compare, reviews, and account pages
- Admin panel for products, categories, brands, coupons, banners, content, reports, inventory, reviews, and orders
- Seller foundation with onboarding, dashboard, product management, and order handling structure
- SEO-focused product metadata and Bangladesh-first pricing language
- Local asset organization for branding, payments, categories, and uploaded media

---

## Feature Snapshot

| Area | Highlights |
| --- | --- |
| Storefront | Hero banners, featured collections, new arrivals, category browsing, brand pages |
| Shopping | Cart drawer, wishlist, compare, 3-step checkout, guest-friendly flow, order confirmation |
| Product System | Variants, attributes, specs, sale pricing, stock tracking, review summaries |
| Reviews | Delivered-order review flow, moderation, rating sync |
| Admin | Product CRUD, brand/category management, coupons, banners, inventory, reports |
| Marketplace Foundation | Seller onboarding structure, seller admin review, seller order and product sections |
| SEO | Dynamic metadata, Bangladesh pricing phrases, product-level meta title and description generation |

---

## Tech Stack

### Core Stack

- `Next.js 15` with App Router
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Prisma 5`
- `PostgreSQL`
- `NextAuth v5`
- `Zustand`
- `Zod`
- `React Hook Form`
- `Sharp`

### Frontend Tooling

- `Lucide React`
- `Framer Motion`
- `TanStack Query`
- `SWR`
- `Embla Carousel`

---

## Project Structure

```text
boilabin-marketplace/
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- public/
|   |-- assets/
|   |   |-- branding/
|   |   |-- categories/
|   |   `-- payments/
|   `-- uploads/
|-- src/
|   |-- app/
|   |   |-- (store)/
|   |   |-- (admin)/
|   |   |-- (seller)/
|   |   `-- api/
|   |-- backend/
|   |-- frontend/
|   |   |-- components/
|   |   |-- stores/
|   |   `-- media/
|   `-- shared/
|-- scripts/
|-- next.config.js
`-- README.md
```

---

## Local Setup

Boilabin is currently a pre-launch local development project. Owning the domain is useful for SEO and launch planning, but hosting is not required to run the app locally.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the local-only example and replace placeholder values as needed:

```bash
cp .env.local.example .env.local
```

Keep `.env.local` pointed at dedicated local databases only. Do not paste production, staging, payment, OAuth, email, or database secrets into local docs or committed files.

Use localhost URLs for local app and auth testing. The future public canonical domain can remain `https://boilabin.com` for SEO metadata, even before hosting is connected.

### Google sign-in setup

To enable Google login locally, create a Google Cloud Console OAuth client of type **Web application** and add the local callback URI that matches your auth origin:

- `http://localhost:3000/api/auth/callback/google`
- or `http://localhost:<your-dev-port>/api/auth/callback/google` if you run the dev server on another local port

Set these environment keys in `.env.local`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

If either value is missing, blank, or still a local placeholder, the Google sign-in button stays disabled instead of redirecting to an invalid OAuth client.

Restart the dev server after changing auth env values.

### 3. Check database URL safety

Before any Prisma migration work, confirm the configured database targets are local and that no database connection is attempted by the check:

```bash
npm run db:url:safety
```

### 4. Start development

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Pre-launch URL Roles

| Role | Example | Purpose |
| --- | --- | --- |
| Local app URL | `http://localhost:3000` | Normal local development with `npm run dev`. |
| Local production test URL | `http://127.0.0.1:3100` | Production-mode smoke testing on a local port. |
| Future canonical domain | `https://boilabin.com` | SEO canonical identity for launch; the domain must point to hosting before public indexing. |
| Database URL | Local PostgreSQL URL | Prisma application database connection; separate from website domain and hosting. |
| Shadow database URL | Local PostgreSQL shadow URL | Separate database used by `prisma migrate dev` to generate migrations safely. |
| Auth URL / NextAuth URL | `http://localhost:3000` locally | Auth callback/origin for local testing; use the hosted public origin only after deployment. |

The SEO helpers intentionally avoid localhost canonical URLs and fall back to `https://boilabin.com`. This is safe for pre-launch code review, but the domain should not be submitted for indexing until it is connected to hosting.

---

## Local Database and Prisma Migration Safety

This project uses Prisma with PostgreSQL. Migration work must be treated as local-only unless a deployment plan explicitly approves otherwise.

### Rules

- Never run Prisma migration, reset, push, or seed commands against production or staging by accident.
- Use a dedicated local application database such as `boilabin_local`.
- Use a separate local shadow database such as `boilabin_shadow` for `prisma migrate dev`.
- `DATABASE_URL` is the local application database used by the running app.
- `SHADOW_DATABASE_URL` is a separate local database used by Prisma migration tooling.
- Keep `DATABASE_URL` and `SHADOW_DATABASE_URL` local before migration generation.
- Keep `DATABASE_URL` and `SHADOW_DATABASE_URL` pointed at different database names.
- Remember that a bought website domain does not make a database local; database safety is determined only by the configured database host.
- `https://boilabin.com` is the future public canonical website domain. It is unrelated to local PostgreSQL setup.
- Local app and auth testing should use `http://localhost:3000` or `http://127.0.0.1:<port>`.
- Do not use `prisma db push` for controlled migration history.
- Do not paste real secrets or full production/staging database URLs into docs, issues, chat, or committed files.

### Local PostgreSQL setup paths

Choose one local-only database setup path. Do not run migrations until the safety check reports both database URLs as local and separate.

#### Option A: PostgreSQL installed directly

Use this option only after `psql --version` works on your machine.

Create the two local databases manually:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_local;"
psql -U postgres -h localhost -c "CREATE DATABASE boilabin_shadow;"
```

Then create `.env.local`:

```bash
cp .env.local.example .env.local
```

If your local PostgreSQL password is not `postgres`, edit only the password in the two local database URLs.

#### Option B: Docker local PostgreSQL

Use this option only after `docker --version` works on your machine.

Start a local PostgreSQL container:

```bash
docker compose -f docker-compose.local.yml up -d
```

The local compose file creates two databases on first startup:

- `boilabin_local`
- `boilabin_shadow`

It does not run Prisma migrations, seed scripts, `db push`, app code, payment code, tracking code, or seller setup.

Then create `.env.local`:

```bash
cp .env.local.example .env.local
```

If port `5432` is already in use, stop and adjust the local compose port mapping intentionally. Do not point `.env.local` at a hosted database to work around a local port conflict.

#### Option C: Pause DB-backed work

If neither PostgreSQL nor Docker is available, keep DB-backed tests, Prisma migrations, seed/reset commands, product lifecycle schema work, payment setup, tracking setup, and seller marketplace work paused. Continue only with non-database tasks.

### Local DB readiness check

Run this before any DB-backed tests or Prisma migration work:

```bash
npm run db:url:safety
```

Success must look like this:

```text
Database URL safety check: no database connection attempted.
DATABASE_URL: local
SHADOW_DATABASE_URL: local
Shadow database separate: yes
Local migration ready: yes
```

For scripts that need a failing guard without doing database work, use:

```bash
npm run db:require-local
```

This command only classifies URLs. It does not connect to PostgreSQL.

For local Prisma commands that should use `.env.local` over `.env`, use the guarded local Prisma wrappers:

```bash
npm run db:prisma:local:validate
npm run db:prisma:local:generate
```

These wrappers load `.env` first, then `.env.local` as the local override, run the same URL-shape safety classification, and refuse to execute unless the app and shadow DB URLs are local and separate. This still does not prove PostgreSQL is installed or running.

### Recommended local-only migration generation flow

Use this flow only when intentionally creating a reviewed local migration:

```bash
cp .env.local.example .env.local
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:migrate:local -- --name add_product_lifecycle
```

Review the generated migration SQL before sharing or applying it anywhere beyond a disposable local database. If `npm run db:url:safety` reports anything other than local database and shadow database targets, stop and fix the environment first.

### Mutation-capable Prisma commands

These commands can change database state and should only be used with verified local URLs:

```bash
npm run db:migrate
npm run db:migrate:local
npm run db:push
npm run db:seed
npm run db:reset
npm run db:reset-signals
```

Prefer `npm run db:migrate:local` over `npm run db:migrate` for future local migration work because it refuses to continue unless both `DATABASE_URL` and `SHADOW_DATABASE_URL` classify as local.

### Dangerous script guardrails

The package keeps older database scripts for compatibility, but they are not safe to run casually:

- `npm run db:migrate`, `npm run db:push`, `npm run db:seed`, `npm run db:reset`, and `npm run db:reset-signals` can change database state.
- Never run mutation-capable database scripts while `npm run db:url:safety` reports `DATABASE_URL` as remote-looking, unknown, or missing.
- Do not run `npm audit fix`, dependency update commands, or package install commands as part of a recovery-roadmap step unless that step explicitly approves dependency changes.
- Do not print full database URLs, auth secrets, OAuth secrets, payment secrets, email/SMS secrets, or production/staging credentials in terminal logs, docs, issues, or chat.

### CSP report-only rollout

The app has a route-aware Content Security Policy helper for future hardening, but CSP is report-only and disabled by default:

```env
ENABLE_CSP_REPORT_ONLY="false"
ENABLE_CSP_REPORT_COLLECTION="false"
```

Set `ENABLE_CSP_REPORT_ONLY` to `true` only during intentional local or staging verification. This adds `Content-Security-Policy-Report-Only`; it must not add an enforced `Content-Security-Policy` header.

Set `ENABLE_CSP_REPORT_COLLECTION` to `true` only when report-only CSP is also enabled and you intentionally want reports sent to `/api/security/csp-report`. The report endpoint must stay database-free and must sanitize reports before logging: do not store or log full URLs, query strings, fragments, cookies, tokens, auth headers, PII, or secrets. Do not enable CSP report collection in production until logging and storage policy is approved.

Payment, tracking, analytics, or gateway domains should not be added to CSP until those integrations are implemented and reviewed.

### Security logging and observability

Security-relevant logs must use sanitized, bounded fields only. Do not log raw request headers, cookies, authorization headers, tokens, full URLs with query strings, raw request bodies, payment data, OAuth secrets, database URLs, phone numbers, delivery addresses, or unmasked emails.

Allowed security-event fields are event type, timestamp, route pathname, method, sanitized origin, sanitized known role, short error code, safe status code, and capped strings. Email addresses may appear only if masked. Server catch blocks should not pass raw `Error` objects or stack traces directly to `console.*`; use the security log sanitizer/helper with a short event code instead. Persistent log storage or external observability tools should be added only after a storage and retention policy is approved.

Client-facing error responses must stay generic for unknown server failures. Preserve safe validation messages when they are useful, but do not return raw Prisma/database errors, stack traces, filesystem paths, full URLs with query strings, tokens, secrets, payment data, or PII to users.

CSP report collection remains disabled by default and should stay database-free. If collection is intentionally enabled for local or staging checks, reports must be sanitized before logging and production logs must not be pasted publicly.

---

## Local Test Access

No demo login credentials are published in this README. For local testing, use local seed data only after local PostgreSQL app DB and shadow DB setup is ready, or create local test accounts manually.

Use role concepts such as admin, customer, and seller only for planning and local QA. Never commit or publish real usernames, emails, passwords, seeded account credentials, staging credentials, or production credentials. Keep staging and production secrets in the approved hosting provider secret manager.

### Local authenticated checkout QA fixture

Authenticated checkout QA can use a guarded local-only buyer account after local PostgreSQL is running and `npm run db:url:safety` reports local migration ready `yes`.

First audit the fixture guardrails:

```bash
npm run auth:fixture:readiness
```

To create or refresh the local buyer, set `BOILABIN_LOCAL_BUYER_PASSWORD` outside git with a strong local-only password, optionally keep the default local-only email `local-buyer@boilabin.localhost`, then run:

```bash
npm run auth:buyer:local
```

The helper refuses remote-looking database URLs, requires a separate local shadow database, creates only a `CUSTOMER` fixture, ensures a cart and wishlist exist, and does not print the password, hash, or full email address. Use this account only for no-submit local checkout shell QA unless a later step explicitly approves order-creation testing. Do not reuse production, staging, payment, OAuth, or hosting credentials.

### Useful routes

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Seller: `http://localhost:3000/seller`

---

## NPM Scripts

```bash
npm run dev               # Start Next.js in development
npm run build             # Production build
npm run start             # Run production server
npm run lint              # Lint project
npm run typecheck         # Type-check project
npm test                  # Run tests
npm run auth:fixture:readiness # Audit local authenticated checkout fixture guardrails
npm run auth:buyer:local  # Create/update local-only CUSTOMER fixture after DB safety passes
npm run db:url:safety     # Classify DB URLs without connecting or printing secrets
npm run db:require-local   # Fail unless DB URLs are local and separate; no DB connection
npm run db:validate       # Plain Prisma validate; does not load .env.local guardrail
npm run db:generate       # Plain Prisma generate; does not load .env.local guardrail
npm run db:prisma:local:validate # Guarded local Prisma validate with .env.local override
npm run db:prisma:local:generate # Guarded local Prisma generate with .env.local override
npm run db:migrate:local  # Local-only Prisma migrate dev with URL safety check
npm run db:migrate        # Mutates DB; only use with verified local URLs
npm run db:push           # Mutates DB without migration history; avoid for controlled migrations
npm run db:seed           # Seed demo data; mutates database, local only
npm run db:reset-signals  # Mutates commerce signal counters/reviews; local only
npm run db:studio         # Open Prisma Studio
npm run db:reset          # Reset and reseed database; destructive, local only
```

---

## Payments

### Currently working

- `Cash on Delivery`

### Visible as disabled choices until gateway integration is completed

- `bKash`
- `Nagad`
- `Card / Online Banking`
- `Stripe`

This keeps the checkout honest: unsupported gateways should not pretend to complete payment until a real gateway handoff exists.

---

## Admin Coverage

The admin panel is designed to manage the store as a real working operations dashboard.

### Included sections

- Products
- Categories
- Brands
- Orders
- Reviews
- Coupons
- Inventory
- Banners
- Content blocks
- Reports
- Settings
- Seller review and control flows

---

## Marketplace Direction

Boilabin is built so it can stay first-party now and still grow into a broader marketplace later.

### Current direction

- Single-store friendly storefront
- Seller model and seller dashboard foundation already present
- Admin can review seller-side flows and marketplace-style entities

### Future-ready path

- Enable third-party seller onboarding fully
- Add live seller payouts and payment settlements
- Expand seller compliance and approval workflows

---

## SEO Notes

The project already supports product-focused metadata patterns such as:

- `iPad Pro price in BD`
- `iPad Pro price in Bangladesh`
- Brand-aware meta descriptions with BDT pricing
- Product metadata generation from product fields

This makes product pages more suitable for search-driven ecommerce traffic in Bangladesh.

---

## Asset Organization

All long-term static assets are grouped for easier maintenance.

```text
public/assets/
|-- branding/
|-- categories/
`-- payments/
```

This keeps permanent visuals separate from uploaded runtime media under `public/uploads/`.

---

## Project Positioning

- Bangladesh-focused ecommerce flow instead of a generic template-only build
- Admin structure beyond a storefront demo
- Seller foundation without forcing marketplace complexity too early
- Structured asset organization and SEO-aware content direction
- Designed to balance storefront presentation with maintainable implementation

---

## Development Notes

### Product comparison

The compare page now supports:

- side-by-side pricing
- stock status
- ratings
- category info
- product description
- direct add-to-cart actions

## Roadmap

- Live Bangladesh payment gateway integration
- Production-grade caching and rate limiting
- More advanced seller operations
- Better reporting and export flows
- Stronger visual product media and showcase polish

---

## License

This project is currently private and maintained as a custom product build.
