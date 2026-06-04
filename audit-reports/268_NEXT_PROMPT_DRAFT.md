# Step 268 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 267: `audit-reports/267_CATEGORY_IMAGE_REPLACEMENT_BUG_FIX.md`
* Step 267 fixed same-filename category image replacement reliability by adding deterministic SHA-versioned category image URLs in `src/shared/category-media.ts`.
* All eight owner-provided category JPGs are preserved as-is.
* Browser QA confirmed mobile/tablet/desktop load versioned `next/image` URLs and `/deals` plus `/api/admin/flash-sales` remain 404.

Goal for Step 268:
Run final homepage/category image visual acceptance QA only. Do not edit images or source unless a clear Step 267 regression is found and the fix is tiny and directly related.

Read first:

* `audit-reports/267_CATEGORY_IMAGE_REPLACEMENT_BUG_FIX.md`
* `audit-reports/267-category-image-replacement-qa/post-fix-category-image-evidence.json`
* `src/shared/category-media.ts`
* `src/frontend/components/home/FeaturedCategories.tsx`
* `tests/category-media.test.ts`

Tasks:

1. Verify all eight category images visually on the homepage at:
   * 390
   * 430
   * 768
   * 1366
2. Confirm each category image URL includes the deterministic `?v=` hash in the encoded `next/image` `url=` parameter.
3. Confirm direct `/assets/categories/*.jpg` serves the owner-provided file hashes.
4. Confirm no mobile-only stale category images remain.
5. Confirm no category card layout/design regression.
6. Confirm `/deals` and `/api/admin/flash-sales` remain 404.
7. Confirm footer YouTube/payment regression remains clean.

Allowed files:

* `audit-reports/268_HOMEPAGE_CATEGORY_IMAGE_VISUAL_ACCEPTANCE_QA.md`
* `audit-reports/269_NEXT_PROMPT_DRAFT.md`
* optional evidence only under `audit-reports/268-category-image-visual-qa/`

Strict guardrails:

* Do not replace, generate, download, optimize, rename, or edit image files.
* Do not touch product images, banner images, footer, newsletter, payment logos, `PromoSection`, cart, checkout, auth, payment, backend/API, Prisma schema, migrations, seed/reset/db push, SEO, seller, tracking, mobile app, CSP, rate-limit, or deployment.
* Do not print secrets or full DB URLs.
* Do not use broad staging.

Validation:

* `git diff --check -- audit-reports/268_HOMEPAGE_CATEGORY_IMAGE_VISUAL_ACCEPTANCE_QA.md audit-reports/269_NEXT_PROMPT_DRAFT.md audit-reports/268-category-image-visual-qa`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

If report/evidence only:

`docs: add category image visual acceptance QA`

Final response format:

1. Summary of Step 268 visual QA
2. Files changed/staged/committed
3. Category image visual result
4. Versioned URL result
5. Removed route/footer regression result
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```

## Recommended Next Step

Use the prompt above for Step 268 to run final homepage/category image visual acceptance QA on the versioned category image URLs.
