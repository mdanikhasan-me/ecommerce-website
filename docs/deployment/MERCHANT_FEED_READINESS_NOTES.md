# Merchant Feed Readiness Notes

## Purpose

This document describes future Merchant Center/feed readiness. It does not implement or submit a feed.

## Current Status

- Product JSON-LD exists.
- Merchant feed export does not exist.
- Merchant Center is not configured.
- No feed submission is approved.
- Cash on Delivery is the only supported payment claim.
- Online gateway claims are not approved.

## Likely Required Product Data

| Field | Current readiness | Notes |
| --- | --- | --- |
| `id` | needs policy | Stable SKU/product ID policy needed. |
| `title` | partial | Product names exist; feed titles need length/quality rules. |
| `description` | partial | Seed/demo copy still has scanner findings; production descriptions need review. |
| `link` | partial | Product canonical URLs exist but hosted production URL is needed. |
| `image_link` | partial | Stable crawlable product images needed. |
| `additional_image_link` | future | Multiple image policy needed. |
| `price` | partial | Product price exists; feed sync policy needed. |
| `availability` | partial | Product visibility/stock policy exists; feed mapping needed. |
| `brand` | unknown | Do not invent. |
| `gtin`/`mpn` | unknown | Do not invent. |
| `condition` | future | Owner/data decision needed. |
| `shipping` | partial | Shipping policy must be complete and account/feed-aligned. |
| `return_policy` | partial | Return policy needs final owner-approved detail. |

## Feed Boundaries

- Do not submit a feed before product data policy is approved.
- Do not include placeholder, incorrect, or unrelated images.
- Do not claim identifiers that are missing.
- Do not enable online payment claims by feed.
- Do not treat structured data as a substitute for Merchant Center account setup.

## Future Owner Decisions

- Product identifier policy.
- Brand/GTIN/MPN handling.
- Image quality and variant policy.
- Shipping and return policy finalization.
- Feed refresh cadence.
- Feed batching/export method.
- Merchant Center account ownership and access.
