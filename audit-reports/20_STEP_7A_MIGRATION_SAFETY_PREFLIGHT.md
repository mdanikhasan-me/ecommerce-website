# Step 7A Migration Safety Preflight

Date: 2026-06-02

## Database Safety Classification

Classification: remote-looking / unsafe to migrate from the current environment.

Safe findings:

- Prisma datasource provider: `postgresql`.
- `.env` exists.
- Current `DATABASE_URL` was classified without printing the value.
- Current `DATABASE_URL` does not appear to target `localhost`, `127.0.0.1`, or `::1`.
- No `shadowDatabaseUrl` is configured in `prisma/schema.prisma`.
- No shadow database env var was found.
- No `.env.example` file was found.
- README local setup shows a local PostgreSQL example only.

Migration history finding:

- `prisma/migrations` directory is absent.
- Because there is no migration folder, schema/migration consistency cannot be verified from committed migration history.
- The repo appears to have relied on `prisma db push` in local setup docs.

## Whether Migration Can Be Safely Created Now

Not safely through the configured Prisma scripts in this environment.

Reason:

- `npm run db:migrate` maps to `prisma migrate dev`, which can connect to the configured database and require a shadow database.
- The configured `DATABASE_URL` is remote-looking.
- No shadow database is configured.
- No migration history folder exists.

An offline migration can be drafted as a plan, but I did not create a migration file in this step because the task is preflight-first and the current environment is not safe for migration generation.

## Whether Migration Can Be Safely Run Now

No.

Do not run migrations, `db push`, `migrate deploy`, reset, or seed against the current configuration.

## Current Product Schema Summary

Current product lifecycle and visibility fields:

- `Product.isActive Boolean @default(true)` is the only product-level public/private switch.
- `Product.stockQuantity Int @default(0)` controls stock, not lifecycle.
- `Product.slug String @unique` provides a single current public slug.
- `Product.sku String @unique`.
- `Product.categoryId String` relation to `Category`.
- `Product.sellerId String` relation to `Seller`.
- `Product.createdAt DateTime @default(now())`.
- `Product.updatedAt DateTime @updatedAt`.

Related visibility/moderation fields:

- `Category.isActive Boolean @default(true)`.
- `Seller.status SellerStatus @default(PENDING)` with `APPROVED`, `REJECTED`, `SUSPENDED`, and `PENDING`.
- `ProductVariant.isActive Boolean @default(true)` exists for variant availability, not product lifecycle.
- `Brand.isActive Boolean @default(true)` exists but Step 6 public visibility does not currently require active brand.

Missing lifecycle fields:

- No product `status` enum.
- No `publishedAt`.
- No `unpublishedAt`.
- No `deletedAt`.
- No `discontinuedAt`.
- No replacement product relation.
- No previous slug table.
- No soft-delete marker for hard-deleted products.

Indexes currently relevant to product visibility:

- `@@index([slug])`
- `@@index([categoryId])`
- `@@index([brandId])`
- `@@index([sellerId])`
- `@@index([isActive, isFeatured])`
- `@@index([isActive, isNew])`
- `@@index([isActive, isBestSeller])`
- `@@index([isActive, createdAt])`

## Proposed Additive Schema

Smallest safe Prisma schema addition:

```prisma
enum ProductStatus {
  DRAFT
  ACTIVE
  INACTIVE
  REJECTED
  ARCHIVED
  DISCONTINUED
  DELETED
}

model Product {
  // existing fields remain
  status         ProductStatus @default(ACTIVE)
  publishedAt    DateTime?
  unpublishedAt  DateTime?
  deletedAt      DateTime?
  discontinuedAt DateTime?

  @@index([status])
  @@index([status, updatedAt])
}
```

Notes:

- Keep `isActive` temporarily for compatibility.
- Do not add replacement-product or previous-slug tables in this migration.
- Do not infer `DISCONTINUED` or `DELETED` automatically from current data.
- Do not make stock part of lifecycle.

## Migration and Backfill Plan

Safe additive migration intent:

1. Create enum `ProductStatus`.
2. Add `Product.status` with default `ACTIVE`.
3. Add nullable timestamps: `publishedAt`, `unpublishedAt`, `deletedAt`, `discontinuedAt`.
4. Add indexes for status lookups.
5. Backfill:
   - `isActive = true` -> `status = ACTIVE`.
   - `isActive = false` -> `status = INACTIVE`.
   - Out-of-stock products stay `ACTIVE` if `isActive = true`.
   - No products become `DELETED`.
   - No products become `DISCONTINUED`.
6. Optional timestamp backfill:
   - For active products, `publishedAt = createdAt` if `publishedAt` is null.
   - For inactive products, `unpublishedAt = updatedAt` if `unpublishedAt` is null.

PostgreSQL-style backfill shape for later review:

