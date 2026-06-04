# Step 211 - Search Everywhere Scanner Coverage

## Scope

Updated `scripts/audit-ai-marketing-copy.mjs` and `tests/content-quality-policy.test.ts`.

## Scanner Improvements

- Added a `smooth-checkout` review-only pattern.
- Added explicit `opengraph-social-preview` classification for `src/app/opengraph-image.tsx`.
- Added explicit `structured-data` classification for `src/backend/seo/structured-data.ts`.
- Preserved existing hard-blocked and review-only patterns.
- Preserved private env skipping.
- Preserved internal technical false-positive handling for trusted fetch/site host terms.

## Tests Added

- Extended review-only tests to cover `smooth-checkout`.
- Added tests that verify structured data and OpenGraph image surfaces are classified explicitly.
- Added tests that verify social-preview findings are not hidden as generic source code.

## Findings Impact

- Baseline before edits: 55 findings.
- After edits and scanner update: 54 findings.
- The resolved finding is the OpenGraph image authenticity/smooth-checkout line.

## Result

The scanner is more precise and was not weakened to hide findings.
