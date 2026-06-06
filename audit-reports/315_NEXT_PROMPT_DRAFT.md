# Step 316 Prompt Draft

Continue after Step 315 in the Boilabin project.

This is Step 316: **category media hash validation blocker resolution**.

## Context

Step 315 restored the missing tracked source banner asset:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

The focused Step 314 failing tests now pass. Full `npm test` is still blocked by an unrelated pre-existing category image hash mismatch:

```txt
tests/category-media.test.ts
toys-collectibles version should match image hash
actual:   11993afd8f62
expected: 18811d8fecf3
```

The dirty file is:

```txt
public/assets/categories/toys-collectibles.jpg
```

## Goal

Resolve only the Toys & Collectibles category media hash blocker so the full test suite can pass again.

First decide whether the image modification is accidental or intentional.

## Hard Guardrails

- Use `/plan` first.
- Do not touch Step 314 admin banner upload implementation.
- Do not touch restored source banner assets unless validation proves a direct regression.
- Do not edit category SVG icons.
- Do not redesign navbar/dropdown/header, Help page, homepage hero UI, footer, or `/category`.
- Do not touch product image/media repair work.
- Do not touch payment, tracking, seller marketplace, env files, packages, Prisma schema, or migrations.
- Do not run seed/reset/db push/destructive SQL.
- Do not stage upload/orphan candidates.
- Do not stage unrelated dirty files.

## Required Inspection

Read:

```txt
audit-reports/315_SOURCE_BANNER_ASSET_VALIDATION_BLOCKER.md
tests/category-media.test.ts
src/shared/category-media.ts
```

Then inspect:

```bash
git status --short
git diff --stat -- public/assets/categories/toys-collectibles.jpg
git ls-files public/assets/categories/toys-collectibles.jpg
git cat-file -s HEAD:public/assets/categories/toys-collectibles.jpg
rg -n "toys-collectibles.jpg|toys-collectibles|CATEGORY_PHOTO_ASSETS" src tests scripts prisma
```

## Decision Path

If the image modification is accidental:

- Restore only:

```txt
public/assets/categories/toys-collectibles.jpg
```

using exact-path restore.

If the image modification is intentional:

- Update only the approved content-version hash in `src/shared/category-media.ts`.
- Do not change category SVG icons.
- Do not change category UI design.

If ownership is unclear, stop and report the exact blocker instead of guessing.

## Validation

Run:

```bash
git status --short
npx tsx --test tests/category-media.test.ts tests/storefront-media-remote-policy.test.ts
npm run db:url:safety
npm run db:prisma:local:validate
npm run typecheck
npm run lint
npm test
npm run build
```

Run Prisma generate only if the known Windows Prisma engine lock is gone; otherwise report the locking processes without killing them.

## Evidence And Report

Create:

```txt
audit-reports/316_CATEGORY_MEDIA_HASH_VALIDATION_BLOCKER.md
audit-reports/316_NEXT_PROMPT_DRAFT.md
```

Include:

- root cause
- whether the category image was restored or version hash was updated
- active references requiring it
- validation results
- exact files staged/committed
- guardrail confirmation
- remaining risks
- recommended next step

## Staging

Stage only Step 316 files. Do not stage category SVG edits, upload/orphan directories, DB files, env/package files, Step 314 banner upload files, or unrelated dirty files.

Suggested commit message if restored:

```txt
fix: restore toys category source image
```

Suggested commit message if the version hash is intentionally updated:

```txt
fix: update toys category media version
```

Do not execute Step 317 automatically.
