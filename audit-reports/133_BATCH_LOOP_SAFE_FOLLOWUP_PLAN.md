# Step 133 - Batch Loop Safe Follow-Up Plan

## Scope

Used Loop 3 of the approved Terminal Batch Loop mode to create a report-only admin report export operational controls policy audit.

This step did not implement export controls. It did not edit source, tests, scripts, routes, runtime config, Prisma files, env files, package files, Docker files, assets, visual files, or frontend/admin behavior.

## Latest Commit Verified

Latest commit verified before Loop 3 report creation:

```text
b0d70b4 docs: review batch loop roadmap
```

## Initial Git Status

Initial `git status --short` after Loop 2 was clean.

Initial staged files were none.

## Previous Loop Reviewer Check

Loop 2 completed successfully and committed:

```text
b0d70b4 docs: review batch loop roadmap
```

The post-Loop-2 reviewer check showed a clean working tree and no staged files.

## Files Reviewed

Reviewed:

- `audit-reports/132_BATCH_LOOP_ROADMAP_REVIEW.md`
- `audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md`
- `audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md`
- `audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md`
- `audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md`
- `src/app/(admin)/admin/reports/page.tsx`
- `src/backend/admin/reports.ts`
- `tests/admin-reports.test.ts`

## Current Admin Export State

Current export behavior:

- Admin reports page renders direct CSV export links for orders, products, and customers.
- Export URLs still point to `/api/admin/reports/export` with type and date-range query parameters.
- Static metadata labels each report's sensitivity.
- UI now displays report sensitivity labels and warnings next to each export link.
- CSV payloads, field order, headers, route behavior, admin access behavior, masking state, redaction state, role separation state, and audit logging state remain unchanged.

Current no-DB test coverage:

- Date range parsing.
- CSV escaping, including spreadsheet formula-prefix protection.
- Static export sensitivity metadata.
- Metadata field order for current CSV contracts.
- UI-ready warning labels in metadata.

## Operational Controls Policy Audit

### Export Confirmation

Status: not implemented.

Recommended policy:

- Add a clear confirmation step before downloading customer/order/customer-account exports.
- Keep the existing export endpoint and CSV contract unchanged.
- Confirmation copy should use existing sensitivity metadata.
- Confirmation should be a UI-only guard first, not a route authorization change.
- Confirmation should not reveal raw rows or real customer data.

Safe future shape:

- A small admin export link/button component can require confirmation before navigation.
- No database connection is required for no-DB source-level tests.
- Browser verification can later confirm the visible behavior if approved.

### Sanitized Export Audit Logging

Status: not implemented.

Recommended policy:

- Future logging must be sanitized and bounded.
- Log only event type, report type, date-range shape, route pathname, method, safe status, actor role if already safely available, and short result code.
- Do not log CSV rows, customer names, emails, phone numbers, order numbers tied to real data, raw query strings, cookies, authorization headers, session tokens, private env values, or database connection strings.

Implementation dependency:

- Needs a separate design decision on where logs live locally, in staging, and in production.
- Should reuse existing security log sanitization patterns if implemented later.

### Role And Permission Separation

Status: not implemented.

Recommended policy:

- Treat export permission as narrower than general admin dashboard access.
- Orders export should require customer/order export permission.
- Customers export should require customer PII export permission.
- Products export should require business/catalog export permission if stock, sales, SKU, and active-state data remain included.

Implementation dependency:

- Needs a product/security decision and authenticated DB-backed tests.
- Should not be silently introduced in a report-only or no-DB helper step.

### Masking And Redaction

Status: not implemented.

Recommended policy:

- Do not change CSV field values until CSV consumers, admin workflows, and legal/business expectations are reviewed.
- Customer exports are the first masking candidate.
- Orders exports may need email/name treatment.
- Products export masking depends on SKU policy.

Implementation dependency:

- Needs explicit compatibility review because CSV payload changes can break admin workflows.

### CSV Retention And Download Handling

Status: not documented as a formal policy.

Recommended policy:

