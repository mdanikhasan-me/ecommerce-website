<a id="boilabin"></a>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/assets/brand/identity/v20260722/svg/boilabin-logo-light-transparent.svg" />
    <img src="./public/assets/brand/identity/v20260722/svg/boilabin-logo-dark-transparent.svg" alt="Boilabin" width="260" />
  </picture>

  <p><strong>A marketplace built to stay useful after checkout.</strong></p>

  <p>
    <a href="#three-surfaces-one-shop">The product</a>
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
  <p><sub>Browse on a phone, shop on a larger screen, and keep the store moving behind the scenes.</sub></p>
</div>

## Three surfaces, one shop

Boilabin is an e-commerce product for Bangladesh. It is built around the moments that usually become loose ends online: checking a product twice, changing your mind, finding an order again, and keeping the shop itself in shape.

**On the phone.** Categories, search, products, wishlist, cart, and account are designed for the screen most shoppers actually have in their hand.

**In the storefront.** Product discovery, comparison, checkout, delivery choices, receipts, reviews, and order progress stay connected instead of becoming separate dead ends.

**Behind the counter.** The admin workspace keeps products, inventory, promotions, customers, orders, returns, reviews, content, and reports in one working place.

## Follow the build

Start with the pieces that tell the story clearly:

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
  <sub>Built for the shopping trip, not just the cart.</sub>
  <br />
  <a href="#boilabin">Back to top ↑</a>
</div>
