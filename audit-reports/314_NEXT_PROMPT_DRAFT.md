# Step 315 Prompt Draft

Continue after Step 314 in the Boilabin project.

This is Step 315: **source banner asset validation blocker resolution**.

## Context

Step 314 fixed admin banner image upload base64/data-url handling. Its focused tests, typecheck, lint, and build passed. Full `npm test` is still blocked by an unrelated pre-existing working-tree deletion:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

The failure appears in media/readiness tests that expect this tracked source banner asset to exist.

## Goal

Resolve only the missing tracked source banner asset validation blocker so the full test suite can run cleanly again.

Preferred first action: verify whether `public/assets/banners/home-hero-iphone-15-pro.jpg` should be restored from git as the canonical source asset, or whether current seed/source references intentionally changed and tests/references need a narrowly approved update.

## Hard Guardrails

- Use `/plan` first.
- Do not touch the Step 314 admin banner upload implementation unless validation proves a direct regression.
- Do not redesign navbar/dropdown/header.
- Do not redesign Help page, homepage hero UI, footer, or `/category`.
- Do not edit category SVG icons.
- Do not touch product media repair work except to confirm it is not involved.
- Do not touch payment, tracking, seller marketplace, env files, packages, Prisma schema, or migrations.
- Do not run seed/reset/db push/destructive SQL.
- Do not stage unrelated dirty files.

## Required Inspection

Read:

```txt
audit-reports/314_BANNER_UPLOAD_BASE64_FIX.md
audit-reports/309_MEDIA_SOURCE_OF_TRUTH_AND_UPLOAD_PIPELINE_AUDIT.md
audit-reports/310_TRACKED_SOURCE_MEDIA_RESTORE.md
tests/storefront-image-source.test.ts
tests/storefront-media-remote-policy.test.ts
tests/navbar-banner-footer-polish.test.ts
tests/ui-ux-redesign-readiness.test.ts
```

Then inspect:

```bash
git status --short
git ls-files public/assets/banners/home-hero-iphone-15-pro.jpg
git show HEAD:public/assets/banners/home-hero-iphone-15-pro.jpg
rg -n "home-hero-iphone-15-pro|/assets/banners" prisma src tests audit-reports
```

## Implementation Options

If the asset deletion is accidental:

- Restore only `public/assets/banners/home-hero-iphone-15-pro.jpg` from git.
- Do not change DB rows or seed data.
- Do not stage category SVG edits.

If the deletion is intentional:

- Stop and report the exact source references/tests that still require it.
- Draft the smallest approved follow-up instead of silently changing source-of-truth policy.

## Validation

Run:

```bash
git status --short
npm run db:url:safety
npm run db:prisma:local:validate
npm run typecheck
npm run lint
npm test
npm run build
```

Run `npm run db:prisma:local:generate` only if the Windows Prisma engine lock is no longer present, or report the same EPERM blocker and locking processes without killing them.

## Evidence And Report

Create:

```txt
audit-reports/315_SOURCE_BANNER_ASSET_VALIDATION_BLOCKER.md
audit-reports/315_NEXT_PROMPT_DRAFT.md
```

Include:

- root cause of missing asset blocker
- exact action taken or reason stopped
- validation results
- exact files changed
- guardrail confirmation
- remaining risks

## Staging

Stage only Step 315 files. Do not stage Step 314 unrelated leftovers, category SVG edits, DB files, env/package files, generated uploads, or unrelated media changes.

Suggested commit if restored:

```txt
fix: restore tracked source banner asset
```

Do not execute Step 316 automatically.
