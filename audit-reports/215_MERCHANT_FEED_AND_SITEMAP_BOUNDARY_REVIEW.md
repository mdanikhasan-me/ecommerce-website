# Step 215 - Merchant Feed And Sitemap Boundary Review

## Scope

Reviewed merchant feed and sitemap boundaries without implementing feed or sitemap behavior.

## Merchant Feed Readiness

Boilabin is not ready for a merchant feed implementation until these are decided and tested:

- stable product IDs/SKUs;
- product title and description policy;
- primary and additional image policy;
- price sync and sale-price policy;
- stock/availability sync policy;
- shipping policy details;
- return/refund policy details;
- GTIN/MPN/brand availability or fallback policy;
- online payment provider status, if any;
- feed refresh cadence;
- batch/export size strategy;
- validation against Google Merchant Center requirements.

## Sitemap Boundary

Current sitemap tests keep static public pages and exclude private/utility routes. Future scale work should review:

- sitemap index need;
- product/category pagination;
- product lifecycle visibility;
- deleted/unpublished product handling;
- DB-backed generation performance;
- last-modified accuracy;
- image sitemap need.

## Decision

- Do not implement merchant feed yet.
- Do not add feed readiness claims to schema/docs as a completed capability.
- Do not change sitemap behavior in this batch.

## Result

Merchant feed and sitemap scaling remain future technical batches after schema/content facts are stable.
