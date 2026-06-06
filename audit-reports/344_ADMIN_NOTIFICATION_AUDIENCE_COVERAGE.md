# Step 344 Admin Notification Audience Coverage

## Scope

Step 344 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for admin notification payload, read-toggle, and audience-filter contracts.

Latest commit before Step 344:

```text
a87033a test: cover admin coupon safety
```

Step 343 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing notification validation suite covered the core parser behavior, but several audience-safety and copy-boundary contracts were not directly locked down:

- supported admin notification recipient audiences;
- supported Prisma notification type values;
- absolute http link trimming;
- blank direct-user ids being rejected for direct notifications;
- link length rejection;
- blank message rejection;
- read-toggle `false` acceptance and null rejection;
- exact active-customer and active-user audience filters.

These contracts protect admin notification workflows without requiring database access, media changes, browser auth, migrations, or provider decisions.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/notification-validation.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/notification-validation.test.ts audit-reports/344_ADMIN_NOTIFICATION_AUDIENCE_COVERAGE.md audit-reports/344_NEXT_PROMPT_DRAFT.md audit-reports/344-admin-notification-audience-coverage` passed.
- `npx tsx --test tests/notification-validation.test.ts` passed: 11 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 629 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/344-admin-notification-audience-coverage/baseline-git-status.txt`
- `audit-reports/344-admin-notification-audience-coverage/source-diff.patch`
- `audit-reports/344-admin-notification-audience-coverage/validation-diff-check.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-focused-tests.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-advisor-state.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-terminal-loop-state.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-typecheck.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-lint.txt`
- `audit-reports/344-admin-notification-audience-coverage/validation-npm-test.txt`
- `audit-reports/344-admin-notification-audience-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed admin notification contracts are covered by focused tests and the full test suite.

## Push Rule

The user gave standing permission in this chat to push each completed step to GitHub after commit.

Use:

```text
git push origin main
```

Git account targeting for this repo is pinned to:

```text
mdanikhasan-dev
```

Do not print or store GitHub credentials.

## Guardrail Confirmation

Step 344 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, media staging, or private env read was run.

## Files To Stage

Stage only:

- `tests/notification-validation.test.ts`
- `audit-reports/344_ADMIN_NOTIFICATION_AUDIENCE_COVERAGE.md`
- `audit-reports/344_NEXT_PROMPT_DRAFT.md`
- `audit-reports/344-admin-notification-audience-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB notification coverage only. It does not prove database-backed notification sends, browser rendering, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