- Treat downloaded CSV files as sensitive local files.
- Do not share exports in public chats, tickets, or docs.
- Delete local exports when no longer needed.
- Avoid storing raw exports in repo folders.
- Use approved private storage later if a staging/production operations process needs retained exports.

Implementation dependency:

- Mostly documentation and operator training first.
- Persistent retention controls require provider/storage decisions later.

### SKU Sensitivity

Status: needs policy decision.

Recommended policy:

- Keep SKU marked as `unknown-needs-policy` until Boilabin decides whether SKUs are public catalog identifiers or internal inventory codes.
- If internal, products export remains business-sensitive.
- If public, SKU may be lower-risk but stock, sold count, and active state still keep the export business-sensitive.

## Mobile And API Stability Considerations

- CSV export routes are admin/file-response routes and should not be wrapped in JSON envelopes.
- Buyer/mobile APIs should remain stable and separate from admin export controls.
- Any future role/permission change should preserve clear unauthorized/forbidden contracts.
- Do not let admin CSV controls drive app-wide API response standardization.

## Control Classification

Safe to implement later without DB:

- Admin UI export confirmation using existing metadata.
- Static tests that verify confirmation copy/metadata wiring.
- Documentation for CSV retention and download handling.

Needs explicit product/security decision:

- Role/permission separation.
- SKU sensitivity classification.
- Masking/redaction rules.
- Export retention periods and approved storage location.

Needs authenticated DB-backed testing later:

- Route-level permission enforcement.
- Export audit logging that records actor identity.
- End-to-end admin export behavior.
- CSV row masking/redaction if implemented.

Should not change before staging/provider decisions:

- Persistent log storage.
- Production retention automation.
- Provider-specific export monitoring.
- Production-only secrets or storage integration.

## Recommended Implementation Order

1. Add UI export confirmation using existing metadata, with no DB and no CSV contract changes.
2. Add CSV retention/download handling guidance for admins.
3. Decide SKU sensitivity.
4. Decide export role/permission model.
5. Design sanitized export audit logging storage.
6. Add authenticated route tests in a safe DB-backed environment.
7. Implement route-level permission enforcement only after decisions and tests.
8. Consider masking/redaction only after compatibility review.

## Files Changed

- `audit-reports/133_BATCH_LOOP_SAFE_FOLLOWUP_PLAN.md`
- `audit-reports/133_NEXT_PROMPT_DRAFT.md`

## Runtime Behavior Changes

None.

## Validation Results

Final validation passed.

Commands run:

- `node scripts/boilabin-terminal-loop-state.mjs` - passed.
- `node scripts/boilabin-advisor-state.mjs` - passed.
- `npm run db:url:safety` - passed; the checker did not connect to a database.
- `npm run typecheck` - passed.
- `npm run lint` - passed with the existing Next.js lint deprecation notice only.
- `npm test` - passed, 333/333 tests.
- `npm run build` - passed; production build generated 72 static pages successfully.

## Prohibited Actions Not Performed

- Did not read private env files.
- Did not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
- Did not edit source, tests, scripts, routes, runtime config, Prisma files, env files, package files, Docker files, assets, or frontend/admin behavior.
- Did not run report export routes.
- Did not query a database.
- Did not run DB-backed tests.
- Did not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.
- Did not touch footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
- Did not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle work, or Flash Deals.
- Did not restore `/deals` or `/api/admin/flash-sales`.
- Did not execute a fourth loop.

## Remaining Risks

- Admin exports still rely on broad admin access.
- Export confirmation is not implemented yet.
- Export audit logging is not implemented yet.
- Role/permission separation is not implemented yet.
- Masking/redaction is not implemented yet.
- CSV retention/download handling remains policy guidance until documented or operationalized.
- Authenticated DB-backed admin export testing remains a future dedicated step.

## Recommended Next Step

Review `audit-reports/133_NEXT_PROMPT_DRAFT.md`. If acceptable, approve the next standalone Step 134 prompt for a bounded no-DB admin export confirmation UI implementation. Do not execute it automatically from this batch.
