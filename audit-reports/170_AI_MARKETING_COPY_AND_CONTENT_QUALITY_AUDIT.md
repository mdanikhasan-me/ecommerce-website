# Step 170 - AI Marketing Copy And Content Quality Audit

## Scope

This loop audited AI-sounding and unsupported marketing copy risk. It added a docs guideline and a no-runtime audit guardrail.

Created:

- `docs/CONTENT_QUALITY_GUIDELINES.md`
- `scripts/audit-ai-marketing-copy.mjs`
- `tests/content-quality-policy.test.ts`

## Current Findings

The content scan found phrases that should be reviewed before launch:

- README uses "premium" positioning.
- Layout metadata uses "best price" style keywords/copy.
- Site config uses "premium online marketplace".
- Homepage subtitles include "premium quality" and "Loved by thousands of customers".
- About page uses "reliable", "premium", "authentic", and "trusted" language.
- Seed/demo product descriptions include vendor-style claims such as "industry-leading" and "world-class".

Some terms are legitimate product state labels, such as `isBestSeller`, but buyer-facing copy should avoid unsupported claims.

## Why This Matters

Generic trust language does not prove trust. It can sound fake, especially in a pre-launch marketplace. Search engines and AI answer systems need factual page content, not slogans.

## Guideline Result

The new guideline recommends:

- honest factual copy;
- product/category-specific details;
- avoiding bragging without proof;
- writing for humans first;
- using factual Bangladesh context;
- avoiding "trusted", "premium", "best", and "leading" unless supported.

## Guardrail Result

The new script scans selected content/code roots for hype phrases and reports findings. It exits successfully because this is an audit tool, not a release blocker yet.

## Changes Not Made

No live copy was rewritten in this batch. This avoids accidental visual/UI shifts and keeps the batch audit-first.

## Recommended Follow-Up

Run a dedicated content cleanup batch that rewrites only safe visible copy and metadata, with before/after examples and no backend behavior changes.