```sql
UPDATE "Product"
SET
  "status" = CASE
    WHEN "isActive" = true THEN 'ACTIVE'::"ProductStatus"
    ELSE 'INACTIVE'::"ProductStatus"
  END,
  "publishedAt" = CASE
    WHEN "isActive" = true THEN COALESCE("publishedAt", "createdAt")
    ELSE "publishedAt"
  END,
  "unpublishedAt" = CASE
    WHEN "isActive" = false THEN COALESCE("unpublishedAt", "updatedAt")
    ELSE "unpublishedAt"
  END;
```

This SQL was not run.

## Compatibility Plan

Transition plan:

- Keep `isActive` during the first lifecycle migration.
- Keep Step 6 visibility helpers on `isActive`, active category, and approved seller until the migration is applied and Prisma Client is regenerated safely.
- After migration, update visibility helpers to require `status = ACTIVE` while optionally keeping `isActive = true` during a compatibility window.
- Update product create/update APIs to write both `status` and `isActive` until admin UI is fully migrated.
- Treat `status = ACTIVE` + approved seller + active category as buyer-visible.
- Keep out-of-stock active products public and indexable with `OutOfStock` JSON-LD.
- Exclude non-active statuses from sitemap, public listings, product APIs, category counts, order creation, coupon validation, and search suggestions.
- Only remove `isActive` after a separate cleanup migration and after admin code no longer depends on it.

## Admin Lifecycle Controls Plan

Current admin product UI:

- Admin products table shows an `Active`/`Inactive` badge from `isActive`.
- Admin products filter supports `active`, `inactive`, and `low_stock`.
- Product editor has a `Published` checkbox backed by `isActive`.
- Product delete attempts hard delete, then falls back to setting `isActive: false` and returning `archived: true`.

Future admin control plan:

- Admin product table should show lifecycle status as a badge: Draft, Active, Inactive, Rejected, Archived, Discontinued, Deleted.
- Product table filters should add lifecycle statuses while keeping low-stock separate.
- Product editor should replace or supplement `Published` with a lifecycle status select.
- `ACTIVE` should require category, seller, SKU, price, and public product data to be valid.
- `DISCONTINUED` should show a warning that the product will leave public listings and later may return 410 or redirect to a replacement.
- `DELETED` should require a confirmation dialog and should be soft-delete first, not hard-delete.
- `ARCHIVED` should be admin-only and not public.
- `REJECTED` should be reserved for moderation/seller workflows after seller marketplace exists.
- Public users should never see draft/rejected/archived/deleted products.

Do not implement these UI changes until the lifecycle schema is safely migrated.

## Commands Inspected

- `Get-Content audit-reports/19_STEP_6_PRODUCT_LIFECYCLE_VISIBILITY_LOG.md`
- `Get-Content package.json`
- `Get-ChildItem prisma`
- `Get-ChildItem prisma/migrations`
- Safe `.env` classifier that did not print secret values
- `rg` for database and migration references
- `Get-Content README.md` local setup section
- `Get-Content prisma/schema.prisma`
- `Get-Content src/backend/catalog/product-visibility.ts`
- Admin product management source inspection:
  - `src/frontend/components/admin/ProductEditorForm.tsx`
  - `src/app/(admin)/admin/products/page.tsx`
  - `src/backend/admin/product-editor.ts`
  - `src/app/api/admin/products/[id]/route.ts`

## Commands Intentionally Not Run

- `prisma migrate dev`
- `npm run db:migrate`
- `prisma db push`
- `npm run db:push`
- `prisma migrate deploy`
- `prisma migrate reset`
- `npm run db:reset`
- `npm run db:seed`
- Any SQL backfill command
- Any migration-generation command that might connect to the remote-looking `DATABASE_URL`

## Validation Commands Run

- `npx prisma validate`
- `npm run typecheck`
- `npm run lint`
- `npm test`

## Validation Results

| Command | Result |
|---|---|
| `npx prisma validate` | Passed; Prisma schema is valid |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 27 suites, 119 tests |

## Risks

- Running migrations from the current environment could modify a remote-looking database.
- No shadow database is configured for Prisma migration development.
- No migration history folder exists, so generating the first migration needs extra care.
- README currently recommends `prisma db push`, which is not appropriate for controlled production/staging schema lifecycle.
- Existing admin UI only knows `isActive`, so code changes must be staged after schema migration.
- Hard delete fallback currently maps failed deletes to `isActive: false`; that should become soft-delete/archive lifecycle behavior later.
- Product status and public visibility must stay synchronized during the transition period.

## Exact Recommended Next Step

Create or confirm a dedicated local/staging PostgreSQL database and a separate shadow database, add safe env docs such as `.env.example`, then create an additive migration in that safe environment only. After the migration is reviewed, update Prisma Client and adapt the Step 6 visibility helper/admin product APIs to write and read `Product.status` while keeping `isActive` for compatibility.
