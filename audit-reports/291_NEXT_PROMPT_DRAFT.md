# Step 291 Next Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 290: audit-reports/290_MEDIA_FILESYSTEM_OWNERSHIP_ICON_RECONCILIATION.md
* Step 290 reorganized source catalog product images into category/subcategory/product folders.
* Step 290 added physical local UI/social icon SVGs and moved critical public storefront icons to LocalIcon.
* Step 290 added nested managed upload path planning for products, banners, and categories.
* Step 290 proved admin delete/replace cleanup for nested managed upload temp files.
* Step 290 added local-only dry-run scripts for product media ownership reconciliation and source catalog prune auditing.
* Validation passed, build passed, and production browser evidence passed with 0 broken images, 0 missing icons, and 10 product-view interceptions.

Goal for Step 291:
Run a post-commit worktree hygiene and UI/UX readiness checkpoint only. Do not start a broad redesign yet.

Read first:

* audit-reports/290_MEDIA_FILESYSTEM_OWNERSHIP_ICON_RECONCILIATION.md
* audit-reports/290-media-filesystem-ownership-icon-reconciliation/browser-evidence.json
* git status --short
* git diff --cached --name-only
* public/assets/README.md
* docs/MEDIA_UPLOAD_POLICY.md

Allowed work:

* Create a Step 291 audit report.
* Inspect the current worktree.
* Confirm no public/uploads files are dirty/staged.
* Confirm no category/hero/banner/payment/branding source assets are dirty unless they are already intentionally part of the current commit history.
* Confirm remaining untracked files, especially old zip artifacts, are either intentionally left untracked or need a future dedicated docs cleanup.
* Review production browser evidence from Step 290 and identify the next safest UI/UX polish target.
* Do not edit runtime/source files unless a tiny documentation correction is clearly necessary.

Strict guardrails:

* Do not use git add . or git add -A.
* Do not stage or commit unless explicitly requested after the audit.
* Do not touch public/uploads.
* Do not modify category images, hero/banner source images, payment logos, branding logos, footer/newsletter/PromoSection visuals, or product catalog images.
* Do not run seed, migrations, db push, reset, destructive SQL, Docker, provider CLI, package updates, or deployment.
* Do not print secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private upload filenames, customer/order PII, or private local paths.
* Do not restore Flash Deals or /api/admin/flash-sales.
* Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, or mobile app implementation.

Validation:

* git status --short
* git diff --cached --name-only
* npm run db:url:safety
* npm run db:prisma:local:validate
* npm run db:prisma:local:generate
* npm run typecheck
* npm run lint
* npm test
* npm run build

Required report:

Create:

audit-reports/291_POST_STEP_290_WORKTREE_AND_UIUX_READINESS.md

Report sections:

1. Scope.
2. Latest commit verification.
3. Worktree status.
4. Public uploads cleanliness.
5. Media/source/icon ownership status after Step 290.
6. Browser evidence summary.
7. Remaining untracked/dirty files.
8. UI/UX readiness verdict.
9. Validation results.
10. Prohibited action confirmation.
11. Remaining risks.
12. Recommended next step.

Final response format:

1. Summary of Step 291 work.
2. Files changed, if any.
3. Worktree hygiene verdict.
4. Public uploads status.
5. UI/UX readiness verdict.
6. Validation results.
7. Confirmation no prohibited files/actions occurred.
8. Remaining risks.
9. Recommended next step.
```
