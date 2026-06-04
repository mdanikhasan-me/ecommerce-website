# Step 208 - FAQ, Breadcrumb, And ItemList Schema Alignment

## Scope

Reviewed FAQ, BreadcrumbList, and ItemList JSON-LD generation.

## Findings

- FAQ schema is generated directly from the visible FAQ page array.
- No hidden FAQ questions or answers are added.
- Breadcrumb schema is generated from caller-provided breadcrumb items and canonical URLs.
- ItemList schema is generated from visible product list inputs.
- ItemList products include name, URL, optional image, and price offer in BDT.

## Changes Made

- No source changes were needed for FAQ, Breadcrumb, or ItemList schema.
- Existing tests already cover breadcrumb and ItemList absolute URLs.
- Added broader SEO tests that include FAQ JSON-LD availability.

## Result

FAQ, Breadcrumb, and ItemList schema remain factual and visible-input driven.
