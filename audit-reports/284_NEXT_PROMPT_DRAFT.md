# Step 284 Next Prompt Draft

## Validation Results

Step 283 validation is recorded in `audit-reports/283_PUBLIC_STOREFRONT_COPY_BROWSER_ACCEPTANCE_QA.md`.

## Recommended Next Step

Create an owner policy/legal decision checklist before more launch-facing copy, payment, shipping, support, or provider work proceeds.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 283: `audit-reports/283_PUBLIC_STOREFRONT_COPY_BROWSER_ACCEPTANCE_QA.md`
* Step 283 performed rendered public storefront copy/browser acceptance QA after Step 282.
* It found and fixed only small text-only missed copy issues in shipping/contact/FAQ/order-confirmation/checkout/seed/SEO keyword copy.
* It added targeted no-DB content-quality guardrail coverage.
* Marketing-copy audit reports 0 findings.
* Production HTTP smoke passed.
* Custom production CDP evidence passed across the public route/viewport matrix with product-view POSTs intercepted and fulfilled locally with 204.
* The stock browser runtime helper was intentionally skipped because it visits product detail without product-view request interception.
* Validation passed: DB URL safety, Prisma local validate/generate, targeted content/SEO/Flash tests, typecheck, lint, full tests, build, production HTTP smoke, and custom browser evidence.
* No schema, migrations, DB state, API behavior, auth behavior, checkout behavior, payment processing, tracking implementation, seller behavior, SEO architecture, media lifecycle, assets, or visual design changed.

Step 284 title:
Owner policy and legal launch-copy decision checklist

Goal:
Create a practical owner decision checklist for launch-facing policy claims so future copy, checkout, payment, shipping, returns, support, and SEO work does not invent unsupported promises.

This is planning/docs only.

Do not change runtime behavior.
Do not change public copy yet.
Do not change payment, tracking, seller, schema, migrations, API contracts, SEO architecture, media lifecycle, or visual design.

Read first:

* `audit-reports/282_PUBLIC_CLAIMS_COPY_CORRECTION.md`
* `audit-reports/283_PUBLIC_STOREFRONT_COPY_BROWSER_ACCEPTANCE_QA.md`
* `docs/CONTENT_QUALITY_GUIDELINES.md`
* `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md`
* `src/app/(store)/shipping/page.tsx`
* `src/app/(store)/returns/page.tsx`
* `src/app/(store)/faq/page.tsx`
* `src/app/(store)/help/page.tsx`
* `src/app/(store)/contact/page.tsx`
* `src/backend/config/payment.ts`
* `src/backend/config/site.ts`
* `src/backend/seo/constants.ts`
* `tests/content-quality-policy.test.ts`

Tasks:

1. Create a launch policy decision map for:
   * delivery zones and timing language;
   * free-shipping threshold;
   * COD availability and eligibility;
   * disabled online payment gateway wording;
   * returns/refunds review process;
   * refund timing language;
   * support hours and response-time language;
   * order modification/cancellation support;
   * tracking/status wording;
   * warranty/source/authenticity/product-origin claims;
   * seller marketplace readiness claims;
   * future mobile app compatibility concerns.

2. Classify each item as:
   * currently supported by repo/config;
   * needs owner decision;
   * needs legal/policy review;
   * blocked until payment/tracking/provider integration;
   * blocked until DB-backed authenticated QA;
   * should not be claimed pre-launch.

3. Produce owner-facing recommended wording rules:
   * allowed wording;
   * forbidden wording;
   * examples of safe copy;
   * examples of copy requiring approval.

4. Do not change source copy unless a documentation contradiction is found inside the new report itself.

Validation commands:

* `git status --short`
* `git log -3 --oneline`
* `git diff --cached --name-only`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `npx tsx --test tests/content-quality-policy.test.ts tests/seo-policy.test.ts tests/flash-deals-removal.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:

Create:

* `audit-reports/284_OWNER_POLICY_LEGAL_DECISION_CHECKLIST.md`

The report must include:

1. Scope and starting state.
2. Files inspected.
3. Launch policy decision map.
4. Supported claims.
5. Claims requiring owner decision.
6. Claims requiring legal/policy review.
7. Claims blocked by payment/tracking/provider/DB-backed work.
8. Safe wording rules.
9. Forbidden wording rules.
10. Future mobile app compatibility considerations.
11. Validation results.
12. Confirmation no runtime/source behavior changed.
13. Remaining risks.
14. Recommended next step.

Create:

* `audit-reports/285_NEXT_PROMPT_DRAFT.md`

Commit:

If only reports/docs are added:

* `docs: add owner policy launch-copy checklist`

Final response format:

1. Summary of Step 284 work.
2. Whether this was report-only.
3. Files changed/staged/committed.
4. Policy areas mapped.
5. Supported vs owner/legal-blocked claim result.
6. Validation results.
7. Commit hash/oneline, or reason no commit happened.
8. Confirmation no prohibited files were touched.
9. Remaining risks.
10. Recommended next step.
```
