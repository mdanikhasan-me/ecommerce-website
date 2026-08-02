<a id="boilabin"></a>

<div align="center">
  <table align="center" border="0" cellpadding="18" cellspacing="0">
    <tr>
      <td align="center" bgcolor="#ffffff">
        <img src="./public/assets/brand/identity/v20260722/svg/boilabin-logo-dark-transparent.svg" alt="Boilabin" width="240" />
      </td>
    </tr>
  </table>

  <p><strong>A better place to start when you know what you need — but not yet where to find it.</strong></p>

  <p>
    Boilabin is an online marketplace for Bangladesh, built around the part of shopping that usually gets ignored: the moment after the search, before the decision, and the days after the order is placed.
  </p>

  <p>
    <a href="#boilabin-in-one-sentence">The idea</a>
    &nbsp;·&nbsp;
    <a href="#take-a-look-around">Take a look around</a>
    &nbsp;·&nbsp;
    <a href="#run-it-locally">Run it locally</a>
    &nbsp;·&nbsp;
    <a href="#license">License</a>
  </p>

  <p>
    <a href="https://github.com/mdanikhasan-me/ecommerce-website/actions/workflows/quality.yml"><img src="https://github.com/mdanikhasan-me/ecommerce-website/actions/workflows/quality.yml/badge.svg" alt="Quality and security workflow" /></a>
  </p>
</div>

<br />

<div align="center">
  <img src="./.github/assets/boilabin-preview.webp" alt="Boilabin storefront preview across desktop and mobile screens" width="100%" />
  <p><sub>One product, seen from three useful angles: browse it, shop it, run it.</sub></p>
</div>

## Boilabin in one sentence

Boilabin is a full-stack store for people who want to find something, think about it for a minute, place an order, and still know what is happening after they click “buy.”

The front of the house is a responsive shopping experience. The back of the house is an operations workspace for products, stock, promotions, customers, orders, returns, reviews, content, and reporting. The two sides live in the same repository because they are part of the same promise.

## Take a look around

Start with the parts that make the product feel like a product:

- [Storefront routes](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28store%29) — categories, search, products, accounts, orders, help, and the rest of the customer journey.
- [Frontend components](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/frontend) — the reusable pieces that shape the visible experience.
- [Checkout](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/src/app/%28checkout%29/checkout/page.tsx) — the hand-off from a full cart to a real order.
- [Admin workspace](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28admin%29) — the tools behind the catalog and daily operations.
- [Backend modules](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/backend) — domain logic for catalog, accounts, orders, email, SEO, security, and commerce rules.
- [Prisma schema](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/prisma/schema.prisma) — the data model that holds the whole thing together.

## The experience, in plain language

**Find a direction.** Browse categories, featured products, new arrivals, best sellers, search results, and product details without losing the thread.

**Make a decision.** Compare products, save a wishlist, read reviews, apply filters, and leave the cart open while you decide.

**Keep the thread.** Manage addresses, delivery choices, coupons, checkout, payment paths, invoices, order progress, and returns in one place.

**Run the room.** Give the people operating the shop control over products, inventory, banners, categories, orders, returns, reviews, customers, content, and reports.

## How it is put together

The main path is deliberately straightforward:

`Next.js App Router` → `domain modules` → `Prisma` → `PostgreSQL`

The interface uses TypeScript and Tailwind CSS. Authentication uses NextAuth, client-side shopping state uses Zustand, and GitHub Actions checks the schema, source, dependencies, migrations, and production build.

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

Run the core checks locally:

```bash
npm run check:static
npm run build
```

The CI workflow also audits production dependencies and applies migrations to a disposable PostgreSQL database before building.

## License

Everyone is welcome to read this repository and visit the project. Reuse is not granted: copying, modifying, redistributing, deploying, or using the code, design, writing, images, or brand assets in another project requires prior written permission. See the [Restricted Viewing License](./LICENSE).

<br />

<div align="center">
  <sub>A calm storefront on top. A serious system underneath.</sub>
  <br />
  <a href="#boilabin">Back to top ↑</a>
</div>
