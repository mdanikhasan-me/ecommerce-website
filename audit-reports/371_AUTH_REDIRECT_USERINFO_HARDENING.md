# Step 371 Auth Redirect Userinfo Hardening

## Scope

Step 371 skips the still-blocked media decision and completes a bounded non-media auth redirect userinfo hardening step.

Latest commit before Step 371:

```text
f02b9ff fix: harden auth redirect callback
```

Step 370 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Step 370 added a backend same-origin auth redirect helper, but the helper did not reject URL username/password fields.

That meant a same-origin absolute redirect such as these could still be accepted:

- `https://user:pass@shop.example.com/account`
- `https://user@shop.example.com/account`

The URL origin is still `https://shop.example.com`, but userinfo credentials in redirect URLs are confusing and should not be returned by auth redirect handling. The base URL parser also accepted configured base URLs containing userinfo.

## Fix

Updated:

- `src/backend/auth/redirect.ts`
- `tests/auth-redirect.test.ts`

The auth redirect helper now rejects userinfo credentials in:

- configured base URLs
- candidate redirect target URLs

Focused tests cover same-origin absolute targets with username/password and invalid base URLs containing userinfo.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 370 handoff, current status, auth redirect helper, and focused auth redirect tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused auth redirect tests plus standard validation.
- Docs Auditor: created this Step 371 report, evidence folder, and Step 372 handoff prompt.
- Implementer: edited only the authorized auth redirect helper and focused test file.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/auth-redirect.test.ts` passed: 6 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 695 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/371-auth-redirect-userinfo-hardening/baseline-git-status.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/pre-stage-git-status.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/finding-note.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/source-diff.patch`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-diff-check.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-focused-tests.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-advisor-state-initial.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-advisor-state.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-terminal-loop-state.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-typecheck.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-lint.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-npm-test.txt`
- `audit-reports/371-auth-redirect-userinfo-hardening/validation-build.txt`

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

Step 371 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside auth redirect callback handling

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/auth/redirect.ts`
- `tests/auth-redirect.test.ts`
- `audit-reports/371_AUTH_REDIRECT_USERINFO_HARDENING.md`
- `audit-reports/371_NEXT_PROMPT_DRAFT.md`
- `audit-reports/371-auth-redirect-userinfo-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens Auth.js redirect helper userinfo handling only. It does not change auth providers, session validation, middleware matching, callback UI behavior, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
