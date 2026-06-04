# Staging Search Verification Runbook

## Purpose

This runbook defines Boilabin's provider-neutral staging and Search Everywhere verification workflow before public launch.

It does not choose a hosting provider, deploy code, connect DNS, submit URLs, configure Search Console, configure Bing Webmaster Tools, configure Merchant Center, enable payment, enable tracking, or change production settings.

## Current Boundary

- Boilabin is pre-launch.
- The future canonical domain is `https://boilabin.com`.
- Local testing uses localhost or `127.0.0.1`.
- Hosted staging does not exist yet.
- Search Console, Bing Webmaster Tools, Merchant Center, rich-result URL validation, social preview validation, Core Web Vitals field data, and AI answer testing require hosted pages later.

## Local Checks Before Staging

Run these before any hosted staging attempt:

1. `npm run db:url:safety`
2. `node scripts/audit-ai-marketing-copy.mjs`
3. `node scripts/audit-search-verification-readiness.mjs`
4. `.\node_modules\.bin\tsx --test tests\search-verification-readiness.test.ts tests\seo-policy.test.ts tests\content-quality-policy.test.ts`
5. `npm run typecheck`
6. `npm run lint`
7. `npm test`
8. `npm run build`

These checks verify repository readiness only. They do not prove indexing, social preview rendering, or external search tool status.

## Hosted Staging Rules

- Use a staging URL separate from `https://boilabin.com`.
- Keep staging out of search indexes through provider access protection, `noindex`, robots policy, or another approved staging control.
- Do not submit staging sitemaps to Google or Bing.
- Do not point production DNS to staging.
- Configure `AUTH_URL`, `NEXTAUTH_URL`, `APP_URL`, and `CSRF_ALLOWED_ORIGINS` to the exact staging origin.
- Keep `NEXT_PUBLIC_SITE_URL` policy reviewed because production canonical identity remains `https://boilabin.com`.
- Keep real secrets in the provider secret manager only.

## Production Domain Rules

- Connect `https://boilabin.com` only after staging passes build, browser smoke, auth boundary, SEO, media, and human review.
- Run final robots, sitemap, canonical, structured-data, OpenGraph, and page-speed checks against the production domain only after DNS points to hosting.
- Do not claim Search Console or Bing verification until ownership is actually completed in those tools.

## Search Surface Checklist

| Surface | Local check | Hosted staging check | Production check |
| --- | --- | --- | --- |
| Build | `npm run build` | staging deploy logs | production deploy logs |
| Robots | source/tests | fetch `/robots.txt` | fetch production `/robots.txt` |
| Sitemap | source/tests/build | fetch `/sitemap.xml` without submitting | submit only production sitemap later |
| Canonical URL | tests/source | inspect generated metadata | verify production canonical origin |
| Noindex | tests/source | inspect staging policy | ensure public pages are indexable and private pages blocked/noindexed |
| Structured data | tests/source | browser devtools and validators | Google Rich Results/Schema.org validators |
| OpenGraph | source/tests | staging social preview if supported | production social preview tools |
| Images | source/docs | hosted image URLs render | product/category image indexing readiness |

## Evidence To Collect Later

- Date and commit deployed.
- Staging URL.
- Build log summary without secrets.
- `/robots.txt` response.
- `/sitemap.xml` response.
- Representative product/category page metadata screenshots.
- JSON-LD validator screenshots.
- OpenGraph preview screenshots.
- Search Console property verification evidence.
- Bing Webmaster property verification evidence.
- Core Web Vitals/PageSpeed results.

## Stop Conditions

Stop and do not launch if:

- staging is indexable unintentionally;
- canonical URLs point to localhost;
- private routes appear in sitemap;
- payment/tracking/seller features become enabled accidentally;
- deploy logs expose secrets;
- auth callbacks point to the wrong origin;
- product pages have broken visible images;
- schema claims unsupported shipping, payment, return, review, or merchant facts.
