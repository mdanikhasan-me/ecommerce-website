# Step 212 - SEO Schema Test Hardening

## Scope

Updated `tests/seo-policy.test.ts` and `tests/content-quality-policy.test.ts`.

## SEO Tests Added

- Product Offer schema remains useful without unsupported merchant claims.
- Shipping schema keeps rate/destination and omits exact delivery time.
- Return schema keeps the seven-day finite window and omits return method.
- Schema does not invent GTIN, MPN, authenticity, or payment provider claims.
- Metadata fallbacks stay canonical and avoid hard-blocked hype.
- Organization, WebSite, OnlineStore, and FAQ JSON-LD remain present and factual.

## Content Scanner Tests Added

- Review-only `smooth-checkout` detection.
- Explicit structured-data classification.
- Explicit OpenGraph/social-preview classification.

## Targeted Validation

- `.\node_modules\.bin\tsx --test tests\seo-policy.test.ts tests\content-quality-policy.test.ts`: passed, 18/18 tests.

## Result

Schema, metadata, and social preview guardrails now have direct regression coverage.
