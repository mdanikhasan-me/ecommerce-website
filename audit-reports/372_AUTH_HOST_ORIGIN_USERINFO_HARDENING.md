# Step 372 Auth Host Origin Userinfo Hardening

## Scope

Step 372 skips the still-blocked media decision and completes a bounded non-media auth host origin hardening step.

Latest commit before Step 372:

```text
8dcc0f0 fix: harden auth redirect userinfo
```

Step 371 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Step 369 hardened auth host origin parsing so unsupported protocols are ignored, and Step 371 hardened auth redirect URL handling so username/password userinfo is rejected.

`src/backend/auth/host.ts` still accepted HTTP(S) origin configuration values containing URL userinfo credentials. For example:

- `https://user:pass@localhost:3000`
- `https://user:pass@shop.example.com`

The URL parser resolves those values to clean origins such as `https://localhost:3000` or `https://shop.example.com`. That meant credential-bearing config values could still be treated as valid canonical origins, local trust inputs, or warning suppression inputs.

## Fix

Updated:

- `src/backend/auth/host.ts`
- `tests/auth-host.test.ts`

`parseOrigin` now rejects URL username/password userinfo before returning a canonical auth origin.

Focused tests cover:

- local production host trust no longer accepting `https://user:pass@localhost:3000`
- missing-origin warnings when both auth origins contain userinfo
- clean fallback behavior when a userinfo-bearing `AUTH_URL` is paired with a valid `NEXTAUTH_URL`

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 371 handoff, Step 370 context, Step 321 media gate, current status, auth host origin helper, and focused auth host tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused auth host tests plus standard validation.
- Docs Auditor: created this Step 372 report, evidence folder, and Step 373 handoff prompt.
- Implementer: edited only the auth host helper and focused test file.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/auth-host.test.ts` passed: 11 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 696 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/372-auth-host-origin-userinfo-hardening/baseline-git-status.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/pre-stage-git-status.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/finding-note.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/source-diff.patch`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-diff-check.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-focused-tests.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-advisor-state-initial.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-advisor-state.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-terminal-loop-state.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-typecheck.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-lint.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-npm-test.txt`
- `audit-reports/372-auth-host-origin-userinfo-hardening/validation-build.txt`

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

Step 372 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside auth host configuration handling

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/auth/host.ts`
- `tests/auth-host.test.ts`
- `audit-reports/372_AUTH_HOST_ORIGIN_USERINFO_HARDENING.md`
- `audit-reports/372_NEXT_PROMPT_DRAFT.md`
- `audit-reports/372-auth-host-origin-userinfo-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens auth host origin parsing only. It does not change auth providers, session validation, middleware matching, callback UI behavior, payment/tracking/seller behavior, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
