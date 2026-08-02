<a id="boilabin"></a>

<div align="center">
  <table align="center" border="0" cellpadding="18" cellspacing="0">
    <tr>
      <td align="center" bgcolor="#ffffff">
        <img src="./public/assets/brand/identity/v20260722/svg/boilabin-logo-dark-transparent.svg" alt="Boilabin" width="240" />
      </td>
    </tr>
  </table>

  <p><strong>A marketplace for the moment between “I need something” and “where is my order?”</strong></p>

  <p>
    Boilabin is an online shopping experience for Bangladesh — made to feel easy to browse, honest to use, and useful after checkout.
  </p>

  <p>
    <a href="#the-short-version">The short version</a>
    &nbsp;·&nbsp;
    <a href="#find-your-way-around">Find your way around</a>
    &nbsp;·&nbsp;
    <a href="#run-it-locally">Run it locally</a>
  </p>

  <p>
    <a href="https://github.com/mdanikhasan-me/ecommerce-website/actions/workflows/quality.yml"><img src="https://github.com/mdanikhasan-me/ecommerce-website/actions/workflows/quality.yml/badge.svg" alt="Quality and security workflow" /></a>
    <img src="https://img.shields.io/badge/Next.js-15-111827?logo=nextdotjs&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma ORM" />
    <img src="https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

<br />

<div align="center">
  <img src="./.github/assets/boilabin-preview.webp" alt="Boilabin storefront preview across desktop and mobile screens" width="100%" />
  <p><sub>One frame, three surfaces: mobile browsing, the storefront, and the working parts behind it.</sub></p>
</div>

## The short version

> Find the thing. Compare it. Place the order. Know what happens next.

Boilabin has two faces. On the outside, it is a responsive store for discovering products, making a decision, and following an order home. On the inside, it is an operations workspace for keeping products, stock, promotions, customers, orders, returns, and content in shape.

The point of the project is not to make shopping feel louder. It is to make the useful parts easier to find.

## What you can do here

- **Browse without getting lost** — move through categories, new arrivals, best sellers, search, filters, and product detail pages.
- **Take a second look** — compare products, keep a wishlist, read reviews, and leave the cart open while you decide.
- **Finish the job** — manage addresses, delivery choices, coupons, checkout, payment paths, invoices, and order progress.
- **Keep the shop moving** — manage products, inventory, banners, categories, orders, returns, reviews, customers, content, and reports from the admin workspace.

## Find your way around

If you want to understand the product quickly, these are the useful doors:

- [Start with the storefront](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28store%29) · [see the admin workspace](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28admin%29) · [follow checkout](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/src/app/%28checkout%29/checkout/page.tsx)
- [Browse frontend components](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/frontend) · [browse backend modules](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/backend) · [see shared contracts](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/shared)
- [Read the Prisma schema](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/prisma/schema.prisma) · [inspect migrations](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/prisma/migrations) · [see the CI workflow](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/.github/workflows/quality.yml)

## Under the hood

The main path is intentionally straightforward: Next.js renders the experience, domain-focused backend modules hold the commerce rules, Prisma talks to PostgreSQL, and GitHub Actions checks the pieces before a production build.

**Stack:** Next.js App Router · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth · Zustand

## Run it locally

You’ll need Node.js 22+, PostgreSQL, and environment values for the database and authentication layers.

```bash
git clone https://github.com/mdanikhasan-me/ecommerce-website.git
cd ecommerce-website
npm ci
```

Create a `.env.local` file with values for your environment. At minimum:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/boilabin?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-value"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Generate the Prisma client, apply migrations, and start the app:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Open [localhost:3000](http://localhost:3000) when the server is ready.

## Checks that matter

The CI workflow validates the Prisma schema, lints the source, runs TypeScript checks, audits production dependencies, applies migrations to a disposable PostgreSQL database, and builds the production application.

Run the same core checks locally:

```bash
npm run check:static
npm run build
```

## License

Everyone is welcome to read this repository and visit the project. Reuse is not granted: copying, modifying, redistributing, deploying, or using the code, design, writing, images, or brand assets in another project requires prior written permission. See the [Restricted Viewing License](./LICENSE).

<details>
  <summary><strong>Integration notes</strong></summary>
  <br />

  Payment, email, OAuth, and upload providers are configuration-backed. Keep credentials in local or deployment secrets; the integrations active in a deployment depend on the values supplied there.
</details>

<br />

<div align="center">
  <sub>Calm on the surface. Serious underneath.</sub>
  <br />
  <a href="#boilabin">Back to top ↑</a>
</div>
