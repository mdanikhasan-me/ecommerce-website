# Step 313 Next Prompt Draft

Continue after Step 313 in the Boilabin project.

This is Step 314: **subcategory managed media cleanup-readiness path fix**.

Use `/plan` first.

## Goal

Verify and, if needed, repair admin cleanup path resolution for approved subcategory managed media paths under:

```txt
/assets/categories/subcategories/**
```

Step 309 identified this as an approved managed category-media exception under `/assets`, but admin cleanup helpers may resolve deletion paths through `/uploads/admin/**` and silently skip real subcategory files. This step is source-code cleanup-readiness only.

Do not delete any media files in this step.

## Read First

Read:

```txt
audit-reports/313_NAVBAR_DROPDOWN_POLISH_AND_SUBCATEGORY_ICONS.md
audit-reports/313-navbar-dropdown-polish/browser-dropdown-polish-evidence.json
audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md
tests/admin-media-lifecycle.test.ts
src/lib/admin-utils.ts
src/lib/media-storage.ts
scripts/audit-public-media-source-of-truth.mjs
```

## Hard Guardrails

Do not:

- mutate DB rows
- run seed/reset/db push/destructive SQL
- edit Prisma schema or migrations
- delete, move, create, replace, or clean up media files
- clean up upload/orphan files
- clean up QA/temp directories
- edit or stage category SVG files
- change upload destinations
- redesign navbar, Help page, footer, homepage, category page, product cards, or product listing UI
- touch payment, tracking, seller, env, packages, `/deals`, Flash Deals, sale, or collections
- add remote images or hotlink media

Do not touch the four managed upload orphan candidates.

## Allowed Actions

Allowed:

- Read existing admin media classification and cleanup helper code.
- Add or update focused tests proving `/assets/categories/subcategories/**` resolves to the correct filesystem path only when the shared classifier approves it.
- Patch the smallest source-code path-resolution bug if tests prove it.
- Keep protections for source assets under `/assets/products/catalog/**`, `/assets/banners/**`, and `/assets/icons/**`.
- Create Step 314 evidence/report and next prompt draft.

## Validation

Run:

```bash
git status --short
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run typecheck
npm run lint
npm test
npm run build
```

If Prisma generate is blocked by Windows `EPERM`, identify/report the locking process. Do not kill processes unless explicitly approved.

## Audit Report

Create:

```txt
audit-reports/314_SUBCATEGORY_MEDIA_CLEANUP_PATH_READINESS.md
audit-reports/314_NEXT_PROMPT_DRAFT.md
```

The report must include:

- root cause
- exact source/test files changed
- confirmation no DB rows were changed
- confirmation no media/upload/orphan/category SVG files were changed or staged
- validation results
- Prisma generate status
- exact files staged/committed
- commit hash if committed
- recommended next step

## Staging

Before staging:

```bash
git status --short
git diff --stat
git diff --name-only
```

Stage only Step 314 files:

- focused Step 314 source/test changes
- Step 314 audit report
- Step 314 next prompt draft
- Step 314 evidence files if created

Do not stage category SVG edits, media files, upload files, DB files, env/package files, or unrelated dirty files.

## Commit

If validation is acceptable, commit with:

```txt
fix: repair subcategory media cleanup path resolution
```

## Final Response Format

Return only:

1. Cleanup-readiness fix summary.
2. Exact source/test files changed.
3. DB/media/upload/orphan untouched confirmation.
4. Category SVG untouched confirmation.
5. Validation results.
6. Prisma generate status.
7. Exact files staged/committed.
8. Commit hash/oneline, or reason no commit happened.
9. Recommended next step.
