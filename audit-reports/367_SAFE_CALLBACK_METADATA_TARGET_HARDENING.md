# Step 367 Safe Callback Metadata Target Hardening

## Scope

Step 367 skips the still-blocked media decision and completes a bounded non-media safe callback metadata/icon target hardening step.

Latest commit before Step 367:

```text
598b94c fix: harden safe callback route targets
```

Step 366 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

After Step 366, `getSafeCallbackUrl` rejected auth loops, API routes, framework routes, and static/upload asset prefixes.

It still allowed exact metadata and icon routes as login/register callback destinations:

- `/apple-touch-icon.png`
- `/favicon.ico`
- `/opengraph-image`
- `/robots.txt`
- `/sitemap.xml`

Those routes are safe from an open-redirect perspective, but they are not useful post-auth destinations and can create confusing callback behavior after login or registration.

## Fix

Updated:

- `src/frontend/utils/safe-callback-url.ts`

Added focused coverage in:

- `tests/safe-callback-url.test.ts`

The callback sanitizer now rejects exact metadata/icon routes before preserving internal path callbacks. The test covers query/hash variants such as `/robots.txt?cache=1` and `/sitemap.xml#top`, while preserving public lookalikes such as `/favicon.icology`, `/robots.txt-preview`, and `/sitemap.xml-preview`.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 366 handoff, current status, callback sanitizer, and focused callback tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused safe callback tests plus standard validation.
- Docs Auditor: created this Step 367 report, evidence folder, and Step 368 handoff prompt.
- Implementer: edited only the authorized callback helper and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/safe-callback-url.test.ts` passed: 7 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 685 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/367-safe-callback-metadata-target-hardening/baseline-git-status.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/pre-stage-git-status.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/finding-note.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/source-diff.patch`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-diff-check.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-focused-tests.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-advisor-state-initial.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-advisor-state.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-terminal-loop-state.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-typecheck.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-lint.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-npm-test.txt`
- `audit-reports/367-safe-callback-metadata-target-hardening/validation-build.txt`

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

Step 367 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside safe callback target normalization

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/frontend/utils/safe-callback-url.ts`
- `tests/safe-callback-url.test.ts`
- `audit-reports/367_SAFE_CALLBACK_METADATA_TARGET_HARDENING.md`
- `audit-reports/367_NEXT_PROMPT_DRAFT.md`
- `audit-reports/367-safe-callback-metadata-target-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens login/register callback target selection only. It does not change auth providers, session validation, middleware matching, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
