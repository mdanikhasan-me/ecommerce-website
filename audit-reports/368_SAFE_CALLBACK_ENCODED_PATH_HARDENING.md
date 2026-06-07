# Step 368 Safe Callback Encoded Path Hardening

## Scope

Step 368 skips the still-blocked media decision and completes a bounded non-media safe callback encoded-path hardening step.

Latest commit before Step 368:

```text
da4e53b fix: harden safe callback metadata targets
```

Step 367 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

After Steps 366 and 367, `getSafeCallbackUrl` rejected auth/API/framework/static/metadata callback targets using the parsed URL pathname.

The parsed pathname could still contain percent-encoded path characters, so encoded targets such as these could bypass the blocked target checks:

- `/%61uth/login`
- `/%61pi/orders`
- `/_%6eext/static/chunks/app.js`
- `/%61ssets/logo.svg`
- `/%72obots.txt`
- `/%2Fexample.com/phish`
- `/%5Cexample.com`

Malformed encodings were also better treated as invalid callback destinations instead of preserving a confusing callback path.

## Fix

Updated:

- `src/frontend/utils/safe-callback-url.ts`

Added focused coverage in:

- `tests/safe-callback-url.test.ts`

The callback sanitizer now decodes the URL pathname for validation, rejects malformed encodings, rejects decoded protocol-relative/backslash shapes, and applies the existing target blocklists to the decoded pathname.

Safe encoded internal page callbacks are still preserved, for example:

- `/products/test%20product?ref=search#details`
- `/search?q=wireless%20audio`

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 367 handoff, current status, callback sanitizer, and focused callback tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused safe callback tests plus standard validation.
- Docs Auditor: created this Step 368 report, evidence folder, and Step 369 handoff prompt.
- Implementer: edited only the authorized callback helper and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/safe-callback-url.test.ts` passed: 9 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 687 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/368-safe-callback-encoded-path-hardening/baseline-git-status.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/pre-stage-git-status.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/finding-note.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/source-diff.patch`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-diff-check.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-focused-tests.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-advisor-state-initial.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-advisor-state.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-terminal-loop-state.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-typecheck.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-lint.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-npm-test.txt`
- `audit-reports/368-safe-callback-encoded-path-hardening/validation-build.txt`

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

Step 368 did not touch:

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
- `audit-reports/368_SAFE_CALLBACK_ENCODED_PATH_HARDENING.md`
- `audit-reports/368_NEXT_PROMPT_DRAFT.md`
- `audit-reports/368-safe-callback-encoded-path-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens login/register callback target selection only. It does not change auth providers, session validation, middleware matching, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
