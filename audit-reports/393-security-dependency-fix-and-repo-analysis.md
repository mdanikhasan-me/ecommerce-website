# 393 Security Dependency Fix And Repo Analysis

## Scope

- User request: run a repository security scan, fix the found issue, and use five agents for broader analysis.
- Formal Codex Security Deep Security Scan status: not claimed as completed. The current Deep Security Scan skill requires exactly six discovery workers and Codex Security artifact orchestration; this session proceeded with the user's requested five-agent analysis plus local scan/validation.
- Local scan/fix scope: dependency audit, production-only dependency audit, package-signature audit, dependency-tree verification, build/typecheck/lint/test validation, and read-only multi-agent repository review.
- Runtime/security source files were not changed in this step.

## Baseline State

- Baseline commit before this fix: `dc7016b style: polish invoice pdf layout`.
- Working tree already contained unrelated protected local changes:
  - `public/assets/icons/ui/categories/*.svg`
  - `public/uploads/admin/banners/hero/`
- Those protected paths were left unstaged and were not part of this fix.

## Dependency Security Findings

- `npm audit` originally reported three moderate findings:
  - `postcss <8.5.10`, reachable from the top-level PostCSS dependency and Next's nested PostCSS dependency.
  - `brace-expansion 5.0.5`, reachable through `@typescript-eslint/typescript-estree` / `minimatch@10.2.5`.
- `npm audit --omit=dev` originally reported two moderate production findings from PostCSS/Next.
- No high-confidence committed secrets were found in tracked files during the local pattern scan; private env files were not used as scan inputs.
- The only `dangerouslySetInnerHTML` path observed was the JSON-LD renderer, which uses the existing serializer escaping `<`, `>`, `&`, U+2028, and U+2029.

## Dependency Fix

### Before

- Top-level `postcss` allowed vulnerable releases through `^8`.
- Next retained a nested `postcss@8.4.31`.
- `@typescript-eslint/typescript-estree` resolved `minimatch@10.2.5` with `brace-expansion@5.0.5`.

### Changes

- Updated direct dev dependency `postcss` to `^8.5.15`.
- Added a scoped override forcing `next` to resolve `postcss@8.5.15`.
- Added a scoped override forcing `minimatch@10.2.5` to resolve `brace-expansion@5.0.6`.
- Regenerated `package-lock.json` and refreshed `node_modules` with `npm install --ignore-scripts`.

### After

- `npm audit`: zero vulnerabilities.
- `npm audit --omit=dev`: zero vulnerabilities.
- `npm ls postcss brace-expansion next --all` confirms:
  - `next@15.5.18` resolves to deduped `postcss@8.5.15`.
  - top-level `postcss@8.5.15` is installed.
  - `minimatch@10.2.5` resolves to overridden `brace-expansion@5.0.6`.
  - older `brace-expansion@1.1.14` remains through `minimatch@3.1.5`, but it is not flagged by current npm audit.

## Five-Agent Read-Only Analysis

### Dependency / Package Tree

- The dependency audit findings are resolved in the current installed tree.
- `package.json` and `package-lock.json` must be kept together because the lockfile does not independently preserve the top-level override intent.
- Residual package-management risk: the fix depends on npm override behavior. A non-npm installer or older npm version could resolve differently.

### Git / Guardrails

- Safe files to stage for this step:
  - `package.json`
  - `package-lock.json`
  - `audit-reports/393-security-dependency-fix-and-repo-analysis.md`
- Must remain unstaged:
  - `public/assets/icons/ui/categories/*.svg`
  - `public/uploads/admin/banners/hero/`
- No env, DB migration, deployment, provider, payment, tracking, seller, footer, or category-media-storage files are part of this fix.

### Backend / Routes Security Risks To Track Later

- High: JWT session role and active-state are copied at sign-in; admin demotion/deactivation may not revoke existing sessions until token refresh/expiry.
- High: admin user list/detail routes should use explicit `select` fields to avoid returning password hashes or other unintended user columns.
- Medium-high: any `ADMIN` can perform sensitive report exports and promote users to `ADMIN`; finer-grained permissions should be considered.
- Medium: middleware is a session-cookie hint only; protected pages/routes must continue doing real server-side auth checks.
- Medium: request-origin guard depends on correctly trusted forwarded host/proto headers.
- Medium: rate limiting is process-local and not sufficient for distributed production or login/admin-heavy abuse cases.
- Medium: `/api/orders` has mixed buyer/admin behavior and should use explicit response contracts.
- Medium: coupon usage/order-number/money precision races remain future work.

### Validation Coverage

- The full test suite is broad and covers request guards, callback URLs, security headers, media path safety, PII boundaries, SEO policy, admin validation, buyer order/return/invoice contracts, and workflow guardrails.
- Coverage limitation: many tests are static source-contract checks rather than live browser/E2E or DB-backed integration tests.
- Dependency-specific proof comes from `npm audit`, production-only audit, `npm ls`, and package-signature verification.

### Docs / Workflow

- Latest report naming uses lowercase hyphenated files; this report follows that convention.
- Existing workflow scripts may still parse only uppercase underscore reports and may not recognize newer step reports.
- README dependency/tooling and seller-marketplace wording have stale areas, but those were not changed in this dependency fix.

## Validation Results

- `npm audit --json`: passed, zero vulnerabilities.
- `npm audit --omit=dev --json`: passed, zero vulnerabilities.
- `npm ls postcss brace-expansion next --all`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: passed, 738 tests.
- `npm audit signatures`: passed, 415 package signatures and 60 attestations verified.

## Files Changed

- `package.json`
- `package-lock.json`
- `audit-reports/393-security-dependency-fix-and-repo-analysis.md`

## Files To Stage

```powershell
git add -- package.json package-lock.json audit-reports/393-security-dependency-fix-and-repo-analysis.md
```

## Guardrail Confirmation

- Did not stage or edit `public/assets/icons/ui/categories/*.svg`.
- Did not stage or edit `public/uploads/admin/banners/hero/`.
- Did not read private env files as scan inputs.
- Did not run migrations, `db push`, seed/reset, deployment commands, provider CLIs, or payment/tracking changes.
- Did not change Google OAuth, category media storage logic, footer payment assets, seller logic, mobile navigation, CSP enforcement, or rate-limit code.

## Remaining Risks

- Formal Codex Security Deep Security Scan remains incomplete because that workflow requires six discovery workers and a full artifact pipeline; this step used the requested five-agent analysis instead.
- Admin session revocation, admin user response `select` hardening, report-export permissions, and production-grade rate limiting should be handled as separate security hardening steps.
- Dependency overrides should be rechecked after future Next/eslint dependency upgrades.

## Commit / Push Status

- Pending at report creation time.

## Recommended Next Step

- Commit and push the exact dependency/report files, leaving unrelated protected local media/icon files unstaged.
