# Category Product Count UI Log

Date: 2026-06-02

## Files changed

- `src/app/(store)/page.tsx`
- `src/frontend/components/home/FeaturedCategories.tsx`
- `src/backend/catalog/category-product-counts.ts`
- `tests/category-product-counts.test.ts`
- `audit-reports/13_CATEGORY_PRODUCT_COUNT_UI_LOG.md`

## Where category data comes from

The homepage loads category data server-side in `src/app/(store)/page.tsx` through `getHomeData()`.

The existing source query remains `db.category.findMany()` with:

- `where: { isActive: true, parentId: null }`
- `orderBy: { sortOrder: 'asc' }`
- `take: 10`
- active direct children included for each category

The existing `FeaturedCategories` component receives this category data and still renders the same category card links.

## How product counts are calculated

Product counts are calculated server-side by `getVisibleCategoryProductCounts()` in `src/backend/catalog/category-product-counts.ts`.

The helper:

- collects the visible top-level category IDs and their active direct child category IDs
- performs one Prisma `product.groupBy({ by: ['categoryId'] })` query
- maps grouped child and direct category counts back to the top-level homepage category card

For example, a top-level Electronics card counts active visible products assigned directly to Electronics plus active visible products assigned to Electronics' active direct child categories.

## Whether counts are real dynamic counts or fallback

Counts are real dynamic database counts.

No fake, static, hardcoded, or client-side fallback counts were added.

## How inactive/draft/deleted products are excluded

The count query includes only products matching:

- `Product.isActive: true`
- active category relation
- approved seller relation: `Seller.status: APPROVED`

The current product schema does not have separate product draft, deleted, hidden, rejected, or approved fields. Seller approval exists, so seller approval is included in the count filter.

## Performance impact

The homepage now adds one grouped product count query for the visible homepage categories and their active direct children.

No N+1 category/product counting was added. No full product lists are fetched for counts. No client-side fetches or per-card API calls were added.

The count helper deduplicates category IDs before querying. Homepage `revalidate = 300` remains unchanged.

## Accessibility notes

The count is normal text inside the existing category link/card, directly below the category name.

It is available to screen readers, not rendered via CSS pseudo-elements. The category card link and arrow visual remain inside the existing accessible link behavior.

## Visual changes made

Each homepage category card now shows a compact count line under the category name:

- `0 products`
- `1 product`
- `128 products`

The count uses smaller near-white text with the existing image gradient overlay and drop shadow. The card image, rounded corners, gradient overlay, arrow button, card dimensions, grid layout, links, and hover behavior were preserved.

## Validation commands run

- `npx tsx --test tests/category-product-counts.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `git diff --check`

## Validation results

- Focused category count tests: passed, 3 tests.
- Typecheck: passed.
- Lint: passed with no warnings or errors. `next lint` printed its upstream deprecation notice for Next.js 16.
- Full test suite: passed, 98 tests across 23 suites.
- Git whitespace check: passed. Git printed CRLF normalization warnings for touched files.
- Production build: not run.
- Browser screenshot/rendering check: not run; visual change was source-inspected and constrained to the existing overlay text block.

## Remaining risks

- Homepage counts include active direct child categories, matching the category page's current direct-child product listing behavior. If deeper nested categories are added later, the helper should be extended to include descendants beyond one level.
- Counts are stricter than some existing product list queries because they also require an approved seller. This follows the requirement to count approved buyer-visible products, but storefront product queries may need future alignment if third-party seller products are introduced.
- Because the homepage is revalidated every 300 seconds, counts may lag recent product/admin changes by up to the existing cache window.
