# Step 137 Prompt Draft - Admin Export Control Gap Review

Copy-paste prompt for a future standalone step only:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 137:
Create a report-only admin export control gap review after Steps 134-136 and choose exactly one next safe standalone Step 138 prompt.

Context:

* Step 134 added admin export confirmation UI.
* Step 135 hardened no-DB/static QA.
* Step 136 added CSV handling guidance.

Allowed files:

* `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
* `audit-reports/137_NEXT_PROMPT_DRAFT.md`

Requirements:

1. Review Steps 134-136.
2. Classify remaining gaps:
   * export audit logging,
   * role-separated export permissions,
   * masking/redaction,
   * DB/auth-backed route tests,
   * SKU sensitivity,
   * CSV retention policy finalization,
   * provider/storage decisions.
3. Choose exactly one next safe standalone Step 138 prompt.
4. Do not implement source/test changes.
5. Do not execute Step 138.

Strict guardrails:

* Do not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database or run export routes.
* Do not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, or audit logging behavior.
* Do not edit Prisma schema, migrations, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, provider/deployment files, footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
* Do not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
* Do not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

Validation commands:

* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit only if validation passes and the staged set is exact.

Final response format:

1. Summary of Step 137 work
2. Files changed
3. Gap review result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
