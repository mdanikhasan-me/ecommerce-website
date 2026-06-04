# Step 231 - Env, Domain, Canonical, And Staging Boundary

## Scope

Created `docs/deployment/STAGING_SEARCH_VERIFICATION_RUNBOOK.md`.

## Boundary Result

- Future production canonical domain remains `https://boilabin.com`.
- Staging URL must be separate and noindex/access-protected.
- Local auth/testing remains localhost or `127.0.0.1`.
- Hosted auth variables must match the hosted origin.
- Real secrets must live in provider secret manager only.
- `NEXT_PUBLIC_*` variables are public and must not contain secrets.

## What Cannot Be Verified Without Hosting

- Search Console ownership.
- Bing Webmaster ownership.
- Production sitemap submission.
- Social preview behavior from public URL.
- Rich-result URL validation.
- PageSpeed public URL result.
- Core Web Vitals field data.

## Result

The staging/search runbook clarifies local, staging, and production boundaries without choosing a provider.
