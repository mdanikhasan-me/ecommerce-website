# Step 304 Next Prompt Draft

Continue after Step 303 in the Boilabin project.

Step 303 restored photo-ready subcategory card sizing on `/category` while preserving the manual category icons and Step 302 typography. Before choosing the next UI task, first verify the current audit state and working tree.

Use `/plan` first.

## Read First

- `audit-reports/303_CATEGORY_SUBCATEGORY_CARD_SIZING_AND_MEDIA_READINESS.md`
- `audit-reports/303-category-subcategory-card-sizing/browser-category-subcategory-card-sizing-evidence.json`
- `src/app/(store)/category/page.tsx`
- `tests/category-page-uiux.test.ts`
- `git status --short`

## Important Carry-Forward Guardrails

- Do not edit, replace, regenerate, or stage the category SVG icon files unless the next step explicitly asks for icon work.
- Treat existing manual icon changes as user-owned.
- Do not touch footer/newsletter/payment-logo, payment backend/API, tracking API, seller marketplace, product lifecycle/migrations, Prisma schema/migrations, homepage category cards, product listing pages, or unrelated security files.
- Do not add fake photos, hotlinked images, AI placeholder photos, unrelated existing images, public placeholder/admin text, or generic purple templates.
- Keep `/category` order: `Mobile Phones`, `Laptops`, `Audio`, `Wearables`, then `View All Electronics`.
- Keep the trust/support strip absent.
- Keep subcategory media uploads on `/assets/categories/subcategories/<subcategory>.webp`.

## Recommended Next Safe Task

Choose one bounded visual QA target after reviewing the latest audit reports. Good candidates:

1. Inspect `/category` with real uploaded subcategory media fixtures if the user provides or approves local test images.
2. Audit another specific storefront route for visual balance using the same screenshot matrix approach.
3. Resolve the local Prisma generate blocker by stopping/restarting the locking local Next process, then rerun `npm run db:prisma:local:generate`.

## Validation Baseline

Use the validation list requested by the user for the selected step. If the work touches public UI, include focused tests and screenshot evidence.

Do not run migrations, `prisma db push`, seed/reset, destructive SQL, deployment/provider CLIs, package updates, or Docker setup unless explicitly approved for that step.
