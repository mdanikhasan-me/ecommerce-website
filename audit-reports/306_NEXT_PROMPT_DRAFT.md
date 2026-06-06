# Step 307 Next Prompt Draft

Continue after Step 306 in the Boilabin project.

Step 306 replaced 12 local-development `ProductImage.url` rows from remote Unsplash URLs to existing `/assets/products/catalog/**` assets after generating a safe mapping report. The postcheck shows no remaining `ProductImage.url` rows starting with `https://images.unsplash.com`.

Use `/plan` first.

## Read First

- `audit-reports/306_PRODUCT_REMOTE_TO_LOCAL_IMAGE_REPLACEMENT.md`
- `audit-reports/306-product-local-image-replacement/product-image-localization-plan.json`
- `audit-reports/306-product-local-image-replacement/product-image-localization-apply-evidence.json`
- `audit-reports/306-product-local-image-replacement/product-image-localization-postcheck.json`
- `audit-reports/306-product-local-image-replacement/bose-db-local-asset-postcheck.json`
- `scripts/replace-remote-product-images-with-local-catalog.ts`
- `src/backend/catalog/product-local-image-replacement.ts`
- `tests/product-local-image-replacement.test.ts`
- `git status --short`

## Important Carry-Forward Guardrails

- Do not edit, replace, regenerate, stage, or revert the manual category SVG icon files unless the next step explicitly asks for icon work.
- Treat existing category SVG changes as user-owned.
- Do not delete `/assets/products/catalog/**`.
- Do not copy remote images.
- Do not hotlink new remote images.
- Do not run seed/reset, `prisma db push`, migrations, destructive SQL, deployment/provider CLIs, package updates, or Docker setup unless explicitly approved for that step.
- Do not touch footer/newsletter/payment-logo, payment backend/API, tracking API, seller marketplace, homepage redesign, category page UI/card/icon work, unrelated security/CSP/rate-limit files, or Prisma schema/migrations.

## Recommended Next Safe Task

Resolve the validation blocker first:

1. Stop or restart the Node/Next process holding `node_modules/.prisma/client/query_engine-windows.dll.node`.
2. Step 306 observed Node PID `33696` on port `3000`, running `node_modules\next\dist\server\lib\start-server.js`.
3. Rerun `npm run db:prisma:local:generate`.
4. If generate passes, rerun:

```txt
npm run db:url:safety
npm run db:prisma:local:validate
npm run typecheck
npm run lint
npm test
npm run build
```

## Product DB Drift Follow-Up

After Prisma generate is unblocked, run a dedicated read-first local product DB/seed reconciliation step:

1. Compare current local DB product slugs/SKUs against `prisma/seed.ts` and `src/shared/product-media.ts`.
2. Explain why current local DB has 19 products while the source catalog has 21 product media entries.
3. Specifically verify why `bose-quietcomfort-45-headphones` is absent from the current local DB even though the seed/source catalog and local AVIF exist.
4. Generate a no-mutation reconciliation report before any DB change.
5. Do not insert, delete, reseed, reset, or mutate product rows unless the report proves the mapping is safe and the user explicitly approves that bounded DB action.

## Optional Authenticated QA

If an authenticated browser/session is available:

1. Open admin products.
2. Verify a replaced product such as `sony-wh-1000xm5` shows `/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif`.
3. Verify the preview loads.
4. Open the public product page and verify the same local image loads.

If auth is blocked, use read-only DB/API/filesystem evidence and say that clearly.

## Commit Reminder

If Step 306 files are still uncommitted, stage only the files listed in the Step 306 audit report and commit with:

```txt
fix: prefer local catalog product images
```
