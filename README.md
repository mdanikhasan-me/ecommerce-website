<a id="boilabin"></a>

<div align="center">
  <a href="https://github.com/mdanikhasan-dev/ecommerce-website">
    <img src="./public/assets/brand/identity/v20260722/svg/boilabin-logo-dark-transparent.svg" alt="Boilabin" width="240" />
  </a>

  <p><strong>Online shopping in Bangladesh, shaped around discovery.</strong></p>

  <p>
    A full-stack marketplace experience for finding useful things, making confident decisions, and keeping every order moving.
  </p>

  <p>
    <a href="#-what-is-boilabin">Discover Boilabin</a>
    &nbsp;·&nbsp;
    <a href="#-explore-the-code">Explore the code</a>
    &nbsp;·&nbsp;
    <a href="#-run-it-locally">Run it locally</a>
  </p>

  <p>
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=18&duration=3200&pause=1100&color=2563EB&center=true&vCenter=true&width=560&lines=Browse+with+curiosity.;Choose+with+confidence.;Built+for+everyday+life+in+Bangladesh." alt="Browse with curiosity. Choose with confidence. Built for everyday life in Bangladesh." />
  </p>

  <p>
    <a href="https://github.com/mdanikhasan-dev/ecommerce-website/actions/workflows/quality.yml"><img src="https://github.com/mdanikhasan-dev/ecommerce-website/actions/workflows/quality.yml/badge.svg" alt="Quality and security workflow" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-111827?logo=nextdotjs&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/PostgreSQL-ready-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" alt="Prisma ORM" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<br />

<div align="center">
  <img src="./.github/assets/boilabin-preview.webp" alt="Boilabin storefront preview across desktop and mobile screens" width="100%" />
</div>

<p align="center"><sub>A storefront built to feel bright, useful, and easy to return to.</sub></p>

## ✦ What is Boilabin?

Boilabin is a full-stack online marketplace focused on the shopping experience in Bangladesh. The storefront brings products, categories, search, comparison, wishlist, cart, checkout, delivery information, and order follow-up into one cohesive flow. Behind it is an operations workspace for managing the catalog, inventory, orders, customers, content, promotions, returns, reviews, and reports.

The app is built with the Next.js App Router, TypeScript, Prisma, and PostgreSQL, with a responsive frontend designed for both desktop and mobile shoppers.

## 🛍️ The experience

- **Discover** — browse featured products, new arrivals, best sellers, categories, search results, and product details.
- **Decide** — compare products, save favourites, read reviews, apply filters, and keep a cart ready.
- **Checkout** — manage addresses, delivery choices, coupons, order placement, and supported local payment paths.
- **Stay informed** — follow order progress, view invoices, request returns, and find delivery and payment guidance.
- **Operate clearly** — give the admin workspace direct control over products, stock, banners, categories, orders, returns, reviews, users, and reporting.

## 🧭 Explore the code

Follow a few useful paths straight into the repository:

- [Storefront routes](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/src/app/%28store%29) · [admin workspace](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/src/app/%28admin%29) · [checkout flow](https://github.com/mdanikhasan-dev/ecommerce-website/blob/main/src/app/%28checkout%29/checkout/page.tsx)
- [Frontend components](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/src/frontend) · [backend modules](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/src/backend) · [shared contracts](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/src/shared)
- [Prisma schema](https://github.com/mdanikhasan-dev/ecommerce-website/blob/main/prisma/schema.prisma) · [database migrations](https://github.com/mdanikhasan-dev/ecommerce-website/tree/main/prisma/migrations) · [quality workflow](https://github.com/mdanikhasan-dev/ecommerce-website/blob/main/.github/workflows/quality.yml)

## ⚡ Run it locally

You’ll need Node.js 22+, PostgreSQL, and environment values for the database and authentication layers.

```bash
git clone https://github.com/mdanikhasan-dev/ecommerce-website.git
cd ecommerce-website
npm ci
```

Create a `.env.local` file with the values for your environment. At minimum, the local app needs a PostgreSQL connection, an auth secret, and a local site URL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/boilabin?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-value"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Then generate the Prisma client, apply migrations, and start the development server:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse the storefront.

## ✅ Quality checks

The repository’s GitHub Actions workflow validates the schema, lints the source, runs TypeScript checks, audits production dependencies, applies migrations to a disposable PostgreSQL database, and builds the production app.

Run the main local checks with:

```bash
npm run db:validate
npm run lint
npm run typecheck
npm run build
```

## 🌱 Contributing

Have an idea, found a sharp edge, or want to improve the shopping flow? Open an [issue](https://github.com/mdanikhasan-dev/ecommerce-website/issues) or send a focused pull request. Small, deliberate improvements are welcome.

<details>
  <summary><strong>Project notes</strong></summary>
  <br />

  Payment, email, OAuth, and upload providers are configured through environment variables. Keep credentials in local or deployment secrets, never in the repository. The exact integrations enabled in a deployment depend on the values supplied there.
</details>

<br />

<div align="center">
  <sub>Built with care for a calmer, more confident way to shop.</sub>
  <br />
  <a href="#boilabin">Back to top ↑</a>
</div>
