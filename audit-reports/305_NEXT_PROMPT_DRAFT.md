# Step 306 Next Prompt Draft

Continue after Step 305 in the Boilabin project.

Step 305 tightened the admin product image cleanup lifecycle for managed `/uploads/products/**` files, proved the admin update route already removes omitted `ProductImage` rows, and preserved the Bose source catalog AVIF because the active Bose admin image is a remote Unsplash DB reference.

Use `/plan` first.

## Read First

- `audit-reports/305_PRODUCT_IMAGE_DELETE_LIFECYCLE_FIX.md`
- `audit-reports/305-product-image-delete-lifecycle/bose-readonly-evidence.json`
- `src/backend/admin/product-editor.ts`
- `tests/admin-product-image-delete-lifecycle.test.ts`
- `git status --short`

## Important Carry-Forward Guardrails

- Do not edit, replace, regenerate, stage, or revert the manual category SVG icon files unless the next step explicitly asks for icon work.
- Treat existing category SVG changes as user-owned.
- Do not mutate the real Bose product record unless the user explicitly approves that exact QA action.
- Do not delete source catalog assets under `/assets/products/catalog/**`.
- Do not run migrations, `prisma db push`, seed/reset, destructive SQL, deployment/provider CLIs, package updates, or Docker setup unless explicitly approved for that step.
- Keep `/deals` and `/api/admin/flash-sales` removed unless a dedicated approved product step changes that.
- Avoid unrelated UI, footer/newsletter/payment-logo, payment backend/API, tracking API, seller marketplace, schema, migration, or product catalog work.

## Recommended Next Safe Task

Resolve the remaining validation blocker from Step 305:

1. Identify and stop or restart the local Node/Next process holding `node_modules/.prisma/client/query_engine-windows.dll.node`.
2. Step 305 observed a likely lock on port `3000`, PID `31396`, running `node_modules\next\dist\server\lib\start-server.js`.
3. Rerun `npm run db:prisma:local:generate`.
4. If Prisma generate passes, rerun:

```txt
npm run db:url:safety
npm run db:prisma:local:validate
npm run typecheck
npm run lint
npm test
npm run build
```

## Optional Follow-Up QA

After Prisma generate is unblocked, perform only an approved disposable-product browser QA flow:

1. Create or use a temporary product with a managed `/uploads/products/**` image.
2. Remove that image through the admin UI.
3. Save and refresh.
4. Verify the `ProductImage` row is gone.
5. Verify the managed file is deleted.
6. Verify the now-empty product upload folder is removed.
7. Clean up the disposable product only through the approved admin/test flow.

Do not use the real Bose product for mutation QA unless the user explicitly approves it.

## Validation Baseline

Use terminal evidence for every claimed result. Classify any failure as task-caused, known environment blocker, unrelated pre-existing issue, or validation ordering issue.

If any committed Step 305 code is still uncommitted, stage only the files listed in the Step 305 audit report and commit with:

```txt
fix: clean up removed product media safely
```
