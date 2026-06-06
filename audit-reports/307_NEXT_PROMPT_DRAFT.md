# Step 307 Next Prompt Draft

Recommended next step: add route-safe support FAQ anchors and align Help quick-action deep links.

## Recommended Next Step

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:
- Step 307: audit-reports/307_HELP_PAGE_AND_GLOBAL_NAVBAR_REDESIGN.md
- Step 307 redesigned the global storefront navbar and /help page, removed the free-delivery strip, preserved auth/cart/search behavior, added production browser screenshots, and intentionally avoided missing /collections, /deals, and /payments routes.

Goal for Step 308:
Run a bounded FAQ/support-anchor polish so Help quick actions can deep-link to existing FAQ/support sections without adding fake routes or enabling payment/tracking integrations.

Read first:
- audit-reports/307_HELP_PAGE_AND_GLOBAL_NAVBAR_REDESIGN.md
- audit-reports/307-help-page-navbar-redesign/browser-screenshot-summary.json
- src/app/(store)/help/page.tsx
- src/app/(store)/faq/page.tsx
- src/app/(store)/contact/page.tsx
- src/shared/contact.ts
- tests/help-navbar-redesign.test.ts

Allowed work:
- Inspect current FAQ/contact/help support content and active routes before editing.
- Add stable section IDs or anchors to existing FAQ/support sections only where useful.
- Update /help quick-action links to route-safe anchors such as /faq#payments only if the target anchor exists.
- Add focused source-level tests for FAQ anchors, Help deep links, old-copy absence, route safety, and no fake payment/tracking claims.
- Add browser evidence for /help, /faq anchor navigation, and one mobile viewport.
- Create audit-reports/308_SUPPORT_FAQ_ANCHOR_POLISH.md and audit-reports/308_NEXT_PROMPT_DRAFT.md.

Allowed files:
- src/app/(store)/help/page.tsx
- src/app/(store)/faq/page.tsx
- src/app/(store)/contact/page.tsx only if needed for existing support address/contact consistency
- tests/*help* or tests/*faq* focused test files
- audit-reports/308_SUPPORT_FAQ_ANCHOR_POLISH.md
- audit-reports/308_NEXT_PROMPT_DRAFT.md
- audit-reports/308-support-faq-anchor-polish/**

Strict guardrails:
- Do not create /payments, /collections, /deals, flash-sale, guest-tracking, seller, or provider routes.
- Do not enable or imply online payment provider integration; payment help remains informational only.
- Do not change auth, checkout, order creation, tracking privacy boundaries, admin media, product lifecycle, Prisma schema, migrations, seed/reset/db push, SQL, packages, env files, footer payment logos, category SVG files, or global navbar layout.
- Do not touch public/uploads or source product/category/banner media.
- Do not print secrets or full DB URLs.
- Use exact-file staging only.

Validation:
- git status --short
- git diff --cached --name-only
- git diff --check on exact changed files
- npm run db:url:safety
- npm run db:prisma:local:validate
- npm run db:prisma:local:generate
- focused tests for FAQ/help anchors
- npm run typecheck
- npm run lint
- npm run build
- production browser evidence for /help and /faq mobile/desktop anchor behavior

Commit:
Stage exact changed files only and commit with:
feat: polish support faq anchors

Stop conditions:
- Stop if any prohibited file is touched or staged.
- Stop if browser evidence shows missing anchors, broken navigation, visible layout overlap, horizontal overflow, console errors, server errors, failed requests, missing icons, or fake payment/tracking claims.
- Stop if validation fails for a task-caused reason.

Final response:
Give me only:
1. Summary of Step 308 work
2. Files changed/staged/committed
3. FAQ/help anchor result
4. Browser evidence result
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
