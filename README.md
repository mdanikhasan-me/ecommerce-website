<a id="boilabin"></a>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/assets/brand/identity/v20260722/svg/boilabin-logo-light-transparent.svg" />
    <img src="./public/assets/brand/identity/v20260722/svg/boilabin-logo-dark-transparent.svg" alt="Boilabin" width="260" />
  </picture>

  <p><strong>Find it. Think it over. Order it. Know what happens next.</strong></p>

  <p>One Bangladesh-first marketplace for discovery, checkout, delivery, returns, and the work behind the counter.</p>

  <p>
    <a href="#the-whole-shopping-trip">The product</a>
    &nbsp;·&nbsp;
    <a href="#follow-the-build">Follow the build</a>
    &nbsp;·&nbsp;
    <a href="#run-it-locally">Run it locally</a>
    &nbsp;·&nbsp;
    <a href="#license">License</a>
  </p>
</div>

<br />

<div align="center">
  <img src="./.github/assets/boilabin-preview.webp" alt="Boilabin across mobile and desktop storefront screens" width="100%" />
  <p><sub>The same marketplace on the screen in your hand and the desk behind the shop.</sub></p>
</div>

<br />

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,docker,githubactions&theme=dark" />
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,docker,githubactions&theme=light" alt="Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Docker, and GitHub Actions" />
  </picture>
</div>

## The whole shopping trip

Boilabin is being built for a familiar kind of shopping: you find something on your phone, compare it a few times, place the order, and then want one simple place to see what happens next.

**Find a direction.** Categories, search, new arrivals, best sellers, and product pages help people move from “I need something” to a useful shortlist.

**Take your time.** Comparison, wishlist, reviews, filters, and a persistent cart keep the decision open until it feels right.

**Finish without losing the thread.** Addresses, delivery choices, coupons, checkout, invoices, order progress, and returns stay connected.

**Run the shop.** The admin workspace brings products, inventory, promotions, customers, orders, reviews, content, and reports into the same operating view.

## Follow the build

Open the parts that tell the product story most clearly:

- [Storefront routes](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28store%29) · [frontend components](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/frontend) · [checkout](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/src/app/%28checkout%29/checkout/page.tsx)
- [Admin workspace](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/app/%28admin%29) · [catalog and order modules](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/src/backend) · [Prisma schema](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/prisma/schema.prisma)
- [Quality workflow](https://github.com/mdanikhasan-me/ecommerce-website/blob/main/.github/workflows/quality.yml) · [database migrations](https://github.com/mdanikhasan-me/ecommerce-website/tree/main/prisma/migrations)

## Run it locally

```bash
git clone https://github.com/mdanikhasan-me/ecommerce-website.git
cd ecommerce-website
npm ci
```

Create `.env.local` with values for your PostgreSQL database and authentication setup:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/boilabin?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-value"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Run the core checks with:

```bash
npm run check:static
npm run build
```

## License

This repository is public to view. Reuse, copying, modification, redistribution, deployment, or use of the code, design, writing, images, and brand assets requires prior written permission. See the [Restricted Viewing License](./LICENSE).

<br />

<div align="center">
  <sub>The shop window, the checkout counter, and the back office—connected.</sub>
  <br />
  <a href="#boilabin">Back to top ↑</a>
</div>
