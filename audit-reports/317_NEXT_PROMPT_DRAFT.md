# Step 317 Next Prompt Draft

Continue after Step 317 in the Boilabin project.

Step 317 cleaned up active-source ARIA/role Problems patterns by replacing direct dynamic TSX ARIA state attributes with typed helpers and adding static regression tests.

## Recommended Step 318

Run a narrow browser-runtime cleanup decision pass for the remaining fallback Edge/CDP smoke nonzero items:

```txt
Homepage Next.js 16 future image localPatterns query-string warnings.
One NextAuth ClientFetchError during /category/electronics mobile-390 session fetch.
Mobile search focus helper miss in scripts/local-browser-runtime-check.mjs.
```

Use `/plan` first.

## Hard Guardrails

Do not touch:

* Step 314 admin banner upload implementation.
* Step 315 restored source banner asset.
* Step 316 Toys & Collectibles JPG/version pair.
* Step 317 ARIA helper/test changes unless directly validating them.
* category SVG edits.
* `public/uploads/admin/banners/hero/`.
* product image/media repair logic.
* navbar/dropdown/header visuals.
* Help page visuals.
* homepage hero/category card visuals.
* footer.
* payment backend/API.
* tracking API.
* seller marketplace.
* env files.
* packages.
* Prisma schema/migrations.
* DB rows.

Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.

## Validation

Start with read-only evidence:

```bash
git status --short
node scripts/local-browser-runtime-check.mjs --mode dev --port 3118 --cdp-port 9418 --startup-timeout-ms 90000 --request-timeout-ms 20000
```

Then decide whether the nonzero items are task-fixable, pre-existing, or should remain separate.

Do not execute this draft until the user approves Step 318.
